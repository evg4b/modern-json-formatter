export class HistoryManager<T> {
  private history: T[] = [];
  private future: T[] = [];
  private current: T | null = null;
  private readonly sizeLimit: number;

  constructor(sizeLimit: number = 50) {
    this.sizeLimit = sizeLimit; // Limit the size of the history
  }

  /**
   * Saves a new state to the history, clearing the redo stack and enforcing the size limit.
   * @param state The new state to save.
   */
  save(state: T): void {
    if (this.current !== null) {
      this.history.push(this.current);
      if (this.history.length > this.sizeLimit) {
        this.history.shift(); // Remove the oldest state if limit is exceeded
      }
    }
    this.current = state;
    this.future = []; // Clear future states
  }

  /**
   * Undoes the last action, if possible, and returns the previous state.
   * @returns The previous state, or null if undo is not possible.
   */
  undo(): T | null {
    if (this.history.length === 0) {
      return null; // Nothing to undo
    }
    if (this.current !== null) {
      this.future.push(this.current);
    }
    this.current = this.history.pop() || null;
    return this.current;
  }

  /**
   * Redoes the next action, if possible, and returns the next state.
   * @returns The next state, or null if redo is not possible.
   */
  redo(): T | null {
    if (this.future.length === 0) {
      return null; // Nothing to redo
    }
    if (this.current !== null) {
      this.history.push(this.current);
    }
    this.current = this.future.pop() || null;
    return this.current;
  }

  /**
   * Gets the current state.
   * @returns The current state.
   */
  getCurrentState(): T | null {
    return this.current;
  }
}
