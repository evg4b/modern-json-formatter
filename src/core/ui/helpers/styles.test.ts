import { registerStyles } from '@core/ui/helpers/styles';
import { describe, expect, it } from '@jest/globals';

describe('', () => {
  it('Should render the style block', () => {
    const host = document.createElement('div');
    const shadow = host.attachShadow({ mode: 'open' });

    registerStyles(
      shadow,
      `
      :host {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        align-items: center;
        justify-content: center;  
      }
    `,
    );

    expect(shadow.innerHTML).toMatchSnapshot();
  });
});
