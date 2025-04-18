type Size = `${ number }px`;
type Color = `#${ string }`;
type LineStyle = 'solid' | 'dotted' | 'dashed';

export interface ColorScheme {
  '--container-padding': Size,
  '--background': Color,
  '--base-text-color': Color,
  '--indentation': Size
  '--font-size': Size
  '--meta-info-color': Color,
  '--guideline-color': Color,
  '--guideline-style': LineStyle,
  '--string-literal-color': Color,
  '--boolean-literal-color': Color,
  '--number-literal-color': Color,
  '--null-literal-color': Color,
  '--object-key-color': Color,
  '--bracket-color': Color,
  '--colon-color': Color,
  '--comma-color': Color,
  '--toggle-color': Color,
  '--toggle-hover-color': Color,
  '--toggle-size': Size
}

export interface Preset {
  light?: ColorScheme,
  dark?: ColorScheme,
}
