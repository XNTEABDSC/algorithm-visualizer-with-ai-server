# Writing JavaScript Code with Algorithm-Visualizer

Algorithm-Visualizer is an interactive online platform designed to visualize algorithms by embedding visualization commands within code. It supports JavaScript, C++, and Java, and is particularly useful for educational purposes, allowing developers and students to see algorithms in action. This document focuses on writing JavaScript code for Algorithm-Visualizer, detailing the use of tracers, their methods, layouts, and the coding style required to create effective visualizations.

## Introduction to Algorithm-Visualizer

Algorithm-Visualizer enables users to witness algorithms in action by visualizing code written in JavaScript (via the `tracers.js` library), C++, or Java. The platform is accessible at [algorithm-visualizer.org](https://algorithm-visualizer.org/), where visualizations are displayed, and code can be tested in a "Scratch Paper" section. The core components for visualization are **tracers**, which handle different data structures, and **layouts**, which arrange multiple tracers on the screen. This guide emphasizes JavaScript, as requested, and covers how to use tracers and layouts to create clear, step-by-step algorithm visualizations.

## Tracers: Overview and Purpose

Tracers are JavaScript objects provided by the `tracers.js` library to visualize specific data structures or outputs. Each tracer is tailored to a particular type of data or visualization need:

- **Array1DTracer**: Visualizes one-dimensional arrays, ideal for algorithms like sorting or searching.
- **Array2DTracer**: Visualizes two-dimensional arrays, suitable for matrix-based algorithms.
- **ChartTracer**: Displays data as charts, useful for visualizing trends or comparisons.
- **GraphTracer**: Visualizes graph structures, perfect for graph algorithms like DFS or Dijkstra’s.
- **LogTracer**: Displays textual logs, useful for debugging or explaining algorithm steps.

Tracers are initialized with a title and data, then manipulated using methods to highlight operations, update values, or log messages. The `delay()` method is critical, as it pauses execution to make each step visible in the visualization.

## Methods of Tracers

Below is a comprehensive list of methods for each tracer, based on the [Algorithm-Visualizer Wiki](https://github.com/algorithm-visualizer/algorithm-visualizer/wiki).

### Array1DTracer

| Method | Description | Syntax |
|--------|-------------|--------|
| Constructor | Creates a new Array1DTracer with an optional title | `new Array1DTracer(String title = "Array1DTracer")` |
| set | Sets the array to visualize | `Array1DTracer set(Object[] array1d = [])` |
| reset | Resets the tracer data | `Array1DTracer reset()` |
| delay | Pauses to show changes in all tracers | `Array1DTracer delay()` |
| patch | Notifies that the value at index `x` has changed to `v` | `Array1DTracer patch(int x, Object v)` |
| depatch | Stops notifying changes at index `x` | `Array1DTracer depatch(int x)` |
| select | Selects the element at index `x` | `Array1DTracer select(int x)` |
| select (range) | Selects elements from index `sx` to `ex` | `Array1DTracer select(int sx, int ex)` |
| deselect | Deselects the element at index `x` | `Array1DTracer deselect(int x)` |
| deselect (range) | Deselects elements from index `sx` to `ex` | `Array1DTracer deselect(int sx, int ex)` |
| chart | Synchronizes data with a ChartTracer | `Array1DTracer chart(ChartTracer chartTracer)` |

### Array2DTracer

| Method | Description | Syntax |
|--------|-------------|--------|
| Constructor | Creates a new Array2DTracer with an optional title | `new Array2DTracer(String title = "Array2DTracer")` |
| set | Sets the 2D array to visualize | `Array2DTracer set(Object[][] array2d = [])` |
| reset | Resets the tracer data | `Array2DTracer reset()` |
| delay | Pauses to show changes in all tracers | `Array2DTracer delay()` |
| patch | Notifies that the value at (`x`, `y`) has changed to `v` | `Array2DTracer patch(int x, int y, Object v)` |
| depatch | Stops notifying changes at (`x`, `y`) | `Array2DTracer depatch(int x, int y)` |
| select | Selects the element at (`x`, `y`) | `Array2DTracer select(int x, int y)` |
| select (range) | Selects elements from (`sx`, `sy`) to (`ex`, `ey`) | `Array2DTracer select(int sx, int sy, int ex, int ey)` |
| selectRow | Selects from (`x`, `sy`) to (`x`, `ey`) | `Array2DTracer selectRow(int x, int sy, int ey)` |
| selectCol | Selects from (`sx`, `y`) to (`ex`, `y`) | `Array2DTracer selectCol(int y, int sx, int ex)` |
| deselect | Deselects the element at (`x`, `y`) | `Array2DTracer deselect(int x, int y)` |
| deselect (range) | Deselects elements from (`sx`, `sy`) to (`ex`, `ey`) | `Array2DTracer deselect(int sx, int sy, int ex, int ey)` |
| deselectRow | Deselects from (`x`, `sy`) to (`x`, `ey`) | `Array2DTracer deselectRow(int x, int sy, int ey)` |
| deselectCol | Deselects from (`sx`, `y`) to (`ex`, `y`) | `Array2DTracer deselectCol(int y, int sx, int ex)` |

### ChartTracer

| Method | Description | Syntax |
|--------|-------------|--------|
| Constructor | Creates a new ChartTracer with an optional title | `new ChartTracer(String title = "ChartTracer")` |
| set | Sets the array to visualize | `ChartTracer set(Object[] array1d = [])` |
| reset | Resets the tracer data | `ChartTracer reset()` |
| delay | Pauses to show changes in all tracers | `ChartTracer delay()` |
| patch | Notifies that the value at index `x` has changed to `v` | `ChartTracer patch(int x, Object v)` |
| depatch | Stops notifying changes at index `x` | `ChartTracer depatch(int x)` |
| select | Selects the element at index `x` | `ChartTracer select(int x)` |
| select (range) | Selects elements from index `sx` to `ex` | `ChartTracer select(int sx, int ex)` |
| deselect | Deselects the element at index `x` | `ChartTracer deselect(int x)` |
| deselect (range) | Deselects elements from index `sx` to `ex` | `ChartTracer deselect(int sx, int ex)` |
| chart | Synchronizes data with another ChartTracer | `ChartTracer chart(ChartTracer chartTracer)` |

### GraphTracer

| Method | Description | Syntax |
|--------|-------------|--------|
| Constructor | Creates a new GraphTracer with an optional title | `new GraphTracer(String title = "GraphTracer")` |
| set | Sets the adjacency matrix to visualize | `GraphTracer set(Object[][] array2d = [])` |
| reset | Resets the tracer data | `GraphTracer reset()` |
| delay | Pauses to show changes in all tracers | `GraphTracer delay()` |
| directed | Makes the graph directed | `GraphTracer directed(boolean isDirected)` |
| weighted | Makes the graph weighted | `GraphTracer weighted(boolean isWeighted)` |
| addNode | Adds a node | `GraphTracer addNode(String id, Object data)` |
| updateNode | Updates a node | `GraphTracer updateNode(String id, Object data)` |
| removeNode | Removes a node | `GraphTracer removeNode(String id)` |
| addEdge | Adds an edge from `source` to `target` | `GraphTracer addEdge(String source, String target, Object weight)` |
| updateEdge | Updates an edge from `source` to `target` | `GraphTracer updateEdge(String source, String target, Object weight)` |
| removeEdge | Removes an edge from `source` to `target` | `GraphTracer removeEdge(String source, String target)` |
| layoutCircle | Arranges nodes in a circular layout | `GraphTracer layoutCircle()` |
| layoutTree | Arranges nodes in a tree layout with `root` | `GraphTracer layoutTree(String root)` |
| layoutRandom | Arranges nodes randomly | `GraphTracer layoutRandom()` |
| visit | Visits `target` from `source` | `GraphTracer visit(String target, String source)` |
| leave | Returns from `target` to `source` | `GraphTracer leave(String target, String source)` |
| select | Selects `target` from `source` | `GraphTracer select(String target, String source)` |
| deselect | Deselects `target` from `source` | `GraphTracer deselect(String target, String source)` |
| log | Logs graph traversals | `GraphTracer log(String message)` |

### LogTracer

| Method | Description | Syntax |
|--------|-------------|--------|
| Constructor | Creates a new LogTracer with an optional title | `new LogTracer(String title = "LogTracer")` |
| set | Sets messages to print | `LogTracer set(Object[] messages = [])` |
| reset | Resets the tracer data | `LogTracer reset()` |
| delay | Pauses to show changes in all tracers | `LogTracer delay()` |
| print | Prints a message | `LogTracer print(Object message)` |

## Layouts: Arranging Tracers

Layouts determine how multiple tracers are displayed on the screen. The primary documented layout is `VerticalLayout`, which stacks tracers vertically. The `Layout.setRoot()` method is used to set the root layout for the visualization.

### Example of Using VerticalLayout

```javascript
const array2DTracer = new Array2DTracer('Grid');
const logTracer = new LogTracer('Console');
Layout.setRoot(new VerticalLayout([array2DTracer, logTracer]));
```

This code arranges `array2DTracer` above `logTracer`. Other layouts, such as `HorizontalLayout`, may exist but are not explicitly documented in the available resources. The lack of comprehensive layout documentation suggests that `VerticalLayout` is the most commonly used.

## How to Use Tracers in Code

To create a visualization with Algorithm-Visualizer, follow these steps:

1. **Initialize Tracers**: Create tracer instances and set their initial data using the `set()` method.
2. **Visualize Algorithm Steps**: Integrate tracer methods like `select()`, `patch()`, or `print()` to highlight operations, update values, or log messages.
3. **Use Delays**: Call `delay()` after significant operations to pause and display the visualization.
4. **Arrange Tracers**: If using multiple tracers, use `Layout.setRoot()` with a layout like `VerticalLayout` to organize them.

### Coding Style Guidelines

The coding style for Algorithm-Visualizer emphasizes clarity and visualization:

- **Standard Algorithm Logic**: Write the algorithm as you would normally, using standard JavaScript syntax.
- **Intersperse Tracer Calls**: Add tracer methods to visualize key steps, such as comparisons, swaps, or traversals. For example, use `select()` to highlight elements being compared and `patch()` to update values after changes.
- **Use Descriptive Titles**: Assign meaningful titles to tracers to clarify their purpose in the visualization.
- **Pause for Visibility**: Use `delay()` to ensure each step is visible, especially for educational purposes.
- **Combine Tracers When Needed**: For complex algorithms, use multiple tracers (e.g., an array and a log) to show different aspects, arranged via layouts.

### Example: Bubble Sort with Array1DTracer

Below is an example of visualizing bubble sort using `Array1DTracer`:

```javascript
const arrayTracer = new Array1DTracer('Bubble Sort');
const D = [5, 3, 8, 6, 2];
arrayTracer.set(D);
const N = D.length;
for (let i = 0; i < N - 1; i++) {
  for (let j = 0; j < N - i - 1; j++) {
    arrayTracer.select(j);
    arrayTracer.select(j + 1);
    if (D[j] > D[j + 1]) {
      [D[j], D[j + 1]] = [D[j + 1], D[j]];
      arrayTracer.patch(j, D[j]);
      arrayTracer.patch(j + 1, D[j + 1]);
    }
    arrayTracer.deselect(j);
    arrayTracer.deselect(j + 1);
    arrayTracer.delay();
  }
}
```

In this example:
- `set(D)` initializes the array.
- `select(j)` and `select(j + 1)` highlight the elements being compared.
- `patch(j, D[j])` updates values after a swap.
- `delay()` pauses to show each step.

### Example: Graph Algorithm with GraphTracer and LogTracer

For a graph algorithm like DFS, you might use `GraphTracer` and `LogTracer`:

```javascript
const graphTracer = new GraphTracer('Graph DFS');
const logTracer = new LogTracer('Log');
Layout.setRoot(new VerticalLayout([graphTracer, logTracer]));
graphTracer.set([
  [0, 1, 1, 0],
  [1, 0, 1, 1],
  [1, 1, 0, 1],
  [0, 1, 1, 0]
]);
graphTracer.directed(false);
function dfs(node, visited) {
  visited[node] = true;
  logTracer.print(`Visiting node ${node}`);
  graphTracer.visit(node);
  graphTracer.delay();
  for (let i = 0; i < 4; i++) {
    if (graphTracer._data[node][i] && !visited[i]) {
      graphTracer.select(node, i);
      graphTracer.delay();
      dfs(i, visited);
      graphTracer.deselect(node, i);
      graphTracer.delay();
    }
  }
  graphTracer.leave(node);
  graphTracer.delay();
}
dfs(0, new Array(4).fill(false));
```

Here, `GraphTracer` visualizes the graph, `LogTracer` logs each visit, and `VerticalLayout` arranges them vertically.

## Running and Testing Code

Code can be tested in the "Scratch Paper" section at the bottom left of [algorithm-visualizer.org](https://algorithm-visualizer.org/). This allows you to run and visualize your code before submitting it to the repository. The repository follows a specific structure, with algorithms organized by category (e.g., `brute-force/bubble-sort/code.js`). To contribute, follow the guidelines in the [Contributing.md](https://github.com/algorithm-visualizer/algorithms/blob/master/CONTRIBUTING.md).

## Conclusion

Algorithm-Visualizer is a powerful tool for learning and teaching algorithms through visualization. By using tracers like `Array1DTracer`, `GraphTracer`, and `LogTracer`, and arranging them with layouts like `VerticalLayout`, you can create detailed, step-by-step visualizations. The key is to integrate tracer methods thoughtfully to highlight each operation, ensuring the visualization is both educational and clear. For further details, explore the [GitHub repository](https://github.com/algorithm-visualizer/algorithms) and [tracers.js API reference](https://algorithm-visualizer.github.io/tracers.js/).

## Citations

- [Algorithm-Visualizer Wiki](https://github.com/algorithm-visualizer/algorithm-visualizer/wiki)
- [tracers.js GitHub](https://github.com/algorithm-visualizer/tracers.js)
- [Algorithm-Visualizer Website](https://algorithm-visualizer.org/)