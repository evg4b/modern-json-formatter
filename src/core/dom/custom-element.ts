export const CustomElement = (selector: string, options?: ElementDefinitionOptions) => {
  return (target: CustomElementConstructor) => {
    window.customElements.define(selector, target, options);
  };
};
