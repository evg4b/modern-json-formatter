import '@testing/browser.mock';
import '@testing/background.mock';
import '@testing/settings.mock';
import { beforeEach, describe, expect, type Mock, test } from '@rstest/core';
import { OptionsPageElement } from './options';
import { defaultLitAsserts, renderLitElement } from '@testing/lit';
import { clearHistory, type DomainCountResponse, getDomains } from '@core/background';
import type { ToolbarButtonsSettings } from '@core/settings';
import { DEFAULT_SETTINGS, type ExtensionSettings, getSettings, saveSettings } from '@core/settings';
import type { ToolbarButtonsSectionElement } from './sections/toolbar-buttons-section';
import type { DownloadModeSectionElement } from './sections/download-mode-section';
import '@core/ui';

describe('mjf-options-page', () => {
  let optionsPageElement: OptionsPageElement;

  beforeEach(() => {
    (getDomains as Mock<typeof getDomains>).mockReturnValue(
      Promise.resolve<DomainCountResponse>([
        { domain: 'demo.com', count: 1 },
        { domain: 'example.com', count: 2 },
      ]),
    );
    (getSettings as Mock<typeof getSettings>).mockResolvedValue(DEFAULT_SETTINGS);
  });

  renderLitElement('mjf-options-page', element => optionsPageElement = element);

  defaultLitAsserts(OptionsPageElement, () => optionsPageElement);

  describe('section components', () => {
    test('renders mjf-options-section wrappers', () => {
      const sections = optionsPageElement.shadowRoot?.querySelectorAll('mjf-options-section');
      expect(sections?.length).toBe(2);
    });

    test('renders mjf-toolbar-buttons-section', () => {
      const section = optionsPageElement.shadowRoot?.querySelector('mjf-toolbar-buttons-section');
      expect(section).not.toBeNull();
    });

    test('renders mjf-download-mode-section', () => {
      const section = optionsPageElement.shadowRoot?.querySelector('mjf-download-mode-section');
      expect(section).not.toBeNull();
    });

    test('passes buttons settings to mjf-toolbar-buttons-section', () => {
      const section = optionsPageElement.shadowRoot
        ?.querySelector<ToolbarButtonsSectionElement>('mjf-toolbar-buttons-section');
      expect(section?.buttons).toEqual(DEFAULT_SETTINGS.buttons);
    });

    test('passes downloadMode to mjf-download-mode-section', () => {
      const section = optionsPageElement.shadowRoot
        ?.querySelector<DownloadModeSectionElement>('mjf-download-mode-section');
      expect(section?.mode).toBe(DEFAULT_SETTINGS.downloadMode);
    });

    test('mjf-download-mode-section is not disabled when download button is on', () => {
      const section = optionsPageElement.shadowRoot?.querySelector('mjf-download-mode-section');
      expect(section?.hasAttribute('disabled')).toBe(false);
    });

    describe('when download button setting is off', () => {
      beforeEach(async () => {
        (getSettings as Mock<typeof getSettings>).mockResolvedValue({
          ...DEFAULT_SETTINGS,
          buttons: { ...DEFAULT_SETTINGS.buttons, download: false },
        });
        optionsPageElement.firstUpdated();
        await optionsPageElement.updateComplete;
      });

      test('mjf-download-mode-section has disabled attribute', () => {
        const section = optionsPageElement.shadowRoot?.querySelector('mjf-download-mode-section');
        expect(section?.hasAttribute('disabled')).toBe(true);
      });
    });
  });

  describe('settings persistence', () => {
    beforeEach(() => {
      (saveSettings as Mock<typeof saveSettings>).mockClear();
    });

    describe('when buttons-change fires from toolbar section', () => {
      const updatedButtons: ToolbarButtonsSettings = { ...DEFAULT_SETTINGS.buttons, query: false };

      beforeEach(async () => {
        const section = optionsPageElement.shadowRoot?.querySelector('mjf-toolbar-buttons-section');
        section?.dispatchEvent(
          new CustomEvent<ToolbarButtonsSettings>('buttons-change', {
            detail: updatedButtons,
            bubbles: true,
          }),
        );
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      test('calls saveSettings once', () => {
        expect(saveSettings).toHaveBeenCalledTimes(1);
      });

      test('saveSettings receives updated buttons', () => {
        const saved = (saveSettings as Mock<typeof saveSettings>).mock.calls[0][0] as ExtensionSettings;
        expect(saved.buttons).toEqual(updatedButtons);
      });
    });

    describe.each(['dropdown', 'raw', 'formatted', 'minified'] as const)(
      'when mode-change fires with "%s"',
      mode => {
        beforeEach(async () => {
          const section = optionsPageElement.shadowRoot?.querySelector('mjf-download-mode-section');
          section?.dispatchEvent(
            new CustomEvent('mode-change', { detail: mode, bubbles: true }),
          );
          await new Promise(resolve => setTimeout(resolve, 0));
        });

        test('calls saveSettings with the correct downloadMode', () => {
          expect(saveSettings).toHaveBeenCalledTimes(1);
          const saved = (saveSettings as Mock<typeof saveSettings>).mock.calls[0][0] as ExtensionSettings;
          expect(saved.downloadMode).toBe(mode);
        });
      },
    );
  });

  describe('query history', () => {
    test('renders query history heading', () => {
      const heading = optionsPageElement.shadowRoot?.querySelector('.section h2');
      expect(heading?.textContent?.trim()).toBe('Query history data');
    });

    test('renders clear button', () => {
      const clearButton = optionsPageElement.shadowRoot?.querySelector('.section mjf-rounded-button');
      expect(clearButton).not.toBeNull();
    });

    test('calls clearHistory and refreshes content on clear button click', async () => {
      (clearHistory as Mock<typeof clearHistory>).mockResolvedValue(undefined);
      (getDomains as Mock<typeof getDomains>).mockReturnValue(Promise.resolve<DomainCountResponse>([]));

      const clearButton = optionsPageElement.shadowRoot?.querySelector('.section mjf-rounded-button');
      expect(clearButton).not.toBeNull();

      (getDomains as Mock<typeof getDomains>).mockClear();
      clearButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(clearHistory).toHaveBeenCalled();
      expect(getDomains).toHaveBeenCalledTimes(1);
    });
  });
});
