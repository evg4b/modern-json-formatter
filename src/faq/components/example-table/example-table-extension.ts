import type { MarkedExtension } from 'marked';

const TABLE_PATTERN =
  /<table\s+class="table table-borderless table-sm w-auto">\s*<tbody>\s*<tr>\s*<th[^>]*>Query<\/th>\s*<td[^>]*>([\s\S]*?)<\/td>\s*<\/tr>\s*<tr>\s*<th[^>]*>Input<\/th>\s*<td[^>]*>([\s\S]*?)<\/td>\s*<\/tr>\s*<tr>\s*<th[^>]*>Output<\/th>\s*<td[^>]*>([\s\S]*?)<\/td>\s*<\/tr>\s*<\/tbody>\s*<\/table>/g;

export const encodeAttrValue = (raw: string): string =>
  raw
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/"/g, '&quot;')
    .replace(/`/g, '&#96;');

export const exampleTableExtension = (): MarkedExtension => ({
  hooks: {
    postprocess(html: string): string {
      return html.replace(TABLE_PATTERN, (_, query: string, input: string, output: string) => {
        const q = encodeAttrValue(query);
        const i = encodeAttrValue(input);
        const o = encodeAttrValue(output);
        return `<mjf-example-table query="${q}" input="${i}" output="${o}"></mjf-example-table>`;
      });
    },
  },
});
