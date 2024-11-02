export const throws = (value?: string): never => {
  throw new Error(value ?? 'Unexpected value');
};

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export const query = <T extends HTMLElement = HTMLElement, D extends HTMLElement = HTMLElement>(
  value: D,
  selector: string
): T => value.querySelector<T>(selector) ?? throws(`Element ${selector} not found`);
