import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    files: ["app.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script",
      globals: {
        Sortable: "readonly",
        confetti: "readonly",
        localStorage: "readonly",
        document: "readonly",
        window: "readonly",
        console: "readonly",
        FileReader: "readonly",
        Blob: "readonly",
        URL: "readonly",
        Date: "readonly",
        JSON: "readonly",
        Math: "readonly",
        Object: "readonly",
        Array: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        confirm: "readonly",
        navigator: "readonly",
      },
    },
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
    },
  },
  {
    ignores: ["sw.js", "node_modules/**"],
  },
];
