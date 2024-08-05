export const chromeMockBefore: jest.ProvidesCallback = () => {
  const getURL = () => 'http://localhost:4200/jq.wasm';
  Object.assign(global, {
    chrome: { runtime: { getURL } },
  });
};

export const chromeMockAfter: jest.ProvidesCallback = () => {
  Object.assign(global, { chrome: undefined });
};
