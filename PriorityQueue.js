// PriorityQueue.js
class PriorityQueue {
    constructor() {
        this.items = [];
    }
    enqueue(item, priority) {
        this.items.push({ item, priority });
        this.items.sort((a, b) => b.priority - a.priority); // Highest priority first
    }
    dequeue() {
        return this.items.shift().item;
    }
    isEmpty() {
        return this.items.length === 0;
    }
}

module.exports = PriorityQueue;
