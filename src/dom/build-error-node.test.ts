import { buildErrorNode } from './build-error-node';

describe('error-node', () => {
  beforeEach(() => {
    Object.assign(global, {
      chrome: {
        runtime: {
          getURL: jest.fn((a) => a),
        },
      },
    });
  });

  test('should render error node', () => {
    const node = buildErrorNode();

    expect(node).toMatchSnapshot();
  });
});
