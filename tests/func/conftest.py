"""Functional tests configuration."""

from collections.abc import Generator

import pytest
from easelenium.browser import Browser
from features.steps.common import *  # noqa: F403


@pytest.fixture
def browser() -> Generator[Browser, None, None]:
    """Provide browser instance."""
    browser = Browser(browser_name="ff")
    yield browser
    browser.quit()
