import { describe, expect, test } from '@jest/globals';
import { HistoryManager } from './history-manager';

describe('HistoryManager', () => {
  describe('undo', () => {
    test('should undo the last change and return the previous state', () => {
      const historyManager = new HistoryManager<number>();
      historyManager.save(1);
      historyManager.save(2);
      expect(historyManager.undo()).toBe(1);
    });

    test('should return null if there are no previous states', () => {
      const historyManager = new HistoryManager<number>();
      expect(historyManager.undo()).toBeNull();
    });
  });

  describe('redo', () => {
    test('should redo the last undone change and return the restored state', () => {
      const historyManager = new HistoryManager<number>();
      historyManager.save(1);
      historyManager.save(2);
      historyManager.undo();
      expect(historyManager.redo()).toBe(2);
    });

    test('should return null if there are no future states', () => {
      const historyManager = new HistoryManager<number>();
      historyManager.save(1);
      historyManager.undo();
      expect(historyManager.redo()).toBeNull();
    });
  });

  describe('save', () => {
    test('should save a new item in the history and clear any undone changes', () => {
      const historyManager = new HistoryManager<number>();
      historyManager.save(1);
      historyManager.save(2);
      historyManager.save(3);
      historyManager.undo();
      historyManager.undo();
      historyManager.save(10);
      expect(historyManager.redo()).toEqual(null);
    });
  });
});
