import { Inputs, useEffect } from 'preact/hooks';

export const useAsyncEffect = (effect: () => Promise<unknown>, inputs?: Inputs) => {
  useEffect(() => void effect(), inputs);
};
