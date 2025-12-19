export const CustomElement = (selector: string, options?: ElementDefinitionOptions) => {
  return (target: CustomElementConstructor) => {
    if (window.customElements.get(selector)) {
      console.warn(`Custom element ${selector} already defined. Overriding it with ${target.name}`);

      return;
    }
    window.customElements.define(selector, target, options);
  };
};
