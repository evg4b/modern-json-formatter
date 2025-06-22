jest.mock('@core/browser', () => ({
  resource: jest.fn((s: string) => s),
  sendMessage: jest.fn(() => Promise.resolve()),
}));
