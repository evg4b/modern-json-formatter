import '@testing/browser.mock';
import '@testing/background.mock';
import { beforeEach, describe, expect, test, type Mock } from '@rstest/core';
import { OptionsPageElement } from './options';
import { defaultLitAsserts, renderLitElement } from '@testing/lit';
import { clearHistory, type DomainCountResponse, getDomains } from '@core/background';

import '@core/ui';

describe('mjf-options-page', () => {
  let optionsPageElement: OptionsPageElement;

  beforeEach(() => {
    (getDomains as Mock<typeof getDomains>).mockReturnValue(
      Promise.resolve<DomainCountResponse>([
        { domain: 'demo.com', count: 1 },
        { domain: 'demo.com', count: 1 },
      ]),
    );
  });

  renderLitElement('mjf-options-page', element => optionsPageElement = element);

  defaultLitAsserts(OptionsPageElement, () => optionsPageElement);

  test('should call clearHistory and refresh content on clear button click', async () => {
    (clearHistory as Mock<typeof clearHistory>).mockResolvedValue(undefined);
    (getDomains as Mock<typeof getDomains>).mockReturnValue(Promise.resolve<DomainCountResponse>([]));

    const clearButton = optionsPageElement.shadowRoot?.querySelector('mjf-rounded-button');
    expect(clearButton).not.toBeNull();

    (getDomains as Mock<typeof getDomains>).mockClear();
    clearButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(clearHistory).toHaveBeenCalled();
    expect(getDomains).toHaveBeenCalledTimes(1);
  });
});
