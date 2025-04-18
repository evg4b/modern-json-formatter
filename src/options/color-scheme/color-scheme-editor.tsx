import { Button, Row, Table, TableColumn } from '@core/ui';
import { useMemo, useState } from 'react';
import { SectionHeader } from '../shared';
import { presets } from './presets';

const columns: TableColumn[] = [
  { name: 'Variable', path: 'key' },
  { name: 'Value', path: 'value' },
];

const options = Object.entries(presets)
  .map(([key, value]) => {
    return {
      key,
      value,
    };
  });

export const ColorSchemeEditor = () => {
  const [selectedOption, setSelectedOption] = useState(options[0].key);

  const preset = useMemo(
    () => Object.entries(presets[selectedOption]).map(([key, value]) => ({ key, value })),
    [selectedOption],
  );

  const handleOptionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
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
      <Table data={ preset } columns={ columns }/>;
    </>
  );
};
