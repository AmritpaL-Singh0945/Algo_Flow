// js/worker_search.js

self.onmessage = function(e) {
    const data = e.data;
    const array = [...data.array];
    const target = data.target;
    
    let generator = binarySearch(array, target);

    const steps = [];
    let result = generator.next();
    
    while (!result.done) {
        steps.push(result.value);
        result = generator.next();
    }
    
    self.postMessage(steps);
};

function* binarySearch(arr, target) {
    let left = 0;
    let right = arr.length - 1;
    
    while (left <= right) {
        yield { array: [...arr], left, right, mid: null, type: 'bounds', msg: `Search space: [${left}] to [${right}]` };
        
        let mid = Math.floor((left + right) / 2);
        yield { array: [...arr], left, right, mid, type: 'mid', msg: `Checking Mid Index: ${mid} (Value: ${arr[mid]})` };
        
        if (arr[mid] === target) {
            yield { array: [...arr], left, right, mid, type: 'found', msg: `Target ${target} found at index ${mid}!` };
            return;
        } else if (arr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    yield { array: [...arr], left: null, right: null, mid: null, type: 'not-found', msg: `Target ${target} not found in array.` };
}