const STRUCTURE = /^\s*[{["]/;
const KEYWORD = /^(?:true|false|null)$/;
const NUMBER = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/;

const isPrimitive = (text: string): boolean => {
  const trimmed = text.trim();
  return KEYWORD.test(trimmed) || NUMBER.test(trimmed);
};

const testNode = <T extends HTMLElement>(node: T | null): T | null => {
  if (!node) {
    return null;
  }

  const text = node.innerText;
  return STRUCTURE.test(text) || isPrimitive(text) ? node : null;
};

export const getNodeWithCode = (list: NodeListOf<ChildNode>): HTMLPreElement | HTMLDivElement | null => {
  const items = Array.from(list);
  const pre = items.find(node => node.nodeName === 'PRE') ?? null;

  if (!pre && navigator.userAgent.includes('Edg')) {
    const div = Array.from(list)
      .find(node => {
        if (!(node instanceof HTMLDivElement)) {
          return false;
        }
        const attributes = node.getAttributeNames();
        return attributes.length === 1 && attributes[0] === 'hidden';
      })
      ?? null;

    return testNode(div as HTMLDivElement | null);
  }

  return testNode(pre as HTMLPreElement | null);
};
