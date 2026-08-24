self.onmessage = function(e) {
    const data = e.data;
    const { nodes, edges, startNode, algo } = data;
    
    const adj = {};
    for (const node of nodes) {
        adj[node] = [];
    }
    
    for (const edge of edges) {
        adj[edge.u].push({ to: edge.v, w: edge.w });
        adj[edge.v].push({ to: edge.u, w: edge.w });
    }
    
    let generator;
    if (algo === 'bfs') {
        generator = bfs(adj, startNode);
    } else if (algo === 'dfs') {
        generator = dfs(adj, startNode);
    } else if (algo === 'dijkstra') {
        generator = dijkstra(adj, nodes, startNode);
    }

    const steps = [];
    let result = generator.next();
    
    while (!result.done) {
        steps.push(result.value);
        result = generator.next();
    }
    
    self.postMessage(steps);
};

function* bfs(adj, start) {
    if (!adj[start]) return;
    
    const queue = [start];
    const visited = [start];
    const activeEdges = [];
    
    yield { visiting: start, visited: [...visited], activeEdges: [], msg: `Queue initialized with ${start}` };
    
    while (queue.length > 0) {
        const curr = queue.shift();
        yield { visiting: curr, visited: [...visited], activeEdges: [...activeEdges], msg: `Dequeued and visiting ${curr}` };
        
        for (const neighbor of adj[curr]) {
            if (!visited.includes(neighbor.to)) {
                visited.push(neighbor.to);
                queue.push(neighbor.to);
                activeEdges.push({ u: curr, v: neighbor.to });
                yield { visiting: neighbor.to, visited: [...visited], activeEdges: [...activeEdges], msg: `Found unvisited neighbor ${neighbor.to} from ${curr}` };
            }
        }
    }
    yield { visiting: null, visited, activeEdges, msg: "BFS Traversal Complete" };
}

function* dfs(adj, start) {
    if (!adj[start]) return;
    
    const visited = [];
    const activeEdges = [];
    
    yield* dfsHelper(adj, start, visited, activeEdges);
    yield { visiting: null, visited, activeEdges, msg: "DFS Traversal Complete" };
}

function* dfsHelper(adj, curr, visited, activeEdges) {
    visited.push(curr);
    yield { visiting: curr, visited: [...visited], activeEdges: [...activeEdges], msg: `Visiting ${curr}` };
    
    for (const neighbor of adj[curr]) {
        if (!visited.includes(neighbor.to)) {
            activeEdges.push({ u: curr, v: neighbor.to });
            yield* dfsHelper(adj, neighbor.to, visited, activeEdges);
        }
    }
}

function* dijkstra(adj, nodes, start) {
    if (!adj[start]) return;
    
    const distances = {};
    const visited = [];
    const activeEdges = [];
    
    for (const node of nodes) {
        distances[node] = Infinity;
    }
    distances[start] = 0;
    
    yield { visiting: start, visited: [...visited], activeEdges: [], distances: {...distances}, msg: `Initialized distances. Start at ${start}` };
    
    while (visited.length < nodes.length) {
        let curr = null;
        let minDist = Infinity;
        
        for (const node of nodes) {
            if (!visited.includes(node) && distances[node] < minDist) {
                minDist = distances[node];
                curr = node;
            }
        }
        
        if (curr === null) break;
        
        visited.push(curr);
        yield { visiting: curr, visited: [...visited], activeEdges: [...activeEdges], distances: {...distances}, msg: `Locked shortest path to ${curr} (Dist: ${distances[curr]})` };
        
        for (const neighbor of adj[curr]) {
            if (!visited.includes(neighbor.to)) {
                activeEdges.push({ u: curr, v: neighbor.to });
                const newDist = distances[curr] + neighbor.w;
                
                yield { visiting: neighbor.to, visited: [...visited], activeEdges: [...activeEdges], distances: {...distances}, msg: `Checking edge ${curr}-${neighbor.to}. Weight: ${neighbor.w}` };
                
                if (newDist < distances[neighbor.to]) {
                    distances[neighbor.to] = newDist;
                    yield { visiting: neighbor.to, visited: [...visited], activeEdges: [...activeEdges], distances: {...distances}, msg: `Updated distance to ${neighbor.to} = ${newDist}` };
                } else {
                    yield { visiting: neighbor.to, visited: [...visited], activeEdges: [...activeEdges], distances: {...distances}, msg: `Existing distance to ${neighbor.to} is shorter. No update.` };
                }
                activeEdges.pop();
            }
        }
    }
    
    yield { visiting: null, visited, activeEdges: [], distances, msg: "Dijkstra's Algorithm Complete" };
}