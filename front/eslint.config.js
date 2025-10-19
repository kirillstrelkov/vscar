// @ts-check
import pkg from "@eslint/js";
import { config, configs as _configs } from "typescript-eslint";
import { configs as __configs, processInlineTemplates } from "angular-eslint";

const { configs } = pkg;

export default config(
  {
    files: ["**/*.ts"],
    extends: [
      configs.recommended,
      ..._configs.recommended,
      ..._configs.stylistic,
      ...__configs.tsRecommended,
    ],
    processor: processInlineTemplates,
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "app",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "app",
          style: "kebab-case",
        },
      ],
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      ...__configs.templateRecommended,
      ...__configs.templateAccessibility,
    ],
    rules: {},
  }
);
