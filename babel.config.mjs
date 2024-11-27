import packageJson from "@babel/plugin-transform-runtime/package.json" with { type: "json" };

export default {
  presets : [
    ["@babel/preset-env", { loose: true }],
    "@babel/preset-typescript",
  ],
  plugins: [
    ["@babel/plugin-transform-runtime", { version: packageJson.version }],
  ],
}
