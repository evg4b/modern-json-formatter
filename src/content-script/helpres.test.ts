import { throws } from './helpres';

describe('helpers', () => {
  it('should work', () => {
    expect(() => throws()).toThrow('Unexpected value');
  });

  it('should work with a value', () => {
    expect(() => throws('Custom message')).toThrow('Custom message');
  });
});
