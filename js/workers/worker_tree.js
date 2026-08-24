self.onmessage = function(e) {
    const data = e.data;
    const array = [...data.array];
    const algoType = data.algo;
    
    let generator;
    if (algoType === 'bfs') {
        generator = bfs(array);
    } else if (algoType === 'dfs_pre') {
        generator = dfsPreOrder(array);
    } else if (algoType === 'dfs_in') {
        generator = dfsInOrder(array);
    } else if (algoType === 'dfs_post') {
        generator = dfsPostOrder(array);
    }

    const steps = [];
    let result = generator.next();
    
    while (!result.done) {
        steps.push(result.value);
        result = generator.next();
    }
    
    self.postMessage(steps);
};

function* bfs(arr) {
    if (arr.length === 0 || arr[0] === null) return;
    
    const queue = [0];
    const visited = [];

    while (queue.length > 0) {
        const curr = queue.shift();
        yield { array: arr, visiting: curr, visited: [...visited], msg: `Visiting Node: ${arr[curr]}` };
        visited.push(curr);

        const left = 2 * curr + 1;
        const right = 2 * curr + 2;

        if (left < arr.length && arr[left] !== null) queue.push(left);
        if (right < arr.length && arr[right] !== null) queue.push(right);
    }
    yield { array: arr, visiting: null, visited, msg: "Traversal Complete" };
}

function* dfsPreOrder(arr) {
    const visited = [];
    yield* traversePreOrder(0, arr, visited);
    yield { array: arr, visiting: null, visited, msg: "Traversal Complete" };
}

function* traversePreOrder(idx, arr, visited) {
    if (idx >= arr.length || arr[idx] === null) return;
    
    yield { array: arr, visiting: idx, visited: [...visited], msg: `Visiting Node: ${arr[idx]}` };
    visited.push(idx);
    
    yield* traversePreOrder(2 * idx + 1, arr, visited);
    yield* traversePreOrder(2 * idx + 2, arr, visited);
}

function* dfsInOrder(arr) {
    const visited = [];
    yield* traverseInOrder(0, arr, visited);
    yield { array: arr, visiting: null, visited, msg: "Traversal Complete" };
}

function* traverseInOrder(idx, arr, visited) {
    if (idx >= arr.length || arr[idx] === null) return;
    
    yield* traverseInOrder(2 * idx + 1, arr, visited);
    
    yield { array: arr, visiting: idx, visited: [...visited], msg: `Visiting Node: ${arr[idx]}` };
    visited.push(idx);
    
    yield* traverseInOrder(2 * idx + 2, arr, visited);
}

function* dfsPostOrder(arr) {
    const visited = [];
    yield* traversePostOrder(0, arr, visited);
    yield { array: arr, visiting: null, visited, msg: "Traversal Complete" };
}

function* traversePostOrder(idx, arr, visited) {
    if (idx >= arr.length || arr[idx] === null) return;
    
    yield* traversePostOrder(2 * idx + 1, arr, visited);
    yield* traversePostOrder(2 * idx + 2, arr, visited);
    
    yield { array: arr, visiting: idx, visited: [...visited], msg: `Visiting Node: ${arr[idx]}` };
    visited.push(idx);
}