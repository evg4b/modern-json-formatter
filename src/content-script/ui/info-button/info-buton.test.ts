import '@testing/svg.mock';
import { describe, expect, test } from '@jest/globals';
import { getShadowRoot } from '@testing/styled-component';
import { InfoButtonElement } from './info-buton';

describe('info-button', () => {
  test('should render button link', () => {
    const infoButton = new InfoButtonElement('https://test.com');
    const root = getShadowRoot(infoButton);
    expect(root.innerHTML).toMatchSnapshot();
  });
});
