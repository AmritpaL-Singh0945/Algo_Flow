function DpVisualizer(containerId) {
    this.container = document.getElementById(containerId);
}

DpVisualizer.prototype.render = function(step, weights, values, capacity) {
    if (!step) return;
    
    if (step.mode === 'tree') {
        this.renderTree(step.treeNodes, step.active);
    } else {
        this.renderTable(step.matrix, weights, values, capacity, step.active, step.compare, step.path);
    }
};

DpVisualizer.prototype.renderTable = function(matrix, weights, values, capacity, activeCell, compareCells, pathCells) {
    this.container.innerHTML = '';
    if (!matrix || matrix.length === 0) return;

    const rows = matrix.length;
    const cols = matrix[0].length;

    const table = document.createElement('div');
    table.className = 'dp-table';
    table.style.gridTemplateColumns = `repeat(${cols + 1}, auto)`;

    const emptyCorner = document.createElement('div');
    emptyCorner.className = 'dp-cell dp-header';
    emptyCorner.textContent = 'W/V';
    table.appendChild(emptyCorner);

    for (let c = 0; c <= capacity; c++) {
        const header = document.createElement('div');
        header.className = 'dp-cell dp-header';
        header.textContent = c;
        table.appendChild(header);
    }

    for (let r = 0; r < rows; r++) {
        const rowLabel = document.createElement('div');
        rowLabel.className = 'dp-cell dp-header';
        if (r === 0) {
            rowLabel.textContent = '0/0';
        } else {
            rowLabel.textContent = `${weights[r-1]}/${values[r-1]}`;
        }
        table.appendChild(rowLabel);

        for (let c = 0; c < cols; c++) {
            const cell = document.createElement('div');
            cell.className = 'dp-cell';
            cell.textContent = matrix[r][c] !== null ? matrix[r][c] : '';
            
            if (activeCell && activeCell[0] === r && activeCell[1] === c) {
                cell.classList.add('cell-active');
            }
            
            if (compareCells && compareCells.some(p => p[0] === r && p[1] === c)) {
                cell.classList.add('cell-compare');
            }

            if (pathCells && pathCells.some(p => p[0] === r && p[1] === c)) {
                cell.classList.add('cell-path');
            }

            table.appendChild(cell);
        }
    }

    this.container.appendChild(table);
};

DpVisualizer.prototype.renderTree = function(treeNodes, activePos) {
    this.container.innerHTML = '';
    
    if (!treeNodes || Object.keys(treeNodes).length === 0) return;

    const positions = Object.keys(treeNodes).map(Number);
    const maxPos = Math.max(...positions);
    const levels = Math.floor(Math.log2(maxPos + 1)) + 1;
    
    const width = this.container.clientWidth;
    const height = Math.max(this.container.clientHeight, levels * 100); 
    const verticalSpacing = height / (levels + 1);

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'dp-tree-svg');
    
    const nodesFragment = document.createDocumentFragment();
    const coordsMap = {};

    for (const posStr of Object.keys(treeNodes)) {
        const pos = parseInt(posStr, 10);
        const nodeData = treeNodes[pos];
        
        const level = Math.floor(Math.log2(pos + 1));
        const nodesInLevel = Math.pow(2, level);
        const positionInLevel = pos - (nodesInLevel - 1);
        const horizontalSpacing = width / (nodesInLevel + 1);
        
        const cx = horizontalSpacing * (positionInLevel + 1);
        const cy = verticalSpacing * (level + 1);
        
        coordsMap[pos] = { x: cx, y: cy };

        const nodeEl = document.createElement('div');
        nodeEl.className = 'dp-tree-node';
        nodeEl.style.left = `${cx}px`;
        nodeEl.style.top = `${cy}px`;
        
        const label = document.createElement('span');
        label.textContent = nodeData.label;
        nodeEl.appendChild(label);
        
        if (nodeData.result !== undefined) {
            const res = document.createElement('span');
            res.className = 'dp-tree-res';
            res.textContent = `= ${nodeData.result}`;
            nodeEl.appendChild(res);
        }

        if (pos === activePos) {
            nodeEl.classList.add('node-visiting');
        } else if (nodeData.status === 'memo') {
            nodeEl.classList.add('node-memo');
        } else if (nodeData.status === 'done') {
            nodeEl.classList.add('node-done');
        }

        nodesFragment.appendChild(nodeEl);
    }

    for (const posStr of Object.keys(coordsMap)) {
        const pos = parseInt(posStr, 10);
        const parentPos = Math.floor((pos - 1) / 2);
        
        if (pos > 0 && coordsMap[parentPos]) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', coordsMap[parentPos].x);
            line.setAttribute('y1', coordsMap[parentPos].y);
            line.setAttribute('x2', coordsMap[pos].x);
            line.setAttribute('y2', coordsMap[pos].y);
            line.setAttribute('class', 'dp-tree-line');
            svg.appendChild(line);
        }
    }

    this.container.appendChild(svg);
    this.container.appendChild(nodesFragment);
};