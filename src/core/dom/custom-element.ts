export const CustomElement = (selector: string, options?: ElementDefinitionOptions) => {
  return (target: CustomElementConstructor) => {
    customElements.define(selector, target, options);
  };
};
