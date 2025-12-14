import { expect, test, describe } from '@rstest/core';
import { ButtonElement } from "./button";
import "./button";
import { defaultLitAsserts, renderLitElement } from "@testing/lit";

describe('ButtonElement', () => {
  let button: ButtonElement

  renderLitElement('mjf-button', (element) => {
    button = element
  });

  defaultLitAsserts(ButtonElement, () => button)

  test('should have a button', () => {
    const buttonElement = button.shadowRoot?.querySelector('button');

    expect(buttonElement).not.toBeNull();
  });

  test('should have a default slot', () => {
    const slot = button.shadowRoot?.querySelector('slot');

    expect(slot).not.toBeNull();
  });

  describe('active', () => {
    test('should be not active by default', () => {
      expect(button.active).toBeFalsy();
      expect(button.shadowRoot?.querySelector('.active')).toBeNull();
    });

    test('should add active class', async () => {
      button.active = true;

      await button.updateComplete;

      expect(button.active).toBeTruthy();
      expect(button.shadowRoot?.querySelector('.active')).not.toBeNull();
    });
  });
});