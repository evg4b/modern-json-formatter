export const wait = <T>(request: IDBRequest<T>): Promise<T> => new Promise((resolve, reject) => {
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => {
    const error = request.error ?? new Error('IDBRequest failed');
    reject(error);
  };
});
