import { type RsbuildPlugin } from '@rsbuild/core';
import { marked } from 'marked';
import { gfmHeadingId } from "marked-gfm-heading-id";

export const mdPlugin = (): RsbuildPlugin => ({
  name: 'md-plugin',
  setup(api) {
    marked.use(gfmHeadingId({ prefix: 'mjf-' }));

    api.transform({ test: /\.md$/ }, async ({ code }) => {
      const html = await marked.parse(code, { gfm: true });
      const encoded = html.replace('`', '\\`');

      return `import { html } from "lit"; export default html\`${ encoded }\`;`;
    });
  },
});
