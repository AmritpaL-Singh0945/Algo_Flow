# AlgoFlow 🌊

**🚀 Live Demo:** [https://algo-flow-dsa.vercel.app](https://algo-flow-dsa.vercel.app)

**AlgoFlow** is a sleek, modern, 60FPS data structure and algorithm visualizer. Built completely with Vanilla JavaScript, it demystifies complex algorithms by demonstrating step-by-step logic in motion—without the overhead of heavy frontend frameworks.

## Features ✨

- **No Dependencies:** 100% Vanilla JS, HTML, and CSS.
- **Web Workers:** Heavy array generation and processing is offloaded to web workers to keep the UI buttery smooth.
- **Step-by-step Execution:** Pause, step forward, step backward, or auto-play through algorithms.
- **Custom Inputs:** Provide your own datasets to see how the algorithms adapt.
- **Dark & Light Mode:** Fully responsive, modern, pill-based UI with dynamic theme switching.

## Supported Visualizations 📊

1. **Sorting Algorithms** (Bubble, Quick, Merge, etc.)
2. **Linked Lists** (Singly, Doubly, Reverse, Cycle Detection)
3. **Trees** (BST Insertion, Traversals)
4. **Graphs** (BFS, DFS, Dijkstra's)
5. **Dynamic Programming** (Knapsack, Fibonacci, LCS)
6. **Two Pointers** (Container with Most Water, Target Sum)
7. **Search Algorithms** (Linear, Binary)

## Architecture & Design 🏗️

The project avoids React/Vue to dive deep into core web technologies:
- **UI:** A modern, clean Bento-grid layout. 
- **State Management:** Generator functions yield the execution state line-by-line. 
- **Security:** Mock JWT and localStorage-based authentication system to simulate secure dashboard access.

## Running Locally 🚀

Simply clone the repository and open `index.html` in your browser. No build steps required.

```bash
git clone https://github.com/AmritpaL-Singh0945/Algo_Flow.git
cd Algo_Flow
open index.html
```
