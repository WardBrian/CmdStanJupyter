import pytest

from cmdstanjupyter import parse_args

DEFAULT_MODEL_NAME = "_stan_model"

DEFAULT_OPTS = {}


def test_no_arguments():
    varname, sopts, cppopts = parse_args("")
    assert varname == DEFAULT_MODEL_NAME
    assert sopts == DEFAULT_OPTS
    assert cppopts == DEFAULT_OPTS


def test_model_name():
    test_name = "test_name"
    varname, sopts, cppopts = parse_args(test_name)
    assert varname == "test_name"
    assert sopts == DEFAULT_OPTS
    assert cppopts == DEFAULT_OPTS


def test_stan_options():
    in_str = (
        "model -O --allow_undefined --use-opencl --warn-uninitialized"
        + " --name TEST --warn-pedantic"
    )

    varname, sopts, cppopts = parse_args(in_str)
    test_opts = {
        "O": True,
        "allow_undefined": True,
        "use-opencl": True,
        "warn-uninitialized": True,
        "warn-pedantic": True,
        "name": "TEST",
    }
    assert varname == "model"
    assert sopts == test_opts
    assert cppopts == DEFAULT_OPTS


def test_cpp_options():
    in_str = (
        "model --STAN_OPENCL --OPENCL_DEVICE_ID 99"
        + " --OPENCL_PLATFORM_ID 101 --STAN_MPI --STAN_THREADS 4"
    )

    varname, sopts, cppopts = parse_args(in_str)
    test_opts = {
        "STAN_OPENCL": True,
        "OPENCL_DEVICE_ID": 99,
        "OPENCL_PLATFORM_ID": 101,
        "STAN_MPI": True,
        "STAN_THREADS": 4,
    }
    assert varname == "model"
    assert sopts == DEFAULT_OPTS
    assert cppopts == test_opts


def test_invalid_model_name():
    test_name = "0test_name"
    with pytest.raises(ValueError):
        varname, sopts, cppopts = parse_args(test_name)


def test_invalid_model_args():
    in_str = "model --who-am-i"
    with pytest.raises(SystemExit):
        varname, sopts, cppopts = parse_args(in_str)
