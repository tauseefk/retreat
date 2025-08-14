import { Retreat } from './index.js';

const history = new Retreat<number>();

// [*START]
console.log('OP: push(1)');
history.push(1);
// ST: [*1]
console.log(` V: ${history.get()}`);

console.log('\nOP: push(2)');
history.push(2);
// ST: [1, *2]
console.log(` V: ${history.get()}`);

console.log('\nOP: push(3)');
history.push(3);
// ST: [1, 2, *3]
console.log(` V: ${history.get()}`);

console.log('\nOP: undo()');
history.undo();
// ST: [1, *2, 3]
console.log(` V: ${history.get()}`);

console.log('\nOP: undo()');
history.undo();
// ST: [*1, 2, 3]
console.log(` V: ${history.get()}`);

console.log('\nOP: redo()');
history.redo();
// ST: [1, *2, 3]
console.log(` V: ${history.get()}`);

console.log('\nOP: redo()');
history.redo();
// ST: [1, 2, *3]
console.log(` V: ${history.get()}`);

// Capacity of 3 creates a ring buffer
const boundedHistory = new Retreat<number>(3);

console.log('\n\n=== INIT (cap 3) ===');
// [*START]

console.log('OP: push(10, 20, 30, 40, 50)');
[10, 20, 30, 40, 50].forEach((num) => boundedHistory.push(num));
// ST: [30, 40, *50] - Only last 3 remain
console.log(` V: ${boundedHistory.get()}`);
console.log(`Size: ${boundedHistory.getSize()}`);

console.log('\nOP: undo()');
boundedHistory.undo();
// ST: [30, *40, 50]
console.log(` V: ${boundedHistory.get()}`);

console.log('\nOP: undo()');
boundedHistory.undo();
// ST: [*30, 40, 50]
console.log(` V: ${boundedHistory.get()}`);

console.log(`U?: ${boundedHistory.canUndo()}`);

const cleanup = new Retreat<number>(2, (num) => {
  console.log(`CL: ${num}`);
});

console.log('\n\n=== CLEANUP (cap 2) ===');
// [*START]

console.log('OP: push(100)');
cleanup.push(100);
// ST: [*100]
console.log(` V: ${cleanup.get()}`);

console.log('\nOP: push(200)');
cleanup.push(200);
// ST: [100, *200]
console.log(` V: ${cleanup.get()}`);

console.log('\nOP: push(300)');
cleanup.push(300); // This will cleanup 100
// ST: [200, *300]
console.log(` V: ${cleanup.get()}`);

console.log('\nOP: undo()');
cleanup.undo();
// ST: [*200, 300]
console.log(` V: ${cleanup.get()}`);

console.log('\nOP: push(400)');
cleanup.push(400); // This will cleanup 300
// ST: [200, *400]
console.log(` V: ${cleanup.get()}`);

console.log('\nOP: clear()');
cleanup.clear(); // This will cleanup remaining numbers
// ST: [*START]
console.log(` V: ${cleanup.get()}`);
