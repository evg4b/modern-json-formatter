export const element = (content: string, options?: { class: string }) => {
  const span = document.createElement('span');
  span.appendChild(document.createTextNode(content));
  if (options?.class) {
    span.className = options.class;
  }

  return span;
};
