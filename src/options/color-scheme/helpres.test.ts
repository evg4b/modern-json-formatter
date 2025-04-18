import { beforeAll, describe, jest, test } from '@jest/globals';
import { ModuleMocker } from 'jest-mock';
import { noop } from 'lodash';
import { compilePreset } from './helpres';
import { Preset } from './models';
import { dracula } from './presets/dracula';
import { googleChrome } from './presets/google-chrome';

describe('demo', () => {
  let warningSpy: ReturnType<ModuleMocker['spyOn']>;

  beforeAll(() => {
    warningSpy = jest.spyOn(console, 'warn')
      .mockImplementation(noop);
  });

  afterAll(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    warningSpy.mockRestore();
  });

  test('empty preset with warning', () => {
    const preset: Preset = {};

    const result = compilePreset(preset);

    expect(result).toBe('');
    expect(warningSpy).toHaveBeenCalledWith('Preset is empty');
  });

  test('preset with light theme only', () => {
    const preset: Preset = { light: googleChrome };

    const result = compilePreset(preset);

    expect(result).toMatchSnapshot();
  });

  test('preset with darl theme only', () => {
    const preset: Preset = { dark: googleChrome };

    const result = compilePreset(preset);

    expect(result).toMatchSnapshot();
  });

  test('preset with both themes', () => {
    const preset: Preset = { light: googleChrome, dark: dracula };

    const result = compilePreset(preset);

    expect(result).toMatchSnapshot();
  });
});
