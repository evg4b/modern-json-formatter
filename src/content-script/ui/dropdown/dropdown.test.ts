import { beforeEach, describe, expect, rstest, test } from '@rstest/core';
import { html, render } from 'lit';
import { dropdown, DropdownDirective } from './directive.ts';
import { DropdownElement, type DropdownOption } from './dropdown.ts';
import { throws } from '../../helpers.ts';
import { defaultLitAsserts, renderLitElement } from '@testing/lit';
import { PartType } from 'lit-html/directive.js';

// happy-dom does not implement the Popover API
if (!HTMLElement.prototype.hidePopover) {
  HTMLElement.prototype.hidePopover = () => { /* noop */ };
}
if (!HTMLElement.prototype.showPopover) {
  HTMLElement.prototype.showPopover = () => { /* noop */ };
}

describe('dropdown', () => {
  const handler1 = rstest.fn().mockName('handler1');
  const handler2 = rstest.fn().mockName('handler2');
  const handler3 = rstest.fn().mockName('handler3');

  const options: DropdownOption[] = [
    { label: 'Option 1', onClick: handler1 },
    { label: 'Option 2', onClick: handler2 },
    { label: 'Option 3', onClick: handler3 },
  ];

  let hostDiv: HTMLDivElement;
  let button: HTMLButtonElement;
  let dropdownElement: DropdownElement;

  beforeEach(async () => {
    hostDiv = document.createElement('div');

    document.body.appendChild(hostDiv);

    rstest.spyOn(HTMLButtonElement.prototype, 'insertAdjacentElement')
      .mockImplementation((_, element) => {
        setTimeout(() => hostDiv.append(element));
        return null;
      });

    const markup = html`
      <button ${dropdown(options)}>test</button>
    `;

    render(markup, hostDiv);

    await new Promise(resolve => setTimeout(resolve, 0));

    button = hostDiv.querySelector('button') ?? throws('button not found');
    dropdownElement = hostDiv.querySelector('mjf-dropdown') ?? throws('dropdown not found');
  });

  describe('button', () => {
    describe('popovertarget', () => {
      let popovertarget: string | null;

      beforeEach(() => {
        popovertarget = button.getAttribute('popovertarget');
      });

      test('should exists', () => {
        expect(popovertarget)
          .toBeDefined();
      });
    });

    test('should have a ancor name', () => {
      expect(button.style.getPropertyValue('anchor-name'))
        .toBeDefined();
    });
  });

  describe('dropdown', () => {
    test('should have a dropdown element', () => {
      expect(dropdownElement)
        .toBeDefined();
    });

    test('should have 3 options', () => {
      expect(dropdownElement.options)
        .toHaveLength(3);
    });
  });

  describe('anchor', () => {
    test('should have same anchor names', () => {
      const buttonAnchor = button.style.getPropertyValue('anchor-name');
      const dropdownAnchor = dropdownElement.style.getPropertyValue('position-anchor');

      expect(buttonAnchor)
        .toBe(dropdownAnchor);
    });
  });

  describe('popovertarget', () => {
    test('should have a same id', () => {
      const popovertarget = button.getAttribute('popovertarget');
      const id = dropdownElement.id;

      expect(popovertarget)
        .toBe(id);
    });
  });
});

describe('DropdownDirective', () => {
  test('render() should return empty string', () => {
    // DropdownDirective.render() is required by Lit but always returns ''
    // instantiate via the directive factory using a child part info
    const hostDiv = document.createElement('div');
    document.body.appendChild(hostDiv);
    const markup = html`<button ${dropdown([])}>test</button>`;
    render(markup, hostDiv);

    // The directive instance's render() is called by Lit server-side rendering;
    // we verify it produces no DOM output (returns '')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = new DropdownDirective({ type: PartType.ELEMENT } as any).render([]);
    expect(result).toBe('');

    document.body.removeChild(hostDiv);
  });

  test('update() should throw when used on a non-ELEMENT part', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const directive = new DropdownDirective({ type: PartType.ELEMENT } as any);
    const nonElementPartInfo = { type: PartType.CHILD };

    expect(() => directive.update(nonElementPartInfo as Parameters<typeof directive.update>[0], [[]])).toThrow(
      'Dropdown directive can only be used as an attribute',
    );
  });
});

describe('DropdownElement', () => {
  let element: DropdownElement;
  let handlerA: ReturnType<typeof rstest.fn>;
  let handlerB: ReturnType<typeof rstest.fn>;

  renderLitElement('mjf-dropdown', async el => {
    element = el;
    handlerA = rstest.fn().mockName('handlerA');
    handlerB = rstest.fn().mockName('handlerB');
    element.options = [
      { label: 'Option A', onClick: handlerA },
      { label: 'Option B', onClick: handlerB },
    ];
    await el.updateComplete;
  });

  defaultLitAsserts(DropdownElement, () => element);

  test('should have popover attribute set to "auto" when connected', () => {
    expect(element.getAttribute('popover')).toBe('auto');
  });

  describe('rendered buttons', () => {
    let buttons: HTMLButtonElement[];

    beforeEach(() => {
      buttons = Array.from(element.shadowRoot?.querySelectorAll('button') ?? []);
    });

    test('should render a button for each option', () => {
      expect(buttons).toHaveLength(2);
    });

    test.each(['Option A', 'Option B'])('should render button with label "%s"', label => {
      expect(buttons.find(b => b.textContent?.trim() === label)).toBeDefined();
    });

    test('should call handlerA when first button is clicked', () => {
      buttons[0]?.click();
      expect(handlerA).toHaveBeenCalledTimes(1);
    });

    test('should call handlerB when second button is clicked', () => {
      buttons[1]?.click();
      expect(handlerB).toHaveBeenCalledTimes(1);
    });
  });
});
