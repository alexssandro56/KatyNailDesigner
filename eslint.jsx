import js from "@eslint/js";
import ts from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import react from "eslint-plugin-react";

export default [
  js.configs.recommended,
  {
    ignores: ["node_modules/", "dist/", ".next/"],
  },
  {
    languageOptions: {
      parser: tsParser,
      sourceType: "module",
    },
    plugins: {
      "@typescript-eslint": ts,
      "react": react,
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "warn", // Apenas um aviso
      "react/react-in-jsx-scope": "off", // Next.js já importa React automaticamente
      "no-undef": "off", // Desativa erro de variáveis não definidas
    },
  },
];
