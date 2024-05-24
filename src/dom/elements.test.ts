import { bracket, colon, comma, ellipsis, itemsCount, propertiesCount, squareBracket, toggle } from './elements';

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

  describe('square-bracket', () => {
    test('open', () => {
      const element = squareBracket.open();
      expect(element).toMatchSnapshot();
    });

    test('close', () => {
      const element = squareBracket.close();
      expect(element).toMatchSnapshot();
    });
  });

  describe('bracket', () => {
    test('open', () => {
      const element = bracket.open();
      expect(element).toMatchSnapshot();
    });

    test('close', () => {
      const element = bracket.close();
      expect(element).toMatchSnapshot();
    });
  });

  test('propertiesCount', () => {
    const element = propertiesCount(5);
    expect(element).toMatchSnapshot();
  })

  test('itemsCount', () => {
    const element = itemsCount(5);
    expect(element).toMatchSnapshot();
  })
});
