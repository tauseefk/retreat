import { describe, expect, it, vi } from 'vitest';
import { Retreat } from './index';

describe('Retreat', () => {
  describe('basic functionality', () => {
    it('should initialize empty', () => {
      const retreat = new Retreat<number>();

      expect(retreat.getSize()).toBe(0);
      expect(retreat.get()).toBeNull();
      expect(retreat.canUndo()).toBe(false);
      expect(retreat.canRedo()).toBe(false);
    });

    it('should push items correctly', () => {
      const retreat = new Retreat<number>();

      retreat.push(1);
      expect(retreat.getSize()).toBe(1);
      expect(retreat.get()).toBe(1);

      retreat.push(2);
      expect(retreat.get()).toBe(2);
      expect(retreat.getSize()).toBe(2);
    });

    it('should handle get() at different positions', () => {
      const retreat = new Retreat<string>();

      ['a', 'b', 'c'].forEach((item) => retreat.push(item));

      expect(retreat.get()).toBe('c');

      retreat.undo();
      expect(retreat.get()).toBe('b');

      retreat.undo();
      expect(retreat.get()).toBe('a');
    });
  });

  describe('undo/redo operations', () => {
    it('should handle basic undo/redo', () => {
      const retreat = new Retreat<number>();

      [1, 2, 3].forEach((item) => retreat.push(item));

      expect(retreat.get()).toBe(3);
      expect(retreat.canUndo()).toBe(true);
      expect(retreat.canRedo()).toBe(false);

      expect(retreat.undo()).toBe(true);
      expect(retreat.get()).toBe(2);
      expect(retreat.canRedo()).toBe(true);

      expect(retreat.undo()).toBe(true);
      expect(retreat.get()).toBe(1);

      expect(retreat.undo()).toBe(false);
      expect(retreat.get()).toBe(1);

      expect(retreat.redo()).toBe(true);
      expect(retreat.get()).toBe(2);

      expect(retreat.redo()).toBe(true);
      expect(retreat.get()).toBe(3);

      expect(retreat.redo()).toBe(false);
      expect(retreat.redo()).toBe(false);
    });
  });

  describe('insertion after undo (branching)', () => {
    it('should handle insertion after undo correctly', () => {
      const retreat = new Retreat<string>();

      ['a', 'b', 'c', 'd', 'e'].forEach((item) => retreat.push(item));

      retreat.undo();
      expect(retreat.get()).toBe('d');

      retreat.push('x');
      expect(retreat.get()).toBe('x');
      expect(retreat.canRedo()).toBe(false);
    });

    it('should handle multiple undos then push', () => {
      const retreat = new Retreat<number>();

      // Build: 1 -> 2 -> 3 -> 4 -> 5
      for (let i = 1; i <= 5; i++) {
        retreat.push(i);
      }

      // Undo twice: currentIdx = 2 (item 3)
      retreat.undo();
      retreat.undo();
      expect(retreat.get()).toBe(3);

      // Push 99: should go to at idx 3
      retreat.push(99);
      expect(retreat.get()).toBe(99);

      expect(retreat.redo()).toBe(false);

      // size should be 3
      expect(retreat.getSize()).toBe(4);
    });
  });

  describe('ring buffer behavior', () => {
    it('should handle capacity overflow', () => {
      const retreat = new Retreat<number>(3);

      [1, 2, 3].forEach((item) => retreat.push(item));

      expect(retreat.getSize()).toBe(3);

      retreat.push(4);

      expect(retreat.getSize()).toBe(3);

      expect(retreat.get()).toBe(4);

      retreat.undo();
      expect(retreat.get()).toBe(3);

      retreat.undo();
      expect(retreat.get()).toBe(2);
    });

    it('should prevent undo beyond LRU after overflow', () => {
      const retreat = new Retreat<string>(3);

      ['a', 'b', 'c', 'd', 'e'].forEach((item) => retreat.push(item));

      expect(retreat.undo()).toBe(true);
      expect(retreat.get()).toBe('d');

      expect(retreat.undo()).toBe(true);
      expect(retreat.get()).toBe('c');

      expect(retreat.undo()).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle single item operations', () => {
      const retreat = new Retreat<number>(1);

      retreat.push(42);

      expect(retreat.get()).toBe(42);
      expect(retreat.canUndo()).toBe(false);
      expect(retreat.canRedo()).toBe(false);

      retreat.push(100);

      expect(retreat.get()).toBe(100);
      expect(retreat.getSize()).toBe(1);
    });

    it('should handle empty operations', () => {
      const retreat = new Retreat<string>();

      expect(retreat.undo()).toBe(false);
      expect(retreat.redo()).toBe(false);
      expect(retreat.get()).toBeNull();
    });
  });

  describe('cleanup function', () => {
    it('should call cleanup when overwriting in ring buffer', () => {
      const cleanup = vi.fn();
      const retreat = new Retreat<object>(2, cleanup);

      const obj1 = { id: 1 };
      const obj2 = { id: 2 };
      const obj3 = { id: 3 };

      retreat.push(obj1);
      retreat.push(obj2);

      expect(cleanup).not.toHaveBeenCalled();

      retreat.push(obj3);

      expect(cleanup).toHaveBeenCalledWith(obj1);
      expect(cleanup).toHaveBeenCalledTimes(1);
    });

    it('should call cleanup on clear', () => {
      const cleanup = vi.fn();
      const retreat = new Retreat<string>(5, cleanup);

      ['a', 'b', 'c'].forEach((item) => retreat.push(item));

      retreat.clear();

      expect(cleanup).toHaveBeenCalledWith('a');
      expect(cleanup).toHaveBeenCalledWith('b');
      expect(cleanup).toHaveBeenCalledWith('c');
      expect(cleanup).toHaveBeenCalledTimes(3);

      expect(retreat.getSize()).toBe(0);
    });

    it('should call cleanup when inserting after undo', () => {
      const cleanup = vi.fn();
      const retreat = new Retreat<string>(5, cleanup);

      ['a', 'b', 'c'].forEach((item) => retreat.push(item));

      retreat.undo();

      retreat.push('x');

      expect(cleanup).toHaveBeenCalledWith('c');
      expect(cleanup).toHaveBeenCalledTimes(1);
    });

    it('should not call cleanup when no cleanup function provided', () => {
      const retreat = new Retreat<number>(2);

      [1, 2, 3].forEach((item) => retreat.push(item));

      expect(() => retreat.clear()).not.toThrow();
    });
  });
});
