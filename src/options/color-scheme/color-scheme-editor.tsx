import { local } from '@core/browser';
import { Button, Row } from '@core/ui';
import { ChangeEvent, useCallback, useMemo, useState } from 'react';
import { SectionHeader } from '../shared';
import { compilePreset } from './helpres';
import { presets } from './presets';
import { Preview } from './preview';

const options = Object.entries(presets)
  .map(([key, value]) => ({ key, value }));

export const ColorSchemeEditor = () => {
  const [selectedOption, setSelectedOption] = useState(options[0].key);

  const preset = useMemo(
    () => presets[selectedOption],
    [selectedOption],
  );

  const handleOptionChange = useCallback(async (event: ChangeEvent<HTMLSelectElement>) => {
    const preset = presets[event.target.value];
    setSelectedOption(event.target.value);
    await local.set({
      'color-scheme': compilePreset({ light: preset }),
      'stub-style': `:host { background-color: ${ preset['--background'] }; color: ${ preset['--base-text-color'] }; display: block; }`,
    });
  }, [setSelectedOption])

  return (
    <>
      <SectionHeader header="Color scheme">
        <Button>
          Reset
        </Button>
      </SectionHeader>
      <Row>
        Preset:
        <select value={ selectedOption } onChange={ handleOptionChange }>
          { options.map((option) => (
            <option key={ option.key } value={ option.key }>
              { option.key }
            </option>
          )) }
        </select>
      </Row>
      <Preview preset={ preset }/>
    </>
  );
};
