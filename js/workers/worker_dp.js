self.onmessage = function(e) {
    const data = e.data;
    const weights = data.weights;
    const values = data.values;
    const capacity = data.capacity;
    const algoType = data.algo;
    
    let generator;
    if (algoType === 'knapsack01') {
        generator = knapsack01(weights, values, capacity);
    } else if (algoType === 'knapsack01_memo') {
        generator = knapsack01Memo(weights, values, capacity);
    } else if (algoType === 'unbounded') {
        generator = unboundedKnapsack(weights, values, capacity);
    }

    const steps = [];
    let result = generator.next();
    
    while (!result.done) {
        steps.push(result.value);
        result = generator.next();
    }
    
    self.postMessage(steps);
};

function copyMatrix(m) {
    return m.map(row => [...row]);
}

function* knapsack01(wt, val, W) {
    const n = wt.length;
    const dp = Array(n + 1).fill().map(() => Array(W + 1).fill(0));
    
    yield { mode: 'table', matrix: copyMatrix(dp), active: null, compare: [], path: [], msg: "Initialized Grid with 0s" };

    for (let i = 1; i <= n; i++) {
        for (let w = 1; w <= W; w++) {
            const compare = [[i - 1, w]];
            
            if (wt[i - 1] <= w) {
                compare.push([i - 1, w - wt[i - 1]]);
                const includeVal = val[i - 1] + dp[i - 1][w - wt[i - 1]];
                const excludeVal = dp[i - 1][w];
                
                dp[i][w] = Math.max(includeVal, excludeVal);
                yield { 
                    mode: 'table', matrix: copyMatrix(dp), active: [i, w], compare, path: [],
                    msg: `Weight <= Cap. Max of (Exclude: ${excludeVal}, Include: ${includeVal}) = ${dp[i][w]}` 
                };
            } else {
                dp[i][w] = dp[i - 1][w];
                yield { 
                    mode: 'table', matrix: copyMatrix(dp), active: [i, w], compare, path: [],
                    msg: `Item weight > Capacity. Copying value from above: ${dp[i][w]}` 
                };
            }
        }
    }

    let res = dp[n][W];
    let w = W;
    const path = [[n, W]];
    
    for (let i = n; i > 0 && res > 0; i--) {
        if (res === dp[i - 1][w]) {
            path.push([i - 1, w]);
        } else {
            path.push([i - 1, w - wt[i - 1]]);
            res = res - val[i - 1];
            w = w - wt[i - 1];
        }
    }

    yield { mode: 'table', matrix: copyMatrix(dp), active: null, compare: [], path, msg: "Tracing back to find included items." };
}

function* unboundedKnapsack(wt, val, W) {
    const n = wt.length;
    const dp = Array(n + 1).fill().map(() => Array(W + 1).fill(0));
    
    yield { mode: 'table', matrix: copyMatrix(dp), active: null, compare: [], path: [], msg: "Initialized Grid with 0s" };

    for (let i = 1; i <= n; i++) {
        for (let w = 1; w <= W; w++) {
            const compare = [[i - 1, w]];
            
            if (wt[i - 1] <= w) {
                compare.push([i, w - wt[i - 1]]);
                const includeVal = val[i - 1] + dp[i][w - wt[i - 1]];
                const excludeVal = dp[i - 1][w];
                
                dp[i][w] = Math.max(includeVal, excludeVal);
                yield { 
                    mode: 'table', matrix: copyMatrix(dp), active: [i, w], compare, path: [],
                    msg: `Can re-use. Max(Exclude: ${excludeVal}, Include: ${includeVal}) = ${dp[i][w]}` 
                };
            } else {
                dp[i][w] = dp[i - 1][w];
                yield { 
                    mode: 'table', matrix: copyMatrix(dp), active: [i, w], compare, path: [],
                    msg: `Item weight > Capacity. Exclude.` 
                };
            }
        }
    }

    let res = dp[n][W];
    let w = W;
    let i = n;
    const path = [[i, w]];
    
    while (i > 0 && res > 0) {
        if (res === dp[i - 1][w]) {
            i--;
            path.push([i, w]);
        } else {
            path.push([i, w - wt[i - 1]]);
            res = res - val[i - 1];
            w = w - wt[i - 1];
        }
    }

    yield { mode: 'table', matrix: copyMatrix(dp), active: null, compare: [], path, msg: "Tracing back to find included items." };
}

function* knapsack01Memo(wt, val, W) {
    const n = wt.length;
    const memo = {};
    const treeNodes = {};
    
    function* solve(i, w, pos) {
        treeNodes[pos] = { label: `f(${i},${w})`, status: 'visiting' };
        yield { mode: 'tree', treeNodes: JSON.parse(JSON.stringify(treeNodes)), active: pos, msg: `Calling f(${i}, ${w})` };

        const key = `${i},${w}`;
        if (memo[key] !== undefined) {
            treeNodes[pos].status = 'memo';
            treeNodes[pos].result = memo[key];
            yield { mode: 'tree', treeNodes: JSON.parse(JSON.stringify(treeNodes)), active: pos, msg: `Memo hit! f(${i}, ${w}) = ${memo[key]}` };
            return memo[key];
        }
        
        if (i === 0 || w === 0) {
            treeNodes[pos].status = 'done';
            treeNodes[pos].result = 0;
            yield { mode: 'tree', treeNodes: JSON.parse(JSON.stringify(treeNodes)), active: pos, msg: `Base case reached. Ret = 0` };
            return 0;
        }

        let exclude = yield* solve(i - 1, w, 2 * pos + 1);
        let include = 0;
        
        if (wt[i - 1] <= w) {
            include = val[i - 1] + (yield* solve(i - 1, w - wt[i - 1], 2 * pos + 2));
        }

        memo[key] = Math.max(exclude, include);
        treeNodes[pos].status = 'done';
        treeNodes[pos].result = memo[key];
        
        yield { mode: 'tree', treeNodes: JSON.parse(JSON.stringify(treeNodes)), active: pos, msg: `Computed f(${i}, ${w}) = ${memo[key]}` };
        return memo[key];
    }
    
    yield* solve(n, W, 0);
    yield { mode: 'tree', treeNodes: JSON.parse(JSON.stringify(treeNodes)), active: null, msg: "Recursion Complete!" };
}