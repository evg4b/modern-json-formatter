jest.mock('@core/background', () => ({
  format: jest.fn(),
  jq: jest.fn(),
  tokenize: jest.fn(),
  getHistory: jest.fn(),
  clearHistory: jest.fn(),
  pushHistory: jest.fn(),
  getDomains: jest.fn(),
}));
