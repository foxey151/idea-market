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
    rules: {
      // any型の使用を許可
      "@typescript-eslint/no-explicit-any": "off",
      // 未使用変数の警告を緩和
      "@typescript-eslint/no-unused-vars": "warn",
      // 空のobject typeを許可
      "@typescript-eslint/no-empty-object-type": "off",
      // React Hooksの依存配列の警告を緩和
      "react-hooks/exhaustive-deps": "warn",
      // Next.jsのimgタグ警告を緩和
      "@next/next/no-img-element": "warn",
      // a11yのaltタグ警告を緩和
      "jsx-a11y/alt-text": "warn",
    },
  },
];

export default eslintConfig;
