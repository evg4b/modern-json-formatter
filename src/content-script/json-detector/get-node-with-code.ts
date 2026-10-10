const STRUCTURE = /^\s*[{["]/;
const PRIMITIVE = /^\s*(?:true|false|null|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?)\s*$/;

const testNode = <T extends HTMLElement>(node: T | null): T | null => {
  if (!node) {
    return null;
  }

  const text = node.innerText;
  return STRUCTURE.test(text) || PRIMITIVE.test(text) ? node : null;
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
