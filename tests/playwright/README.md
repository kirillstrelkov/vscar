# Playwright Test Suite for VSCar

This directory contains TypeScript-based end-to-end (E2E) and API tests for the VSCar application, written using [Playwright](https://playwright.dev/).

## Structure

```text
tests/playwright/
├── package.json               # Defines dependencies and run scripts
├── tsconfig.json              # TypeScript compilation configuration
├── playwright.config.ts       # Playwright global settings, projects, and base URLs
├── README.md                  # This file
└── tests/
    ├── frontend/              # UI E2E functional tests
    │   ├── search.spec.ts     # Replicates search.feature scenarios
    │   └── compare.spec.ts    # Replicates compare.feature scenarios
    └── backend/               # API tests
        └── api.spec.ts        # Replicates tests/api/test_api.py scenarios
```

## Configuration

By default, the tests target:

- Frontend URL: `http://localhost:4200`
- Backend URL: `http://localhost:3000`

You can override these URLs using environment variables:

```bash
export FRONTEND_URL=http://your-frontend-domain:port
export BACKEND_URL=http://your-backend-domain:port
```

## Running Tests

### 1. Prerequisites

Frontend, backend and database are running:

```bash
# cd to ./back/vscar-back-nestjs
make init-db      # init db
make run          # run backend

# cd to ./front
make run          # run frontend
```

Ensure you have installed the dependencies and Playwright browsers:

```bash
pnpm install
pnpm exec playwright install chromium
```

### 2. Execution Commands

From the `tests/playwright` directory:

- **Run all tests (frontend + backend):**

  ```bash
  make test
  ```

- **Run only frontend UI E2E tests:**

  ```bash
  make test-front
  ```

- **Run only backend API tests:**

  ```bash
  make test-back
  ```

### 3. Viewing Test Reports

After executing the tests, a detailed HTML report is generated. You can view the report directly at:

- [playwright-report/index.html](playwright-report/index.html)
