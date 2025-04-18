import { ColorScheme, Preset } from './models';

function compileColorScheme(scheme: ColorScheme | undefined) {
  if (!scheme) {
    return null;
  }

  return Object.entries(scheme)
    .map((prop) => prop.join(':'))
    .join(';');
}

export const compilePreset = (preset: Preset): string => {
  const light = compileColorScheme(preset.light);
  const dark = compileColorScheme(preset.dark);

  if (!light && !dark) {
    console.warn('Preset is empty');

    return '';
  }

  if (light && dark) {
    return [
      `@media(prefers-color-scheme:dark){:host{${ dark }}}`,
      `@media(prefers-color-scheme:light){ :host{${ light }}}`,
    ].join('\n');
  }

  return `:host{${ light ?? dark }}`;
};
