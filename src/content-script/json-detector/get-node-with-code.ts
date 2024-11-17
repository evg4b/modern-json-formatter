export const getNodeWithCode = (list: NodeListOf<ChildNode>): HTMLPreElement | HTMLDivElement | null => {
  const items = Array.from(list);
  const pre = items.find(node => node.nodeName === 'PRE') as HTMLPreElement | null;

  if (!pre && navigator.userAgent.includes('Edg')) {
    return Array.from(list).find((node) => {
      if (!(node instanceof HTMLDivElement)) {
        return false;
      }
      const attributes = node.getAttributeNames();
      return attributes.length === 1 && attributes[0] === 'hidden';
    }) as HTMLDivElement | null;
  }

  return pre;
};
