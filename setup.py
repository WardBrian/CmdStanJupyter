# -*- coding: utf-8 -*-

from setuptools import find_packages, setup

readme = open("README.md").read()

setup(
    name="cmdstanjupyter",
    version="0.3.0",
    description="Magics for defining and running stan code in Jupyter.",
    long_description=readme,
    long_description_content_type="text/markdown",
    author="Brian Ward",
    author_email="bward@flatironinstitute.org",
    url="https://github.com/WardBrian/CmdStanJupyter",
    packages=find_packages(),
    install_requires=["ipython", "cmdstanpy", "humanize"],
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Framework :: IPython",
        "Intended Audience :: Developers",
        "Operating System :: OS Independent",
        "Programming Language :: Python",
        "Programming Language :: Python :: 2",
        "Programming Language :: Python :: 2.7",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.6",
        "Topic :: Software Development :: Libraries :: Python Modules",
    ],
)
