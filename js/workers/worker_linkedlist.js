self.onmessage = function(e) {
    const data = e.data;
    const array = [...data.array];
    const algoType = data.algo;
    
    let generator;
    if (algoType === 'reverse') {
        generator = reverseList(array);
    } else if (algoType === 'middle') {
        generator = findMiddle(array);
    } else if (algoType === 'cycle') {
        generator = detectCycle(array);
    }

    const steps = [];
    let result = generator.next();
    
    while (!result.done) {
        steps.push(result.value);
        result = generator.next();
    }
    
    self.postMessage(steps);
};

function buildInitialLinks(len) {
    const links = [];
    for (let i = 0; i < len; i++) {
        links.push(i === len - 1 ? null : i + 1);
    }
    return links;
}

function* reverseList(arr) {
    let links = buildInitialLinks(arr.length);
    let prev = null;
    let curr = 0;
    let head = 0;

    yield { array: arr, links: [...links], pointers: { head, curr }, activeNodes: [curr], msg: "Initialize curr at head, prev as null" };

    while (curr !== null) {
        let next = links[curr];
        
        yield { array: arr, links: [...links], pointers: { head, prev, curr, next }, activeNodes: [curr, next], msg: "Save next node" };
        
        links[curr] = prev;
        
        yield { array: arr, links: [...links], pointers: { head, prev, curr, next }, activeNodes: [curr], activeLinks: [[curr, prev]], msg: "Reverse current node's pointer" };
        
        prev = curr;
        curr = next;
        
        if (curr !== null) {
            yield { array: arr, links: [...links], pointers: { head, prev, curr }, activeNodes: [prev, curr], msg: "Advance prev and curr" };
        }
    }
    
    head = prev;
    yield { array: arr, links: [...links], pointers: { head }, targetNodes: [head], msg: "List Reversed. Update Head." };
}

function* findMiddle(arr) {
    let links = buildInitialLinks(arr.length);
    let slow = 0;
    let fast = 0;

    yield { array: arr, links: [...links], pointers: { slow, fast }, activeNodes: [0], msg: "Initialize slow and fast at head" };

    while (fast !== null && links[fast] !== null) {
        slow = links[slow];
        fast = links[links[fast]];
        
        yield { array: arr, links: [...links], pointers: { slow, fast }, activeNodes: [slow, fast], msg: "Move slow by 1, fast by 2" };
    }

    yield { array: arr, links: [...links], pointers: { slow }, targetNodes: [slow], msg: `Middle node found: ${arr[slow]}` };
}

function* detectCycle(arr) {
    let links = buildInitialLinks(arr.length);
    
    const cycleStart = Math.max(1, Math.floor(arr.length / 3));
    links[arr.length - 1] = cycleStart;
    
    let slow = 0;
    let fast = 0;

    yield { array: arr, links: [...links], pointers: { slow, fast }, activeNodes: [0], msg: "Simulated cycle created. Init slow and fast." };

    let cycleDetected = false;

    while (fast !== null && links[fast] !== null) {
        slow = links[slow];
        fast = links[links[fast]];
        
        yield { array: arr, links: [...links], pointers: { slow, fast }, activeNodes: [slow, fast], msg: "Move slow by 1, fast by 2" };
        
        if (slow === fast) {
            cycleDetected = true;
            break;
        }
    }

    if (cycleDetected) {
        yield { array: arr, links: [...links], pointers: { slow, fast }, cycleNodes: [slow], msg: `Cycle detected at node ${arr[slow]}!` };
    } else {
        yield { array: arr, links: [...links], pointers: {}, msg: "No cycle detected." };
    }
}