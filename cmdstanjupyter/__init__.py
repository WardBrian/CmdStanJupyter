import argparse
import datetime
import logging
import os
from typing import Dict, Tuple

import cmdstanpy
import cmdstanpy.compiler_opts as copts
import humanize
import IPython
from IPython.core.magic import Magics, cell_magic, line_magic, magics_class


# from https://github.com/ipython/ipython/issues/11747#issuecomment-528694702
def display_source(file):
    def _jupyterlab_repr_html_(self):
        from pygments import highlight
        from pygments.formatters import HtmlFormatter

        fmt = HtmlFormatter()
        style = "<style>{}\n{}</style>".format(
            fmt.get_style_defs(".output_html"),
            fmt.get_style_defs(".jp-RenderedHTML"),
        )
        return style + highlight(self.data, self._get_lexer(), fmt)

    # Replace _repr_html_ with our own version that adds the 'jp-RenderedHTML'
    # class in addition to 'output_html'
    IPython.display.Code._repr_html_ = _jupyterlab_repr_html_
    return IPython.display.display(
        IPython.display.Code(filename=file, language="stan"),
    )


logger = logging.getLogger("cmdstanjupyter")

logging.basicConfig(level=logging.INFO)

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

    cpp_args = {k: v for (k, v) in raw_args.items() if v is not None}

    variable_name = cpp_args.pop("variable_name")

    stanc_args = {}
    for arg in copts.STANC_OPTS:
        if arg in cpp_args:
            stanc_args[arg] = cpp_args.pop(arg)

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
        try:
            file, line = line.split(maxsplit=1)
        except ValueError:
            raise RuntimeError("Failed to parse stanf, did you include the file name?")
        variable_name, stan_opts, cpp_opts = parse_args(line)

        if self.compile_stan_model(file, variable_name, stan_opts, cpp_opts):
            display_source(file)

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

        skip = False
        if os.path.exists(file):
            # don't overwrite existing if it's the same, saves comp time
            with open(file, "r") as f:
                if f.read() == cell:
                    logger.info(f"Reusing cached model file {file}")
                    skip = True

        if not skip:
            logger.info(f"Writing model to {file}")
            with open(file, "w") as f:
                f.write(cell)

        self.compile_stan_model(file, variable_name, stan_opts, cpp_opts)


def load_ipython_extension(ipython):
    ipython.register_magics(StanMagics)


def unload_ipython_extension(ipython):
    pass
