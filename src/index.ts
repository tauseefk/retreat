export class Retreat<T> {
  private readonly capacity: number;
  private items: (T | null)[];
  // Highest index written
  private maxIdx = -1;
  // Current position in history
  private currentIdx = -1;
  // Oldest valid entry (least recently updated)
  private monotonicLRUIdx = -1;

  constructor(
    capacity = 10,
    /* called when items are removed from history */
    private cleanupFn?: (item: T) => void,
  ) {
    this.capacity = capacity;
    this.items = new Array(this.capacity).fill(null);
  }

  /**
   * Adds a new item to history. Advances currentIdx first, then adds item.
   * This handles insertions naturally - if user undoes then pushes, it inserts at next position.
   */
  push(item: T): void {
    // Advance current index first
    this.currentIdx++;

    const ringPosition = this.currentIdx % this.capacity;

    const currentItem = this.items[ringPosition];
    // Clean up existing item at this position if it exists
    if (currentItem && this.cleanupFn) {
      this.cleanupFn(currentItem);
    }

    this.items[ringPosition] = item;

    this.maxIdx = this.currentIdx;

    // Update LRU index only when overwriting (capacity exceeded)
    if (this.currentIdx >= this.capacity) {
      this.monotonicLRUIdx = this.currentIdx - this.capacity + 1;
    } else if (this.monotonicLRUIdx === -1) {
      this.monotonicLRUIdx = 0;
    }
  }

  /**
   * Gets the item at current position in history.
   * Returns null if no current position is set.
   */
  get(): T | null {
    if (this.currentIdx === -1) return null;

    const ringPosition = this.currentIdx % this.capacity;
    return this.items[ringPosition];
  }

  /**
   * Moves back in history (undo operation).
   * Returns true if successful, false if already at oldest position.
   */
  undo(): boolean {
    if (this.currentIdx <= this.monotonicLRUIdx) return false;

    this.currentIdx--;
    return true;
  }

  /**
   * Moves forward in history (redo operation).
   * Returns true if successful, false if already at newest position.
   */
  redo(): boolean {
    if (this.currentIdx >= this.maxIdx) return false;

    this.currentIdx++;
    return true;
  }

  /**
   * Checks if undo operation is possible.
   */
  canUndo(): boolean {
    return this.currentIdx > this.monotonicLRUIdx;
  }

  /**
   * Checks if redo operation is possible.
   */
  canRedo(): boolean {
    return this.currentIdx < this.maxIdx;
  }

  /**
   * Gets the total number of items currently stored.
   */
  getSize(): number {
    if (this.maxIdx === -1) return 0;
    return this.maxIdx - this.monotonicLRUIdx + 1;
  }

  /**
   * Clears all items from history and resets indices.
   * Calls cleanup function on all stored items if provided.
   */
  clear(): void {
    if (this.cleanupFn) {
      for (const item of this.items) {
        if (item) this.cleanupFn(item);
      }
    }
    this.items.fill(null);
    this.maxIdx = -1;
    this.currentIdx = -1;
    this.monotonicLRUIdx = -1;
  }
}
