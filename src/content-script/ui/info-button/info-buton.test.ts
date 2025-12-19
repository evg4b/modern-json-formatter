import { describe, expect, test } from '@rstest/core';

describe('info-button', () => {
  test('should render button link', () => {
    const button = document.createElement('mjf-info-button');
    expect(button).toBeDefined();
  });
});
