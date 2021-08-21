# CmdStanJupyter

`CmdStanJupyter` is a package to help development of Stan models (using `CmdStanPy`)
in jupyter notebooks.


Use it with [jupyterlab-stan-highlight](https://github.com/WardBrian/jupyterlab-stan-highlight) to recieve
highlighting for your `%%stan` blocks in python notebooks!

The package is heavily based on Arvinds-ds
[jupyterstan](https://github.com/janfreyberg/jupyterstan) package, but provides an
interface that simply returns a `cmdstanpy.CmdStanModel` object.


## Features

- Compile a stan model and save it as a cmdstanpy variable by running a `%%stan` cell
- Display and load an existing stan file with `%stanf`


## Installation

To install the library:

```bash
pip install git+https://github.com/WardBrian/CmdStanJupyter.git
```

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


If the above code was stored in a file `births.stan`, the following is also possible:

```
%stanfile paris_female_births births.stan
```

```stan
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


To use your compiled model:

```python
fit = paris_female_births.sample(
    data={'male': 251527, 'female': 241945},
)
```
