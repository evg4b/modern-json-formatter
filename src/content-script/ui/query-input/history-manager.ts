export class HistoryManager<T> {
  private history: T[] = [];
  private future: T[] = [];
  private current: T | null = null;

  public undo(): T | null {
    const item = this.history.pop() ?? null;
    if (item) {
      this.future.push(item);
    }

    this.print();
    return item;
  }

  public redo(): T | null {
    let item = this.future.pop() ?? null;
    if (item) {
      this.history.push(item);
    } else {
      item = this.current as any;
    }

    this.print();
    return item;
  }

  public save(item: T) {
    if (this.current) {
      this.history.push(this.current)
    }

    this.future = [];
    this.current = item;
    this.print();
  }

  private print() {
    console.clear();
    console.info('History')
    console.table(this.history);
    console.info('Future')
    console.table(this.future);
  }
}
