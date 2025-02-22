export interface Options<K extends keyof HTMLElementTagNameMap = 'span'> {
  element: K;
  content?: string;
  class?: string | string[];
  id?: string;
  children?: HTMLElement[] | HTMLElement;
  attributes?: Record<string, string>;
  html?: string;
}

export const createElement = <K extends keyof HTMLElementTagNameMap>(options: Options<K>): HTMLElementTagNameMap[K] => {
  const element = document.createElement(options.element);
  if (options.content) {
    element.appendChild(document.createTextNode(options.content));
  }
  if (options.class) {
    const classList = [options.class].flat();
    element.classList.add(...classList);
  }
  if (options.children) {
    const children = [options.children].flat();
    element.append(...children);
  }
  if (options.id) {
    element.id = options.id;
  }
  if (options.attributes) {
    Object.entries(options.attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
  }
  if (options.html) {
    element.innerHTML = options.html;
  }

  return element;
};
