import { beforeEach, describe, expect, rstest, test } from '@rstest/core';
import { html, render } from 'lit';
import { dropdown } from './directive.ts';
import { DropdownElement, type DropdownOption } from './dropdown.ts';
import { throws } from '../../helpers.ts';

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
