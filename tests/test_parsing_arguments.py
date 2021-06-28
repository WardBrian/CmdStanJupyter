import pytest

from cmdstanjupyter import parse_args

# TODO

DEFAULT_MODEL_NAME = "_stan_model"

DEFAULT_OPTS = {
    "model_name": DEFAULT_MODEL_NAME,
    "include_paths": None,
    "boost_lib": None,
    "eigen_lib": None,
    "verbose": False,
    "obfuscate_model_name": True,
}


def test_no_arguments():
    varname, opts = parse_args("")
    assert varname == DEFAULT_MODEL_NAME
    assert opts == DEFAULT_OPTS


def test_model_name():
    test_name = "test_name"
    varname, opts = parse_args(test_name)
    test_opts = DEFAULT_OPTS
    test_opts["model_name"] = varname
    assert varname == "test_name"
    assert opts == test_opts


def test_invalid_model_name():
    test_name = "0test_name"
    with pytest.raises(ValueError):
        varname, opts = parse_args(test_name)
