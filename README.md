# cmdstanjupyter

[![Github Actions Status](https://github.com/WardBrian/CmdStanJupyter/workflows/Build/badge.svg)](https://github.com/WardBrian/CmdStanJupyter/actions/workflows/build.yml)

A JupyterLab extension for Stan models.

## Requirements

- JupyterLab >= 4.0.0

## Install

To install the extension, execute:

```bash
pip install cmdstanjupyter
```

**Note**: this does _not_ install CmdStanPy for you, in case you are only interested
in Stan syntax highlighting and not the `%%stan` magic!

Install it separately using `pip` or `conda`!

## Usage

To use the `magic` in your notebook, you need to lead the extension:

```python
%load_ext cmdstanjupyter
```

To define a stan model inside a jupyter notebook, start a cell with the `%%stan`
magic. You can also provide a variable name, which is the variable name that
the `cmdstanpy.CmdStanModel` object will be assigned to. For example:

```stan
%%stan paris_female_births
data {
    int male;
    int female;
}

parameters {
    real<lower=0, upper=1> p;
}

model {
    female ~ binomial(male + female, p);
}
```

When you run this cell, `cmdstanjupyter` will create a cmdstanpy CmdStanModel object,
which will compile your model and allow you to sample from it.

If the above code was stored in a file `births.stan`, the following is equivalent:

```
%stanf births.stan paris_female_births
```

To use your compiled model:

```python
fit = paris_female_births.sample(
    data={'male': 251527, 'female': 241945},
)
```

## Credits

The %magic is heavily based on the previous [jupyterstan](https://github.com/janfreyberg/jupyterstan) package.
The highlighting code is inspired by [jupyterlab-stata-highlight](https://github.com/kylebarron/jupyterlab-stata-highlight).
