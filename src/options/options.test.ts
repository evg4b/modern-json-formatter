import '@testing/browser.mock';
import '@testing/background.mock';
import '@testing/settings.mock';
import { beforeEach, describe, expect, test, type Mock } from '@rstest/core';
import { OptionsPageElement } from './options';
import { defaultLitAsserts, renderLitElement } from '@testing/lit';
import { clearHistory, type DomainCountResponse, getDomains } from '@core/background';
import { DEFAULT_SETTINGS, getSettings, saveSettings, type ExtensionSettings } from '@core/settings';

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
    (getSettings as Mock<typeof getSettings>).mockResolvedValue(DEFAULT_SETTINGS);
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

  describe('Toolbar Buttons section', () => {
    let checkboxes: HTMLInputElement[];

    beforeEach(() => {
      checkboxes = Array.from(
        optionsPageElement.shadowRoot?.querySelectorAll<HTMLInputElement>('input[type="checkbox"]') ?? [],
      );
    });

    test('renders four checkboxes', () => {
      expect(checkboxes).toHaveLength(4);
    });

    test.each(['query', 'formatted', 'raw', 'download'])('"%s" checkbox is checked by default', name => {
      const checkbox = checkboxes.find(cb => cb.dataset.key === name);
      expect(checkbox?.checked).toBe(true);
    });

    describe.each([
      { label: 'Query', key: 'query' as const },
      { label: 'Formatted', key: 'formatted' as const },
      { label: 'Raw', key: 'raw' as const },
      { label: 'Download', key: 'download' as const },
    ])('toggling "$label" checkbox', ({ label: _label, key }) => {
      beforeEach(async () => {
        (saveSettings as Mock<typeof saveSettings>).mockClear();
        const checkbox = checkboxes.find(cb => cb.dataset.key === key);
        checkbox!.checked = false;
        checkbox!.dispatchEvent(new Event('change', { bubbles: true }));
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      test('calls saveSettings with the updated value', () => {
        expect(saveSettings).toHaveBeenCalledTimes(1);
        const saved = (saveSettings as Mock<typeof saveSettings>).mock.calls[0][0] as ExtensionSettings;
        expect(saved.buttons[key]).toBe(false);
      });
    });
  });

  describe('Download Button Mode section', () => {
    let radios: HTMLInputElement[];

    beforeEach(() => {
      radios = Array.from(
        optionsPageElement.shadowRoot?.querySelectorAll<HTMLInputElement>('input[type="radio"]') ?? [],
      );
    });

    test('renders four radio buttons', () => {
      expect(radios).toHaveLength(4);
    });

    test('"dropdown" radio is checked by default', () => {
      expect(radios.find(r => r.value === 'dropdown')?.checked).toBe(true);
    });

    test.each(['raw', 'formatted', 'minified'])('"%s" radio is unchecked by default', value => {
      expect(radios.find(r => r.value === value)?.checked).toBe(false);
    });

    describe.each(['dropdown', 'raw', 'formatted', 'minified'] as const)('selecting "%s"', mode => {
      beforeEach(async () => {
        (saveSettings as Mock<typeof saveSettings>).mockClear();
        const radio = radios.find(r => r.value === mode);
        radio!.dispatchEvent(new Event('change', { bubbles: true }));
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      test('calls saveSettings with the correct downloadMode', () => {
        expect(saveSettings).toHaveBeenCalledTimes(1);
        const saved = (saveSettings as Mock<typeof saveSettings>).mock.calls[0][0] as ExtensionSettings;
        expect(saved.downloadMode).toBe(mode);
      });
    });

    describe('when download button is disabled', () => {
      beforeEach(async () => {
        (getSettings as Mock<typeof getSettings>).mockResolvedValue({
          ...DEFAULT_SETTINGS,
          buttons: { ...DEFAULT_SETTINGS.buttons, download: false },
        });
        optionsPageElement.firstUpdated();
        await optionsPageElement.updateComplete;
      });

      test('download mode section has disabled class', () => {
        const section = Array.from(
          optionsPageElement.shadowRoot?.querySelectorAll('.settings-section') ?? [],
        ).find(el => el.querySelector('input[type="radio"]'));
        expect(section?.classList.contains('disabled')).toBe(true);
      });
    });
  });
});
