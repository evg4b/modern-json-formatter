export class HistoryManager<T> {
  private readonly history: T[] = [];
  private historyIndex = -1;

  save(state: T) {
    if (this.historyIndex < this.history.length - 1) {
      this.history.splice(this.historyIndex + 1);
    }

    this.history.push(state);
    this.historyIndex = this.history.length - 1;
  }

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      return this.history[this.historyIndex];
    }
    return null;
  }

  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      return this.history[this.historyIndex];
    }
    return null;
  }
}
