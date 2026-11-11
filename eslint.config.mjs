import next from "eslint-config-next";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

/**
 * eslint-config-next 16 ships native flat config, so this spreads its exported
 * arrays directly. The older FlatCompat bridge is not needed and in fact fails
 * against this version.
 */
const config = [
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts"] },
  ...next,
  ...nextCoreWebVitals,
  ...nextTypescript,
];

export default config;
