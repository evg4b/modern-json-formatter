import '@testing/browser.mock';
import { TableElement } from './table';
import { describe, expect, test } from '@rstest/core';
import { defaultLitAsserts, renderLitElement } from '@testing/lit';
import './table';

describe('TableElement', () => {
  let tableElement: TableElement;

  renderLitElement('mjf-table-element', element => tableElement = element);

  defaultLitAsserts(TableElement, () => tableElement);

  test('is registered', () => {
    expect(customElements.get('mjf-table-element')).toBeDefined();
  });

  test('renders headers from columns', async () => {
    tableElement.columns = [
      { title: 'Name', path: 'name' },
      { title: 'Age', path: 'age' },
    ];
    tableElement.data = [];
    await tableElement.updateComplete;

    const ths = tableElement.shadowRoot?.querySelectorAll('th');

    expect(ths?.length).toBe(2);
    expect(ths?.[0].textContent).toBe('Name');
    expect(ths?.[1].textContent).toBe('Age');
  });

  test('renders "No rows" when data is empty', async () => {
    tableElement.columns = [{ title: 'Name', path: 'name' }];
    tableElement.data = [];
    await tableElement.updateComplete;

    const td = tableElement.shadowRoot?.querySelector('td.empty');

    expect(td?.textContent?.trim()).toBe('No rows');
    expect(td?.getAttribute('colspan')).toBe('1');
  });

  test('renders rows with data and fallback', async () => {
    tableElement.columns = [
      { title: 'Name', path: 'name' },
      { title: 'City', path: 'address.city' },
    ];
    tableElement.data = [{ name: 'Alice' }];
    await tableElement.updateComplete;

    const rows = tableElement.shadowRoot?.querySelectorAll('tbody tr');
    const cells = rows?.[0].querySelectorAll('td');

    expect(rows?.length).toBe(1);
    expect(cells?.[0].textContent.trim()).toBe('Alice');
    expect(cells?.[1].textContent.trim()).toBe('N/A');
  });

  test('renders multiple rows correctly', async () => {
    tableElement.columns = [
      { title: 'Name', path: 'name' },
      { title: 'Age', path: 'age' },
    ];
    tableElement.data = [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
    ];
    await tableElement.updateComplete;

    const rows = tableElement.shadowRoot?.querySelectorAll('tbody tr');

    expect(rows?.length).toBe(2);
    expect(rows?.[0].querySelectorAll('td')[0].textContent.trim()).toBe('Alice');
    expect(rows?.[0].querySelectorAll('td')[1].textContent.trim()).toBe('30');
    expect(rows?.[1].querySelectorAll('td')[0].textContent.trim()).toBe('Bob');
    expect(rows?.[1].querySelectorAll('td')[1].textContent.trim()).toBe('25');
  });

  test('handles empty columns with empty data', async () => {
    tableElement.columns = [];
    tableElement.data = [];
    await tableElement.updateComplete;
    const td = tableElement.shadowRoot?.querySelector('td.empty');

    expect(td?.getAttribute('colspan')).toBe('0');
  });
});
