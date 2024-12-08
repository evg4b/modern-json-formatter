export class LimitedArray<T> extends Array<T> {
  constructor(private readonly limit: number) {
    super();
  }

  public push(...items: T[]): number {
    if (this.length >= this.limit) {
      this.shift();
    }
    return super.push(...items);
  }
}
