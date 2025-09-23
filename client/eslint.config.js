export default [
  // A basic ESLint config. You can extend this.
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    languageOptions: {
      parser: "@typescript-eslint/parser",
      globals: {
        browser: true,
        es2021: true,
        node: true
      }
    },
    plugins: ["@typescript-eslint", "react"],
    rules: {
      "react/react-in-jsx-scope": "off"
    }
  }
];
