function TreeVisualizer(containerId) {
    this.container = document.getElementById(containerId);
    this.array = [];
}

TreeVisualizer.prototype.render = function(array, visitingIndex, visitedIndices, isComplete = false) {
    this.array = array;
    this.container.innerHTML = '';
    
    if (!array || array.length === 0) return;

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    const levels = Math.floor(Math.log2(array.length)) + 1;
    const verticalSpacing = height / (levels + 1);

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'tree-svg');
    
    const nodesFragment = document.createDocumentFragment();
    const coordinates = [];

    for (let i = 0; i < array.length; i++) {
        if (array[i] === null || array[i] === undefined || array[i] === '') {
            coordinates.push(null);
            continue;
        }

        const level = Math.floor(Math.log2(i + 1));
        const nodesInLevel = Math.pow(2, level);
        const positionInLevel = i - (nodesInLevel - 1);
        const horizontalSpacing = width / (nodesInLevel + 1);
        
        const cx = horizontalSpacing * (positionInLevel + 1);
        const cy = verticalSpacing * (level + 1);
        
        coordinates.push({ x: cx, y: cy });

        const node = document.createElement('div');
        node.className = 'tree-node';
        node.textContent = array[i];
        node.style.left = `${cx}px`;
        node.style.top = `${cy}px`;

        if (isComplete) {
            node.classList.add('node-completed');
        } else if (i === visitingIndex) {
            node.classList.add('node-visiting');
        } else if (visitedIndices && visitedIndices.includes(i)) {
            node.classList.add('node-visited');
        }

        nodesFragment.appendChild(node);
    }

    for (let i = 0; i < array.length; i++) {
        if (!coordinates[i]) continue;
        
        const leftChildIdx = 2 * i + 1;
        const rightChildIdx = 2 * i + 2;

        if (leftChildIdx < array.length && coordinates[leftChildIdx]) {
            svg.appendChild(this.createLine(coordinates[i], coordinates[leftChildIdx]));
        }
        if (rightChildIdx < array.length && coordinates[rightChildIdx]) {
            svg.appendChild(this.createLine(coordinates[i], coordinates[rightChildIdx]));
        }
    }

    this.container.appendChild(svg);
    this.container.appendChild(nodesFragment);
};

TreeVisualizer.prototype.createLine = function(p1, p2) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', p1.x);
    line.setAttribute('y1', p1.y);
    line.setAttribute('x2', p2.x);
    line.setAttribute('y2', p2.y);
    line.setAttribute('class', 'tree-line');
    return line;
};