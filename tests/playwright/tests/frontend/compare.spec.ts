import { test, expect } from "@playwright/test";
import { SearchBar, SearchTable, CompareTable } from "./pom";

test.describe("Comparison Tests", () => {
  let searchBar: SearchBar;
  let searchTable: SearchTable;
  let compareTable: CompareTable;

  test.beforeEach(async ({ page }) => {
    searchBar = new SearchBar(page);
    searchTable = new SearchTable(page);
    compareTable = new CompareTable(page);
    // Go to homepage
    await page.goto("/");
  });

  test("Add multiple models for comparison and verify difference highlighting", async ({
    page,
  }) => {
    // Type "VW Golf" into search field
    await searchBar.search("VW Golf");

    // Add first car
    await searchTable.addCarToCompare("VW Golf Variant 1.0 TSI Life");

    // Add second car
    await searchTable.addCarToCompare("VW Golf Variant 1.5 TSI Life");

    // Click "Compare" button on the compare bar
    await searchTable.clickCompare();

    // Wait for the URL to change to the compare view
    await expect(page).toHaveURL(/\/compare\//);

    // Verify row highlighting on differences
    // 1. Grundpreis values differ -> should be highlighted
    await compareTable.assertRowHighlighted("Grundpreis", true);

    // 2. Modell values differ -> should be highlighted
    await compareTable.assertRowHighlighted("Modell", true);

    // 3. Marke values are the same (VW) -> should NOT be highlighted
    await compareTable.assertRowHighlighted("Marke", false);
  });
});
