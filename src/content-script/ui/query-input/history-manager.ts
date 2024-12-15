/**
 * A class responsible for managing the history of changes.
 *
 * @template T The type of items being managed.
 */
export class HistoryManager<T> {
  private readonly history: T[] = [];
  private readonly future: T[] = [];
  private current: T | null = null;

  /**
   * Undoes the last change, returning the previous state.
   *
   * @returns {T | null} The previous state of the item, or null if there are no previous states.
   */
  public undo(): T | null {
    return this.swap(this.history, this.future);
  }

  /**
   * Redoes the last undone change, returning the restored state.
   *
   * @returns {T | null} The restored state of the item, or null if there are no future states.
   */
  public redo(): T | null {
    return this.swap(this.future, this.history);
  }

  /**
   * Saves a new item in the history and clears any undone changes.
   *
   * @param {T} item The item to save.
   */
  public save(item: T) {
    if (this.current) {
      this.history.push(this.current);
    }
    this.current = item;
    this.future.length = 0;
  }

  private swap(a: T[], b: T[]): T | null {
    if (!a.length) {
      return null;
    }

    if (this.current) {
      b.push(this.current);
    }

    this.current = a.pop() ?? null;

    return this.current;
  }
}
