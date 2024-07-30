export const loadWasm = (url: string, imports: any): Promise<WebAssembly.WebAssemblyInstantiatedSource> => {
  return 'instantiateStreaming' in WebAssembly
    ? WebAssembly.instantiateStreaming(fetch(url), imports)
    : fetch(url).then(resp => resp.arrayBuffer())
      .then(bytes => WebAssembly.instantiate(bytes, imports));
};
