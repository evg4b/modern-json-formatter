export const isUndoEvent = (event: KeyboardEvent) => {
  return (event.metaKey || event.ctrlKey) && event.key === 'z' && !event.shiftKey;
};

export const isRedoEvent = (event: KeyboardEvent) => {
  return (event.metaKey || event.ctrlKey) && event.key === 'z' && event.shiftKey;
};

export const isWrapEvent = (event: KeyboardEvent, brackets: Record<string, string>) => {
  return event.key in brackets;
};

export const isSubmitEvent = (event: KeyboardEvent) => {
  return event.key === 'Enter';
};
