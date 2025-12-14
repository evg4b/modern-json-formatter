import { type DependencyList, useEffect } from 'react';


export const useAsyncEffect = (effect: () => Promise<unknown>, deps?: DependencyList) => {
  useEffect(() => void effect(), deps);
};
