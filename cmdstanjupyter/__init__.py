import argparse
import datetime
import logging
import os
from typing import Dict, Tuple

import cmdstanpy
import cmdstanpy.compiler_opts as copts
import humanize
from IPython.core.display import HTML
from IPython.core.magic import Magics, cell_magic, line_magic, magics_class

from IPython.display import Code, display
from pygments.formatters import HtmlFormatter

# from https://stackoverflow.com/questions/40085818/jupyter-notebook-output-cell-syntax-highlighting
formatter = HtmlFormatter()
display(HTML(f'<style>{ formatter.get_style_defs(".highlight") }</style>'))

logger = logging.getLogger("cmdstanjupyter")

STAN_FOLDER = ".stan"


def parse_args(argstring: str) -> Tuple[str, Dict, Dict]:
    # users can separate arguments with commas and/or whitespace
    parser = argparse.ArgumentParser(description="Process cmdstanpy arguments")
    parser.add_argument("variable_name", nargs="?", default="_stan_model")

    # stanc arguments
    parser.add_argument("-O", action="store_true", default=None)
    parser.add_argument("--allow_undefined", action="store_true", default=None)
    parser.add_argument(
        "--use-opencl", dest="use-opencl", action="store_true", default=None
    )
    parser.add_argument(
        "--warn-uninitialized",
        dest="warn-uninitialized",
        action="store_true",
        default=None,
    )
    parser.add_argument(
        "--warn-pedantic",
        dest="warn-pedantic",
        action="store_true",
        default=None,
    )
    parser.add_argument("--include_paths", nargs="*")
    parser.add_argument("--name")

    # cpp args
    parser.add_argument("--STAN_OPENCL", action="store_true", default=None)
    parser.add_argument("--OPENCL_DEVICE_ID", type=int)
    parser.add_argument("--OPENCL_PLATFORM_ID", type=int)
    parser.add_argument("--STAN_MPI", action="store_true", default=None)
    parser.add_argument("--STAN_THREADS", type=int)

    raw_args = vars(parser.parse_args(argstring.split()))

    stanc_args = {k: v for (k, v) in raw_args.items() if v is not None}

    variable_name = stanc_args.pop("variable_name")

    cpp_args = {}
    for arg in copts.CPP_OPTS:
        if arg in stanc_args:
            cpp_args[arg] = stanc_args.pop(arg)

    if not variable_name.isidentifier():
        raise ValueError(
            f"The variable name {variable_name} is "
            f"not a valid python variable name."
        )

    return variable_name, stanc_args, cpp_args


@magics_class
class StanMagics(Magics):
    def __init__(self, shell):
        super(StanMagics, self).__init__(shell)

    def compile_stan_model(self, file, variable_name, stan_opts, cpp_opts):
        if not os.path.exists(file):
            logger.error("File '%s' not found!", file)
            return False
        else:
            logger.info(
                'Creating CmdStanPy model & assigning it to variable "%s"',
                variable_name,
            )
            start = datetime.datetime.now()
            try:
                _stan_model = cmdstanpy.CmdStanModel(
                    stan_file=file,
                    stanc_options=stan_opts,
                    cpp_options=cpp_opts,
                    logger=logger,
                )
            except Exception:
                logger.error("Failed to compile stan program")
                return False

            end = datetime.datetime.now()
            delta = humanize.naturaldelta(end - start)

            self.shell.user_ns[variable_name] = _stan_model
            logger.info(
                (
                    'StanModel now available as variable "%s"!'
                    + "\n Compilation took %s."
                ),
                variable_name,
                delta,
            )
            return True

    @line_magic
    def stanf(self, line):
        """
        Allow jupyter notebook cells create a CmdStanPy.CmdStanModel object
        from a stan file specified in the magic %stanf. The CmdStanModel
        gets assigned to a variable in the notebook's namespace, either
        named _stan_model (the default), or a custom name (specified
        by writing %stanf [file] <variable_name>).
        """
        file, line = line.split(maxsplit=1)
        variable_name, stan_opts, cpp_opts = parse_args(line)

        if self.compile_stan_model(file, variable_name, stan_opts, cpp_opts):
            display(Code(filename=file, language="stan"))

    @cell_magic
    def stan(self, line, cell):
        """
        Allow jupyter notebook cells create a CmdStanPy.CmdStanModel object
        from Stan code in a cell that begins with %%stan. The CmdStanModel
        gets assigned to a variable in the notebook's namespace, either
        named _stan_model (the default), or a custom name (specified
        by writing %%stan <variable_name>).
        """

        variable_name, stan_opts, cpp_opts = parse_args(line)

        if not os.path.exists(STAN_FOLDER):
            os.mkdir(STAN_FOLDER)
        file = f"{STAN_FOLDER}/{variable_name}.stan"
        logger.info(f"Writing model to: {STAN_FOLDER}/{variable_name}.stan")
        with open(file, "w") as f:
            f.write(cell)

        self.compile_stan_model(file, variable_name, stan_opts, cpp_opts)


def load_ipython_extension(ipython):
    ipython.register_magics(StanMagics)


def unload_ipython_extension(ipython):
    # ipython.user_global_ns.pop('_stan_vars', None)
    pass
