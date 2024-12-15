export class HistoryManager<T> {
  private history: T[] = [];
  private current: T | null = null;
  private future: T[] = [];

  public undo(): T | null {
    if (!this.history.length) {
      return null;
    }

    if (this.current) {
      this.future.push(this.current);
    }

    return this.current = this.history.pop() ?? null;
  }

  public redo(): T | null {
    if (!this.future.length) {
      return null;
    }

    if (this.current) {
      this.history.push(this.current);
    }

    return this.current = this.future.pop() ?? null;
  }

  public save(item: T) {
    if (this.current) {
      this.history.push(this.current);
    }
    this.current = item;
    this.future = [];
  }
}
