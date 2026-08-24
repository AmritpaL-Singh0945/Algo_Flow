self.onmessage = function(e) {
    const data = e.data;
    const array = [...data.array];
    const algoType = data.algo;
    
    let generator;
    if (algoType === 'bubble') {
        generator = bubbleSort(array);
    } else if (algoType === 'selection') {
        generator = selectionSort(array);
    } else if (algoType === 'insertion') {
        generator = insertionSort(array);
    } else if (algoType === 'merge') {
        generator = mergeSort(array);
    }

    const steps = [];
    let result = generator.next();
    
    while (!result.done) {
        steps.push(result.value);
        result = generator.next();
    }
    
    self.postMessage(steps);
};

function* bubbleSort(arr) {
    let n = arr.length;
    let swapped;
    do {
        swapped = false;
        for (let i = 0; i < n - 1; i++) {
            yield { array: [...arr], indices: [i, i + 1], type: 'compare' };
            if (arr[i] > arr[i + 1]) {
                let temp = arr[i];
                arr[i] = arr[i + 1];
                arr[i + 1] = temp;
                swapped = true;
                yield { array: [...arr], indices: [i, i + 1], type: 'swap' };
            }
        }
        n--;
    } while (swapped);
    yield { array: [...arr], indices: [], type: 'sorted' };
}

function* selectionSort(arr) {
    let n = arr.length;
    for (let i = 0; i < n - 1; i++) {
        let minIdx = i;
        for (let j = i + 1; j < n; j++) {
            yield { array: [...arr], indices: [minIdx, j], type: 'compare' };
            if (arr[j] < arr[minIdx]) {
                minIdx = j;
            }
        }
        if (minIdx !== i) {
            let temp = arr[i];
            arr[i] = arr[minIdx];
            arr[minIdx] = temp;
            yield { array: [...arr], indices: [i, minIdx], type: 'swap' };
        }
    }
    yield { array: [...arr], indices: [], type: 'sorted' };
}

function* insertionSort(arr) {
    let n = arr.length;
    for (let i = 1; i < n; i++) {
        let key = arr[i];
        let j = i - 1;
        yield { array: [...arr], indices: [i], type: 'compare' };
        while (j >= 0 && arr[j] > key) {
            yield { array: [...arr], indices: [j, j + 1], type: 'compare' };
            arr[j + 1] = arr[j];
            yield { array: [...arr], indices: [j, j + 1], type: 'swap' };
            j = j - 1;
        }
        arr[j + 1] = key;
    }
    yield { array: [...arr], indices: [], type: 'sorted' };
}

function* mergeSort(arr) {
    yield* mergeSortHelper(arr, 0, arr.length - 1);
    yield { array: [...arr], indices: [], type: 'sorted' };
}

function* mergeSortHelper(arr, left, right) {
    if (left >= right) return;
    let mid = Math.floor((left + right) / 2);
    yield* mergeSortHelper(arr, left, mid);
    yield* mergeSortHelper(arr, mid + 1, right);
    yield* merge(arr, left, mid, right);
}

function* merge(arr, start, mid, end) {
    let start2 = mid + 1;

    if (arr[mid] <= arr[start2]) {
        return;
    }

    while (start <= mid && start2 <= end) {
        yield { array: [...arr], indices: [start, start2], type: 'compare' };

        if (arr[start] <= arr[start2]) {
            start++;
        } else {
            let value = arr[start2];
            let index = start2;

            while (index !== start) {
                arr[index] = arr[index - 1];
                index--;
            }
            arr[start] = value;

            yield { array: [...arr], indices: [start], type: 'swap' };

            start++;
            mid++;
            start2++;
        }
    }
}