import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";


export default [
  { 
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"]
  },
  { 
    languageOptions: { 
      parserOptions: { 
        ecmaFeatures: { 
          jsx: true } 
      } 
    } 
  },
  {
    "settings": {
      "import/resolver": {
        "typescript": {}
      }
    }
  },
  {
    languageOptions: { 
      globals: {
        ...globals.browser, 
        ...globals.node} 
    }
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReactConfig,
];