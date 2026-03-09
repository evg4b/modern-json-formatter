import { type ElementPart } from 'lit';
import { Directive, directive } from 'lit/directive.js';
import { type PartInfo, PartType } from 'lit-html/directive.js';
import type { DropdownOption } from './dropdown.ts';

export class DropdownDirective extends Directive {
  private readonly _id = crypto.randomUUID();
  private readonly _anchorName = `--${this._id}-anchor`;
  private readonly dropdownElement = document.createElement('mjf-dropdown');

  constructor(_partInfo: PartInfo) {
    super(_partInfo);
    this.dropdownElement.id = this._id;
    this.dropdownElement.options = [];
    this.dropdownElement.style.setProperty('position-anchor', this._anchorName, 'important');
  }

  public override update(partInfo: PartInfo, [options]: [DropdownOption[]]) {
    if (partInfo.type !== PartType.ELEMENT) {
      throw new Error('Dropdown directive can only be used as an attribute');
    }
    const elementPart = partInfo as unknown as ElementPart;
    const element = elementPart.element as HTMLElement;

    this.dropdownElement.options = options;
    if (!this.dropdownElement.isConnected) {
      element.insertAdjacentElement('afterend', this.dropdownElement);
    }

    element.setAttribute('popovertarget', this._id);
    element.style.setProperty('anchor-name', this._anchorName, 'important');
  }

  public override render(_: DropdownOption[]): unknown {
    return '';
  }
}

export const dropdown = directive(DropdownDirective);
