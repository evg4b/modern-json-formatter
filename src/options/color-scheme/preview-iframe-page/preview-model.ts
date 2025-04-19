import { TupleNode } from '@worker-core';

export const previewModel: TupleNode = {
  type: 'tuple',
  items: [
    {
      type: 'object',
      properties: [
        { key: 'background', value: { type: 'string', value: '#000000' } },
        { key: 'color', value: { type: 'string', value: '#FFFFFF' } },
        { key: 'border-color', value: { type: 'string', value: '#FFFFFF' } },
        { key: 'font-size', value: { type: 'number', value: '16px' } },
      ],
    },
    {
      type: 'array',
      items: [
        { type: 'string', value: 'background-color' },
        { type: 'string', value: 'color' },
        { type: 'string', value: 'border-color' },
        { type: 'string', value: 'font-size' },
      ]
    },
  ],
};
