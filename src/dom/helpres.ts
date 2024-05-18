export const element = (options?: { content?: string, class?: string }) => {
  const span = document.createElement('span');
  if (options?.content) {
    span.appendChild(document.createTextNode(options.content));
  }
  if (options?.class) {
    span.className = options.class;
  }

  return span;
};

export const isValueExpandable = (value: ParsedJSON): boolean =>
  value.type === 'object' && !!value.properties.length
  || value.type === 'array' && !!value.items.length;

export const isToggleElement = (element: EventTarget | null): element is HTMLElement => {
  return element instanceof HTMLElement && element.classList.contains('toggle');
};
