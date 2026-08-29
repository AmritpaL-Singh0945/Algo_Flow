function GraphVisualizer(containerId) {
    this.container = document.getElementById(containerId);
    this.nodes = [];
    this.edges = [];
    this.positions = {};
}

GraphVisualizer.prototype.parseGraph = function(edgeString) {
    this.nodes = [];
    this.edges = [];
    
    const parts = edgeString.split(',').slice(0, 10);
    for (const part of parts) {
        const clean = part.trim();
        if (!clean) continue;
        
        const [edgePart, weightPart] = clean.split(':');
        const weight = weightPart ? parseInt(weightPart, 10) : 1;
        const [u, v] = edgePart.split('-');
        
        if (u && v) {
            const nodeU = u.trim();
            const nodeV = v.trim();
            
            if (!this.nodes.includes(nodeU)) this.nodes.push(nodeU);
            if (!this.nodes.includes(nodeV)) this.nodes.push(nodeV);
            
            this.edges.push({ u: nodeU, v: nodeV, w: weight });
        }
    }
    
    this.nodes.sort();
};

GraphVisualizer.prototype.calculateLayout = function() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) / 2 - 60;
    
    this.positions = {};
    const n = this.nodes.length;
    
    for (let i = 0; i < n; i++) {
        const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
        this.positions[this.nodes[i]] = {
            x: cx + radius * Math.cos(angle),
            y: cy + radius * Math.sin(angle)
        };
    }
};

GraphVisualizer.prototype.render = function(visiting, visited, distances, isComplete = false, activeEdges = []) {
    if (this.nodes.length === 0) return;
    
    if (Object.keys(this.positions).length !== this.nodes.length) {
        this.calculateLayout();
    }
    
    this.container.innerHTML = '';
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'graph-svg');
    
    for (const edge of this.edges) {
        const p1 = this.positions[edge.u];
        const p2 = this.positions[edge.v];
        
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', p1.x);
        line.setAttribute('y1', p1.y);
        line.setAttribute('x2', p2.x);
        line.setAttribute('y2', p2.y);
        line.setAttribute('class', 'graph-line');
        
        const isActive = activeEdges.some(e => 
            (e.u === edge.u && e.v === edge.v) || (e.u === edge.v && e.v === edge.u)
        );
        
        if (isActive) {
            line.classList.add('graph-line-active');
        }
        
        svg.appendChild(line);
        
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        
        const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bgRect.setAttribute('x', midX - 12);
        bgRect.setAttribute('y', midY - 12);
        bgRect.setAttribute('width', 24);
        bgRect.setAttribute('height', 24);
        bgRect.setAttribute('fill', 'var(--bg)');
        bgRect.setAttribute('rx', 4);
        
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', midX);
        text.setAttribute('y', midY);
        text.setAttribute('class', 'edge-weight');
        text.textContent = edge.w;
        
        svg.appendChild(bgRect);
        svg.appendChild(text);
    }
    
    this.container.appendChild(svg);
    
    const nodesFragment = document.createDocumentFragment();
    
    for (const node of this.nodes) {
        const pos = this.positions[node];
        const div = document.createElement('div');
        div.className = 'graph-node';
        div.style.left = `${pos.x}px`;
        div.style.top = `${pos.y}px`;
        
        const label = document.createElement('span');
        label.textContent = node;
        div.appendChild(label);
        
        if (distances && distances[node] !== undefined) {
            const dist = document.createElement('span');
            dist.className = 'node-distance';
            dist.textContent = distances[node] === Infinity ? '∞' : distances[node];
            div.appendChild(dist);
        }
        
        if (isComplete) {
            div.classList.add('node-completed');
        } else if (node === visiting) {
            div.classList.add('node-visiting');
        } else if (visited && visited.includes(node)) {
            div.classList.add('node-visited');
        }
        
        nodesFragment.appendChild(div);
    }
    
    this.container.appendChild(nodesFragment);
};