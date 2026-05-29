import type { StorybookConfig } from "@storybook/react-vite";
import { dirname, join } from "path";

function getAbsolutePath(value: string): string {
  return dirname(require.resolve(join(value, "package.json")));
}


const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    getAbsolutePath("@storybook/addon-links"),
    getAbsolutePath("@storybook/addon-essentials"),
    getAbsolutePath("@storybook/addon-interactions"),
  ],
  framework: {
    name: getAbsolutePath("@storybook/react-vite"),
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
};
export default config;
