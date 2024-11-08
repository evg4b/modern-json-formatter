import '@testing/svg.mock';
import { describe, expect, it } from '@jest/globals';
import { getShadowRoot } from '@testing/styled-component';
import { InfoButtonElement } from './info-buton';

describe('info-button', () => {
  it('should render button link', () => {
    const infoButton = new InfoButtonElement('https://test.com');
    const root = getShadowRoot(infoButton);
    expect(root.innerHTML).toMatchSnapshot();
  });
});
