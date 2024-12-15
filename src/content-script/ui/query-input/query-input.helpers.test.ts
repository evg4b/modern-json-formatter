import { describe, expect, test } from '@jest/globals';
import { isRedoEvent, isSubmitEvent, isUndoEvent, isWrapEvent } from './query-input.helpers';

interface TestCase { event: KeyboardEventInit; expected: boolean }

describe('isUndoEvent', () => {
  const cases: TestCase[] = [
    { event: { key: 'z', metaKey: true, shiftKey: false }, expected: true },
    { event: { key: 'z', ctrlKey: true, shiftKey: false }, expected: true },
    { event: { key: 'a', metaKey: true, shiftKey: false }, expected: false },
    { event: { key: 'a', ctrlKey: true, shiftKey: false }, expected: false },
    { event: { key: 'z', metaKey: false, shiftKey: false }, expected: false },
    { event: { key: 'z', ctrlKey: false, shiftKey: false }, expected: false },
  ];

  test.each(cases)('should return $expected for event $event', ({ event, expected }) => {
    expect(isUndoEvent(new KeyboardEvent('keydown', event))).toBe(expected);
  });
});

describe('isRedoEvent', () => {
  const cases: TestCase[] = [
    { event: { key: 'z', metaKey: true, shiftKey: true }, expected: true },
    { event: { key: 'z', ctrlKey: true, shiftKey: true }, expected: true },
    { event: { key: 'z', metaKey: true, shiftKey: false }, expected: false },
    { event: { key: 'a', metaKey: true, shiftKey: true }, expected: false },
  ];

  test.each(cases)('should return $expected for event $event', ({ event, expected }) => {
    expect(isRedoEvent(new KeyboardEvent('keydown', event))).toBe(expected);
  });
});

describe('isWrapEvent', () => {
  const brackets = { '(': ')', '[': ']', '{': '}' };

  const cases: TestCase[] = [
    { event: { key: '(' }, expected: true },
    { event: { key: '[' }, expected: true },
    { event: { key: 'a' }, expected: false },
    { event: { key: ')' }, expected: false },
  ];

  test.each(cases)('should return $expected for event $event', ({ event, expected }) => {
    expect(isWrapEvent(new KeyboardEvent('keydown', event), brackets)).toBe(expected);
  });
});

describe('isSubmitEvent', () => {
  const cases: TestCase[] = [
    { event: { key: 'Enter' }, expected: true },
    { event: { key: 'a' }, expected: false },
    { event: { key: 'Tab' }, expected: false },
  ];

  test.each(cases)('should return $expected for event $event', ({ event, expected }) => {
    expect(isSubmitEvent(new KeyboardEvent('keydown', event))).toBe(expected);
  });
});
