jest.mock('@worker-core', () => ({
  initialize: jest.fn(),
  jq: jest.fn(),
  tokenize: jest.fn(),
  format: jest.fn(),
}));
