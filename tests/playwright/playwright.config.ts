import { defineConfig, devices } from "@playwright/test";

const frontendUrl = process.env.FRONTEND_URL || "http://localhost:4200";
const backendUrl = process.env.BACKEND_URL || "http://localhost:3000";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
  timeout: 10000,
  reporter: "html",
  use: {
    trace: "retain-on-first-failure",
  },
  projects: [
    {
      name: "frontend",
      testDir: "./tests/frontend",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: frontendUrl,
      },
    },
    {
      name: "backend",
      testDir: "./tests/backend",
      use: {
        baseURL: backendUrl,
      },
    },
  ],
});
