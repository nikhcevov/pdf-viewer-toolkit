import packageJson from "@babel/plugin-transform-runtime/package.json" with { type: "json" };

export default {
  presets : [
    ["@babel/preset-env", { loose: true }],
    "@babel/preset-typescript",
    "@babel/preset-react"
  ],
  plugins: [
    ["@babel/plugin-transform-runtime", { version: packageJson.version }],
  ],
}
