import { test } from "@playwright/test";
import { SearchBar, Sidebar, SearchTable } from "./pom";

test.describe("Search and Filter Tests", () => {
  let searchBar: SearchBar;
  let sidebar: Sidebar;
  let searchTable: SearchTable;

  test.beforeEach(async ({ page }) => {
    searchBar = new SearchBar(page);
    sidebar = new Sidebar(page);
    searchTable = new SearchTable(page);
    // Go to homepage
    await page.goto("/");
  });

  test("Search by car model", async () => {
    await searchBar.search("VW Golf");

    // Should see specific VW Golf Variant in table
    await searchTable.assertInTable("VW Golf Variant 1.0 TSI Life");
  });

  test("Search by car model and motor type", async () => {
    await searchBar.search("VW Golf");

    // Select "Diesel" as "Motorart"
    await sidebar.selectAttribute("Motorart", "Diesel");

    // Should see TDI
    await searchTable.assertInTable("VW Golf 2.0 TDI");
    // Should not see TSI
    await searchTable.assertNotInTable("TSI");
  });

  test("Search by car model, motor type, transmission", async () => {
    // Select "Otto" as "Motorart"
    await sidebar.selectAttribute("Motorart", "Otto");
    // Select "Automatikgetriebe" as "Getriebeart"
    await sidebar.selectAttribute("Getriebeart", "Automatikgetriebe");

    // Verify results
    await searchTable.assertInTable("Automatikgetriebe");
    await searchTable.assertInTable("Super");
    await searchTable.assertNotInTable("Strom");
    await searchTable.assertNotInTable("Schaltgetriebe");
  });

  test("Search using multiple values", async () => {
    await searchBar.search("xceed");

    // Select multiple motor types
    await sidebar.selectAttribute(
      "Motorart",
      "Diesel (Mild-Hybrid),PlugIn-Hybrid",
    );

    await searchTable.assertInTable("KIA XCeed 1.6 CRDi");
    await searchTable.assertInTable("KIA XCeed 1.6 GDI Plug-in-Hybrid");
  });

  test("Search by price", async () => {
    // Set max price to 10000
    await sidebar.setNumericFilterRange("Grundpreis", { max: "10000" });

    // Select 10 items per page
    await searchTable.selectItemsPerPage("10");

    await searchTable.assertInTable("Opel Rocks");
    await searchTable.assertNotInTable("Dacia");
  });

  test("Search by top speed", async () => {
    // Set min Höchstgeschwindigkeit to 251
    await sidebar.setNumericFilterRange("Höchstgeschwindigkeit", {
      min: "251",
    });

    await searchTable.assertInTable("VW Golf R Performance");
    await searchTable.assertNotInTable("Hyundai i30 N");
  });

  test("Search order", async () => {
    await searchBar.search("VW Golf");

    // Order assertions
    await searchTable.assertBefore(
      "VW Golf Variant 1.0",
      "VW Golf Variant 1.5",
    );
    await searchTable.assertBefore("30375", "32245");
  });
});
