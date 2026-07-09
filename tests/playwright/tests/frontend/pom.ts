import { Page, expect, Locator } from "@playwright/test";

export class SearchBar {
  readonly page: Page;
  readonly searchInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.locator("app-search input");
  }

  async search(query: string) {
    await this.searchInput.fill(query);
    await this.searchInput.dispatchEvent("keyup");
  }

  async focus() {
    await this.searchInput.focus();
  }
}

export class Sidebar {
  readonly page: Page;
  readonly addFilterButton: Locator;
  readonly searchBar: SearchBar;

  constructor(page: Page) {
    this.page = page;
    this.searchBar = new SearchBar(page);
    this.addFilterButton = this.page.locator(
      'app-sidebar button:has-text("Add filter")',
    );
  }

  async closeOverlay() {
    await this.page
      .locator(".cdk-overlay-container .cdk-overlay-backdrop")
      .click();
  }

  async addFilter(attribute: string) {
    await this.addFilterButton.click();

    // Find the autocomplete input
    const autocompleteInput = this.page
      .locator("app-sidebar mat-form-field:has(input) input")
      .last();

    await autocompleteInput.focus();
    await autocompleteInput.pressSequentially(attribute, { delay: 100 });

    // Wait for option to appear and select it exactly
    const option = this.page.getByRole("option", {
      name: attribute,
      exact: true,
    });
    await option.first().click();
  }

  async selectFilterValues(attribute: string, values: string[]) {
    const select = this.page
      .locator(`mat-form-field:has-text("${attribute}") mat-select`)
      .first();
    await select.click();

    for (const val of values) {
      // Find option by name matching val (case-insensitive exact match regex)
      const option = this.page.getByRole("option", {
        name: val,
      });
      await option.first().click();
    }

    await this.closeOverlay();
  }

  async setNumericFilterRange(
    attribute: string,
    { min, max }: { min?: string; max?: string },
  ) {
    await this.addFilter(attribute);

    const filterGroup = this.page
      .locator("div")
      .filter({
        has: this.page.locator(`mat-form-field:has-text("${attribute}")`),
      })
      .first();

    // Check the "Use range" checkbox
    const checkbox = filterGroup.locator("mat-checkbox");
    const isChecked = await checkbox.locator("input").isChecked();
    if (!isChecked) {
      await checkbox.click();
    }

    if (min !== undefined) {
      const minInput = filterGroup.locator("mat-form-field.min input");
      await minInput.fill(min);
      await minInput.dispatchEvent("input");
    }

    if (max !== undefined) {
      const maxInput = filterGroup.locator("mat-form-field.max input");
      await maxInput.fill(max);
      await maxInput.dispatchEvent("input");
    }
  }

  async selectAttribute(attribute: string, value: string) {
    await this.addFilter(attribute);
    const values = value.split(",");
    await this.selectFilterValues(attribute, values);
  }
}

export class SearchTable {
  readonly page: Page;
  readonly compareButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.compareButton = page.locator('button:has-text("Compare")');
  }

  async selectItemsPerPage(count: string) {
    const paginator = this.page.locator("mat-paginator mat-form-field").first();
    await paginator.click();
    const option = this.page.getByRole("option", { name: count, exact: true });
    await option.first().click();
  }

  async assertInTable(text: string) {
    const cell = this.page
      .locator("table mat-row td, table tr td")
      .filter({ hasText: text })
      .first();
    await expect(cell).toBeVisible();
  }

  async assertNotInTable(text: string) {
    const cell = this.page
      .locator("table mat-row td, table tr td")
      .filter({ hasText: text })
      .first();
    await expect(cell).not.toBeVisible();
  }

  async assertBefore(a: string, b: string) {
    const cellA = this.page.locator(`td:has-text("${a}")`).first();
    const cellB = this.page.locator(`td:has-text("${b}")`).first();
    await expect(cellA).toBeVisible();
    await expect(cellB).toBeVisible();

    const content = await this.page.content();
    const posA = content.indexOf(a);
    const posB = content.indexOf(b);
    expect(posA).toBeLessThan(posB);
  }

  async addCarToCompare(carName: string) {
    const carRow = this.page
      .locator("table mat-row, table tr")
      .filter({ hasText: carName })
      .first();
    await carRow.locator("button.compare").click();
  }

  async clickCompare() {
    await this.compareButton.click();
  }
}

export class CompareTable {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async assertRowHighlighted(rowName: string, expected: boolean = true) {
    const cell = this.page
      .locator("table td")
      .filter({ hasText: rowName })
      .first();
    if (expected) {
      await expect(cell).toHaveClass(/highlight/);
    } else {
      await expect(cell).not.toHaveClass(/highlight/);
    }
  }
}
