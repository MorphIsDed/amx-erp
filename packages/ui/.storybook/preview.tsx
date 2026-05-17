import type { Preview } from "@storybook/react";
// Assuming Tailwind is used, if UI components have their own CSS we import it here.
// import "../src/styles/globals.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
