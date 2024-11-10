export const trim = (value: string, chars: string) => {
  const pattern = new RegExp(`^[${chars}]+|[${chars}]+$`, 'g');
  return value.replace(pattern, '');
};
