function LinkedListVisualizer(containerId) {
    this.container = document.getElementById(containerId);
}

LinkedListVisualizer.prototype.render = function(step) {
    this.container.innerHTML = '';
    if (!step || !step.array || step.array.length === 0) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'll-nodes-wrapper';

    const nodeElements = [];
    
    for (let i = 0; i < step.array.length; i++) {
        const box = document.createElement('div');
        box.className = 'll-node-box';
        
        const node = document.createElement('div');
        node.className = 'll-node';
        node.textContent = step.array[i];
        
        if (step.activeNodes && step.activeNodes.includes(i)) {
            node.classList.add('node-active');
        }
        if (step.targetNodes && step.targetNodes.includes(i)) {
            node.classList.add('node-target');
        }
        if (step.cycleNodes && step.cycleNodes.includes(i)) {
            node.classList.add('node-cycle');
        }

        let topOffset = -35;
        let bottomOffset = -35;

        for (const ptr in step.pointers) {
            if (step.pointers[ptr] === i) {
                const ptrEl = document.createElement('div');
                ptrEl.className = 'll-pointer';
                ptrEl.textContent = ptr;
                
                if (ptr === 'head' || ptr === 'fast') {
                    ptrEl.classList.add('ptr-top');
                    ptrEl.style.marginTop = `${topOffset === -35 ? 0 : -25}px`;
                    topOffset -= 25;
                } else {
                    ptrEl.classList.add('ptr-bottom');
                    ptrEl.style.marginBottom = `${bottomOffset === -35 ? 0 : -25}px`;
                    bottomOffset -= 25;
                }
                
                box.appendChild(ptrEl);
            }
        }

        box.appendChild(node);
        wrapper.appendChild(box);
        nodeElements.push(node);
    }

    this.container.appendChild(wrapper);

    requestAnimationFrame(() => {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'll-svg-layer');
        
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        marker.setAttribute('id', 'arrowhead');
        marker.setAttribute('markerWidth', '10');
        marker.setAttribute('markerHeight', '7');
        marker.setAttribute('refX', '9');
        marker.setAttribute('refY', '3.5');
        marker.setAttribute('orient', 'auto');
        
        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        polygon.setAttribute('points', '0 0, 10 3.5, 0 7');
        polygon.setAttribute('fill', 'var(--border-color)');
        
        marker.appendChild(polygon);
        defs.appendChild(marker);
        svg.appendChild(defs);

        const containerRect = this.container.getBoundingClientRect();

        for (let i = 0; i < step.links.length; i++) {
            const targetIdx = step.links[i];
            if (targetIdx === null || targetIdx === undefined || targetIdx >= step.array.length) continue;

            const rect1 = nodeElements[i].getBoundingClientRect();
            const rect2 = nodeElements[targetIdx].getBoundingClientRect();

            const x1 = rect1.left - containerRect.left + rect1.width / 2;
            const y1 = rect1.top - containerRect.top + rect1.height / 2;
            const x2 = rect2.left - containerRect.left + rect2.width / 2;
            const y2 = rect2.top - containerRect.top + rect2.height / 2;

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('class', 'll-arrow');
            path.setAttribute('marker-end', 'url(#arrowhead)');

            if (targetIdx === i + 1) {
                path.setAttribute('d', `M ${x1 + 35} ${y1} L ${x2 - 35} ${y2}`);
            } else if (targetIdx === i - 1) {
                path.setAttribute('d', `M ${x1 - 35} ${y1} L ${x2 + 35} ${y2}`);
            } else if (targetIdx < i) {
                path.setAttribute('d', `M ${x1} ${y1 + 35} Q ${(x1 + x2) / 2} ${y1 + 100} ${x2} ${y2 + 35}`);
            } else {
                path.setAttribute('d', `M ${x1} ${y1 - 35} Q ${(x1 + x2) / 2} ${y1 - 100} ${x2} ${y2 - 35}`);
            }

            if (step.activeLinks && step.activeLinks.some(l => l[0] === i && l[1] === targetIdx)) {
                path.classList.add('ll-arrow-active');
                polygon.setAttribute('fill', 'var(--subtle-blue)');
            }

            svg.appendChild(path);
        }

        this.container.appendChild(svg);
    });
};