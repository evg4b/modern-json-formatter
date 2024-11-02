jest.mock('@core/browser', () => ({
  getURL: (s: string) => s,
}));
