"""Common steps for BDD tests."""

from easelenium.browser import Browser
from pytest_bdd import given, parsers, then, when

__XPATH_TD_CONTAINS = "//td[contains(text(), '{}')]"
__PORT = 4200
__URL = f"http://localhost:{__PORT}"


@given(parsers.parse('I am on "{path}"'))
def step_impl_given_i_am_on_path(browser: Browser, path: str) -> None:
    """Go to given path."""
    browser.get(f"{__URL}{path}")


@given("I am on homepage")
def step_impl_given_homepage(browser: Browser) -> None:
    """Go to homepage."""
    browser.get(__URL)


@when(parsers.parse('I type "{text}" into search field'))
def step_impl_when_type_into_search(browser: Browser, text: str) -> None:
    """Type text into search field."""
    browser.type(by_tag="input", text=text)


@when(parsers.parse('I select "{model}" for comparison'))
def step_impl_when_select_for_comparison(browser: Browser, model: str) -> None:
    """Select model for comparison."""
    xpath_add_button = __XPATH_TD_CONTAINS.format(model) + "/..//button"
    browser.click(by_xpath=xpath_add_button)


@when(parsers.parse('I click "{text}"'))
def step_impl_when_click(browser: Browser, text: str) -> None:
    """Click button with given text."""
    browser.click(by_xpath=f"//*[@class='mdc-button__label' and contains(text(), '{text}')]/..")


def __choose_from_combobox(browser: Browser, text: str, *, click_combobox: bool = True) -> None:
    xpath_combobox = "//mat-drawer//mat-form-field"
    if click_combobox:
        browser.click(
            by_css='[role="combobox"]',
            parent=browser.find_elements(by_xpath=xpath_combobox)[-1],
        )

    for value in text.split(","):
        browser.click(
            by_xpath=f"//*[@role='listbox']//span[contains(text(), '{value}')]",
        )

    # remove focus
    if browser.is_visible(by_class="cdk-overlay-container"):
        browser.click(by_class="cdk-overlay-container")
        browser.wait_for_not_visible(by_class="cdk-overlay-container")


def __add_attribute(browser: Browser, attribute: str) -> None:
    xpath_form_field = "//mat-drawer//mat-form-field"
    elements = browser.find_elements(by_xpath=xpath_form_field)

    browser.click(by_css="app-sidebar button")

    browser.webdriver_wait(
        lambda _driver: elements < browser.find_elements(by_xpath=xpath_form_field),
        f"Failed to wait for new input field in sidebar for attribute '{attribute}'",
    )
    browser.type(by_xpath=f"{xpath_form_field}//input", text=attribute)
    __choose_from_combobox(browser, attribute)


@when(parsers.parse('I select "{value}" as "{attribute}"'))
def step_impl_when_select_as_attribute(browser: Browser, value: str, attribute: str) -> None:
    """Select value for given attribute."""
    __add_attribute(browser, attribute)
    __choose_from_combobox(browser, value)


@when(parsers.parse('I select "{value}" as {minmax} value in "{attribute}"'))
def step_impl_when_select_maximum_in_attribute(browser: Browser, value: str, minmax: str, attribute: str) -> None:
    """Select maximum or minimum value for given attribute."""
    __add_attribute(browser, attribute)
    browser.click(by_xpath="//label[contains(text(), 'Use range')]/../..")
    minmax = {"maximum": "Max", "minimum": "Min"}[minmax]
    browser.type(by_xpath=f"//mat-label[contains(text(), '{minmax}')]/../../input", text=value)


@when(parsers.parse('I select "{value}" items per page'))
def step_impl_when_select_items_per_page(browser: Browser, value: str) -> None:
    """Select number of items per page."""
    browser.click(by_css="mat-paginator mat-form-field")
    __choose_from_combobox(browser, value, click_combobox=False)


@when(parsers.parse('"{a}" should be before "{b}"'))
@then(parsers.parse('"{a}" should be before "{b}"'))
def step_impl_when_order_numbers(browser: Browser, a: str, b: str) -> None:
    """Check that a is before b in table."""
    browser.wait_for_visible(by_xpath=__XPATH_TD_CONTAINS.format(a))
    browser.wait_for_visible(by_xpath=__XPATH_TD_CONTAINS.format(b))

    source = browser.get_page_source()
    pos_a = source.index(a)
    pos_b = source.index(b)
    assert pos_a < pos_b, f'Expected "{a}" to be before "{b}"'


@then(parsers.parse('I should see "{text}" in table'))
def step_impl_then_should_see(browser: Browser, text: str) -> None:
    """Check that text is present in table."""
    browser.wait_for_visible(by_xpath=__XPATH_TD_CONTAINS.format(text))


@then(parsers.parse('I should not see "{text}" in table'))
def step_impl_then_should_not_see(browser: Browser, text: str) -> None:
    """Check that text is not present in table."""
    browser.wait_for_not_visible(by_xpath=__XPATH_TD_CONTAINS.format(text))


@then(parsers.parse('I should see that in row "{row}" values are highlighted'))
def step_impl_then_row_highlighted(browser: Browser, row: str) -> None:
    """Check that row has highlight class."""
    assert "highlight" in browser.get_attribute(
        by_xpath=__XPATH_TD_CONTAINS.format(row),
        attr="class",
    )


@then(parsers.parse('I should see that in row "{row}" values are not highlighted'))
def step_impl_then_row_not_highlighted(browser: Browser, row: str) -> None:
    """Check that row does not have highlight class."""
    assert "highlight" not in browser.get_attribute(
        by_xpath=__XPATH_TD_CONTAINS.format(row),
        attr="class",
    )
