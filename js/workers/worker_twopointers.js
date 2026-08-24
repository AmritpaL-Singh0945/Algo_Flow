self.onmessage = function(e) {
    const data = e.data;
    const algoType = data.algo;
    
    let generator;
    if (algoType === 'reverse') {
        generator = reverseArray([...data.array]);
    } else if (algoType === 'palindrome') {
        generator = validPalindrome(data.arrayStr);
    } else if (algoType === 'twosum') {
        generator = twoSumII([...data.array], data.target);
    }

    const steps = [];
    let result = generator.next();
    
    while (!result.done) {
        steps.push(result.value);
        result = generator.next();
    }
    
    self.postMessage(steps);
};

function* reverseArray(arr) {
    let left = 0;
    let right = arr.length - 1;

    yield { array: [...arr], pointers: { left, right }, activeIndices: [left, right], type: 'compare', msg: `Initialize Left at index ${left}, Right at index ${right}` };

    while (left < right) {
        yield { array: [...arr], pointers: { left, right }, activeIndices: [left, right], type: 'compare', msg: `Comparing elements ${arr[left]} and ${arr[right]}` };
        
        let temp = arr[left];
        arr[left] = arr[right];
        arr[right] = temp;
        
        yield { array: [...arr], pointers: { left, right }, activeIndices: [left, right], type: 'swap', msg: `Swapping ${arr[right]} and ${arr[left]}` };
        
        left++;
        right--;
    }

    yield { array: [...arr], pointers: {}, successIndices: arr.map((_, i) => i), type: 'success', msg: "Array successfully reversed!" };
}

function* validPalindrome(str) {
    let arr = str.split('');
    let left = 0;
    let right = arr.length - 1;

    yield { array: arr, pointers: { left, right }, activeIndices: [left, right], type: 'compare', msg: "Checking palindrome bounds" };

    while (left < right) {
        if (arr[left].toLowerCase() !== arr[right].toLowerCase()) {
            yield { array: arr, pointers: { left, right }, activeIndices: [left, right], type: 'swap', msg: `Mismatch found: '${arr[left]}' !== '${arr[right]}'` };
            return;
        }
        
        yield { array: arr, pointers: { left, right }, activeIndices: [left, right], type: 'compare', msg: `Characters match: '${arr[left]}' === '${arr[right]}'` };
        left++;
        right--;
    }

    yield { array: arr, pointers: {}, successIndices: arr.map((_, i) => i), type: 'success', msg: "Valid Palindrome confirmed!" };
}

function* twoSumII(arr, target) {
    let left = 0;
    let right = arr.length - 1;

    yield { array: [...arr], pointers: { left, right }, activeIndices: [left, right], type: 'compare', msg: `Searching target ${target} in sorted array` };

    while (left < right) {
        let sum = arr[left] + arr[right];
        
        yield { array: [...arr], pointers: { left, right }, activeIndices: [left, right], type: 'compare', msg: `Sum of arr[${left}] (${arr[left]}) + arr[${right}] (${arr[right]}) = ${sum}` };

        if (sum === target) {
            yield { array: [...arr], pointers: { left, right }, successIndices: [left, right], type: 'success', msg: `Target found at indices ${left} and ${right}!` };
            return;
        } else if (sum < target) {
            left++;
            yield { array: [...arr], pointers: { left, right }, activeIndices: [left], type: 'compare', msg: `Sum (${sum}) < Target (${target}). Increment Left.` };
        } else {
            right--;
            yield { array: [...arr], pointers: { left, right }, activeIndices: [right], type: 'compare', msg: `Sum (${sum}) > Target (${target}). Decrement Right.` };
        }
    }

    yield { array: [...arr], pointers: {}, type: 'fail', msg: "No two sum solution found." };
}