import '@testing/browser.mock';
import '@testing/background.mock.ts';
import { beforeEach, describe, type Mock } from '@rstest/core';
import { OptionsPageElement } from './options.ts';
import { defaultLitAsserts, renderLitElement } from '@testing/lit.ts';
import { type DomainCountResponse, getDomains } from '@core/background';
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
});
