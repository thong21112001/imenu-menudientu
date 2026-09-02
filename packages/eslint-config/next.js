module.exports = {
  extends: ["next/core-web-vitals", "prettier"],
  rules: {
    "@next/next/no-html-link-for-pages": "off",
    "react/display-name": "off",
  },
  ignorePatterns: ["node_modules/", ".next/", "out/"],
};
