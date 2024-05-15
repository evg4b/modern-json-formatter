import { colon, comma, ellipsis, toggle } from './elements';

describe('elements', () => {
  test('toggle', () => {
    const element = toggle();
    expect(element).toMatchSnapshot();
  });

  test('ellipsis', () => {
    const element = ellipsis();
    expect(element).toMatchSnapshot();
  });

  test('comma', () => {
    const element = comma();
    expect(element).toMatchSnapshot();
  });

  test('colon', () => {
    const element = colon();
    expect(element).toMatchSnapshot();
  });
});
