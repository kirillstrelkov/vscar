"""Functional tests for web application using pytest-bdd."""

from pytest_bdd import scenarios

scenarios("features/search.feature")
scenarios("features/compare.feature")
