export const trim = (value: string, chars: string = ' \t\n\r') => {
  const pattern = new RegExp(`^[${chars}]+|[${chars}]+$`, 'g');
  return value.replace(pattern, '');
};
