import { Button, Row } from '@core/ui';
import { ChangeEvent, useMemo, useState } from 'react';
import { SectionHeader } from '../shared';
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

  const handleOptionChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedOption(event.target.value);
  };

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
