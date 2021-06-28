import datetime
import humanize
from typing import Tuple, Dict

import argparse
import os

from IPython.core.magic import Magics, cell_magic, magics_class, line_magic

from IPython.utils.capture import capture_output

# from https://stackoverflow.com/questions/40085818/jupyter-notebook-output-cell-syntax-highlighting
from IPython.display import Code, display

from pygments.formatters import HtmlFormatter
from IPython.core.display import HTML

formatter = HtmlFormatter()

display(HTML(f'<style>{ formatter.get_style_defs(".highlight") }</style>'))

        

from cmdstanpy import CmdStanModel

def parse_args(argstring: str) -> Tuple[str, Dict]:
    # users can separate arguments with commas and/or whitespace
    parser = argparse.ArgumentParser(description="Process cmdstanpy arguments.")
    parser.add_argument("variable_name", nargs="?", default="_stan_model")
    # parser.add_argument("--model_name")
    # TODO all stan/c++ args
    kwargs = vars(parser.parse_args(argstring.split()))

    variable_name = kwargs.pop("variable_name")

    if not variable_name.isidentifier():
        raise ValueError(
            f"The variable name {variable_name} is "
            f"not a valid python variable name."
        )

    # set defaults:
    # if kwargs["model_name"] is None:
    #     kwargs["model_name"] = variable_name

    return variable_name, kwargs, {}


@magics_class
class StanMagics(Magics):
    def __init__(self, shell):
        super(StanMagics, self).__init__(shell)

    @line_magic
    def stanfile(self, line):
        # TODO parse better
        model, file = line.split()
        if not os.path.exists(file):
            print(f"File '{file}' not found!")
            return
        else:
            start = datetime.datetime.now()
            try:
                with capture_output(display=False) as capture:
                        _stan_model = CmdStanModel(stan_file=file)
            except Exception:
                print(f"Error creating Stan model:")
                print(capture)
                raise
            end = datetime.datetime.now()
            delta = humanize.naturaldelta(end - start)

            self.shell.user_ns[model] = _stan_model
            display(Code(filename=file, language='stan'))
            print(
                f'Stan Model now available as variable "{model}"!\n'
                f"Compilation took {delta}."
            )

    @cell_magic
    def stan(self, line, cell):
        """
        Allow jupyter notebook cells create a CmdStanPy.CmdStanModel object from
        Stan code in a cell that begins with %%stan. The CmdStanPy.CmdStanModel
        gets assigned to a variable in the notebook's namespace, either
        named _stan_model (the default), or a custom name (specified
        by writing %%stan <variable_name>).
        """

        variable_name, stan_opts, cpp_opts = parse_args(line)

        print(
            f"Creating CmdStanPy model & assigning it to variable "
            f'name "{variable_name}".'
        )

        if not os.path.exists('stan'):
            os.mkdir('stan')
        file = f'stan/{variable_name}.stan'
        print(f"Writing model to: stan/{variable_name}.stan")
        with open(file, 'w') as f:
            f.write(cell)

        print(f"Stan options:\n", stan_opts)
        print(f"C++ options:\n", cpp_opts)
        start = datetime.datetime.now()
        try:
            with capture_output(display=False) as capture:
                    _stan_model = CmdStanModel(stan_file=file, stanc_options=stan_opts, cpp_options=cpp_opts)
        except Exception:
            print(f"Error creating Stan model:")
            print(capture)
            raise
        end = datetime.datetime.now()
        delta = humanize.naturaldelta(end - start)

        self.shell.user_ns[variable_name] = _stan_model
        print(
            f'StanModel now available as variable "{variable_name}"!\n'
            f"Compilation took {delta}."
        )


def load_ipython_extension(ipython):
    ipython.register_magics(StanMagics)


def unload_ipython_extension(ipython):
    # ipython.user_global_ns.pop('_stan_vars', None)
    pass
