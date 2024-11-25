import { version as runtimeVersion } from "@babel/plugin-transform-runtime/package.json";

export const presets = [
  ["@babel/preset-env", { loose: true }],
  "@babel/preset-typescript",
];

export const plugins = [
  ["@babel/plugin-transform-runtime", { version: runtimeVersion }],
];
