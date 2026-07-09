import { test, expect } from "@playwright/test";

const CAR_JSON_KEYS = [
  "name",
  "url",
  "image",
  "price",
  "power",
  "transmission",
  "fuel",
  "processed_date",
  "attributes",
];

interface Attribute {
  name: string;
  value: string;
}

interface Car {
  adac_id: number;
  name: string;
  url: string;
  image: string;
  price: string;
  power: string;
  transmission: string;
  fuel: string;
  processed_date: string;
  attributes: Attribute[];
}

function assertSingleCarJson(obj: any) {
  for (const key of CAR_JSON_KEYS) {
    expect(obj).toHaveProperty(key);
  }
  const brandAttributes = obj.attributes.filter(
    (attr: Attribute) => attr.name === "Marke",
  );
  expect(brandAttributes.length).toBe(1);
}

test.describe("Backend API Tests", () => {
  test("Database version endpoint", async ({ request }) => {
    const response = await request.get("/cars/db/version");
    expect(response.status()).toBe(200);
    const text = await response.text();
    expect(text).toMatch(/^\d+-\d+-\d+ \d+:\d+:\d+$/);
  });

  test("Get all cars endpoint", async ({ request }) => {
    const response = await request.get("/cars");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(10);
  });

  test("Get car by ID endpoint", async ({ request }) => {
    const carsResponse = await request.get("/cars");
    expect(carsResponse.status()).toBe(200);
    const cars = await carsResponse.json();
    const carId = cars[0].adac_id;

    const response = await request.get(`/cars/${carId}`);
    expect(response.status()).toBe(200);
    const car = await response.json();
    expect(car.adac_id).toBe(carId);
    assertSingleCarJson(car);
  });

  test("Get attributes names endpoint", async ({ request }) => {
    const response = await request.get("/cars/attributes/names");
    expect(response.status()).toBe(200);
    const attrs = await response.json();
    expect(Array.isArray(attrs)).toBe(true);
    expect(attrs.length).toBeGreaterThan(210);
    expect(attrs).toContain("Grundpreis");
    expect(attrs).toContain("Höchstgeschwindigkeit");
  });

  test("Get attributes names with text filter endpoint", async ({
    request,
  }) => {
    const response = await request.get("/cars/attributes/names?text=preis");
    expect(response.status()).toBe(200);
    const attrs = await response.json();
    expect(attrs).toEqual(["Fahrzeugpreis", "Grundpreis"]);
  });

  test("Get attributes values endpoint for int type attribute", async ({
    request,
  }) => {
    const response = await request.get(
      "/cars/attributes/values?text=Autom.%20Abstandsregelung",
    );
    expect(response.status()).toBe(200);
    const obj = await response.json();

    expect(obj.type).toBe("int");
    expect(obj.additional_values).toContain("Serie");
    expect(obj.additional_values).toContain(null);
    expect(obj.range.min).toBeLessThan(600);
    expect(obj.range.max).toBeGreaterThan(1000);
  });

  test("Get attributes values endpoint for list type attribute", async ({
    request,
  }) => {
    const response = await request.get("/cars/attributes/values?text=Motorart");
    expect(response.status()).toBe(200);
    const obj = await response.json();

    expect(Array.isArray(obj)).toBe(true);
    expect(obj.length).toBeGreaterThan(6);
    expect(obj).toContain("Diesel");
    expect(obj).toContain("Otto");
    expect(obj).toContain("Elektro");
  });

  test("Find by filter endpoint", async ({ request }) => {
    const limit = 5;
    const response = await request.post("/cars/findByFilter", {
      data: {
        page: 1,
        limit: limit,
        text: "vw",
        attributes: [
          { name: "Motorart", values: ["Diesel"], range: {} },
          { name: "Autom. Abstandsregelung", values: ["Serie"], range: {} },
        ],
      },
    });

    expect(response.status()).toBe(201);
    const obj = await response.json();

    expect(obj.docs.length).toBe(limit);
    expect(obj.total).toBeGreaterThan(limit);
    expect(obj.limit).toBe(limit);
    expect(obj.page).toBe(1);
    expect(obj.pages).toBeGreaterThan(1);
    expect(obj.offset).toBe(0);

    assertSingleCarJson(obj.docs[0]);
  });
});
