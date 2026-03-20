import path from "node:path"
import { createRequire } from "node:module"

const rootDir = path.dirname(new URL(import.meta.url).pathname)
const require = createRequire(import.meta.url)
const tsParser = require("@typescript-eslint/parser")

export default [
  { ignores: ["node_modules/**", ".next/**"] },
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      "no-console": "warn",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
]
