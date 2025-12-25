type Imports = WebAssembly.Imports;
type WebAssemblyInstantiatedSource = WebAssembly.WebAssemblyInstantiatedSource;

export const loadWasm = (url: string, imports: Imports): Promise<WebAssemblyInstantiatedSource> => {
  return 'instantiateStreaming' in WebAssembly
    ? WebAssembly.instantiateStreaming(fetch(url), imports)
    : fetch(url)
      .then(resp => resp.arrayBuffer())
      .then(bytes => WebAssembly.instantiate(bytes, imports));
};
