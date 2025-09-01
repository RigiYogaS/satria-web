import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      // Disable TypeScript any type warnings
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-argument": "off",

      // Disable other common TypeScript warnings
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/prefer-const": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-non-null-assertion": "off",

      // Disable React warnings that might be annoying
      "react-hooks/exhaustive-deps": "off",
      "react/no-unescaped-entities": "off",
      "react/display-name": "off",

      // Disable Next.js warnings
      "@next/next/no-img-element": "off",
      "@next/next/no-html-link-for-pages": "off",

      // Disable general ESLint warnings
      "no-console": "off",
      "no-unused-vars": "off",
      "prefer-const": "off",
    },
  },
  // Special rules for API routes
  {
    files: ["src/app/api/**/*.ts", "src/app/api/**/*.js"],
    rules: {
      // Allow any type in API routes
      "@typescript-eslint/no-explicit-any": "off",
      // Allow console.log in API routes for debugging
      "no-console": "off",
      // Allow unused variables in API routes (like error params)
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
];

export default eslintConfig;
