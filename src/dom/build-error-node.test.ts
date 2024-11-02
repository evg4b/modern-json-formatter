import { buildErrorNode } from './build-error-node';

describe('error-node', () => {
  beforeEach(() => {
    Object.assign(global, {
      chrome: {
        runtime: {
          getURL: jest.fn((a: string) => a),
        },
      },
    });
  });

  test('should render error node', () => {
    const node = buildErrorNode('Invalid json file.', 'Please check the file and try again.');

    expect(node).toMatchSnapshot();
  });
});
