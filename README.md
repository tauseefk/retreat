## Retreat

Ring buffer with movable head for undo/redo.

#### Basic undo/redo operations

```typescript
// - Create a new retreat to track values
const retreat = new Retreat<number>();

// - Push values and navigate through history
retreat.push(1);
retreat.push(2);
retreat.push(3);
// ST: [1, 2, *3]

retreat.undo();
// ST: [1, *2, 3]

retreat.redo();
// ST: [1, 2, *3]
```

#### Ring buffer with capacity

```typescript
// - Capacity of 3 creates a ring buffer that maintains only the last 3 values
// - Older values are automatically discarded when capacity is exceeded
const limitedRetreat = new Retreat<number>(3);

[10, 20, 30, 40, 50].forEach((num) => limitedRetreat.push(num));
// ST: [30, 40, *50] - Only last 3 remain

limitedRetreat.undo();
// ST: [30, *40, 50]
```

#### Cleanup handler

```typescript
// - Optional cleanup function is called when values are discarded
const retreat = new Retreat<number>(2, (num) => {
  console.log(`CL: ${num}`);
});

retreat.push(100);
retreat.push(200);
retreat.push(300); // Logs: "CL: 100"
// ST: [200, *300]
```
