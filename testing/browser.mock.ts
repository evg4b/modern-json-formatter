jest.mock('@core/browser', () => ({
  getURL: jest.fn((s: string) => s),
  sendMessage: jest.fn(() => Promise.resolve()),
}));
