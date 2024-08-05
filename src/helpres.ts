export const throws = (value?: string): never => {
    throw new Error(value ?? 'Unexpected value');
};
