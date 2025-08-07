# Writing JavaScript Code with Algorithm Visualizer

Algorithm Visualizer is an interactive platform that enables visualization of algorithms through code, using the `tracers.js` library for JavaScript. This document focuses on writing JavaScript code with Algorithm Visualizer, detailing how to use its tracers and layouts, including a comprehensive list of their methods.

## Understanding Algorithm Visualizer Tracers

Tracers are the core components of the `tracers.js` library, designed to extract visualization commands from JavaScript code. They allow developers to visualize data structures and algorithmic steps dynamically on the Algorithm Visualizer platform (algorithm-visualizer.org) or locally. Tracers provide methods to highlight, select, or modify elements in data structures like arrays or graphs, making the execution of algorithms visually traceable.

### Key Tracer Classes
The `tracers.js` library includes several tracer classes for different visualization purposes:
- **Array1DTracer**: Visualizes one-dimensional arrays, allowing operations like selecting or patching elements.
- **Array2DTracer**: Visualizes two-dimensional arrays (grids), supporting row/column operations.
- **LogTracer**: Displays textual logs of algorithm steps in a console-like interface.
- **ChartTracer**: Visualizes data as charts (e.g., bar charts for sorting algorithms).
- **GraphTracer**: Visualizes graph structures, such as nodes and edges.
- **Tracer**: A base class providing utility methods like `delay()` for controlling animation timing.

### Layout and Visualization Control
- **Layout**: Manages the arrangement of multiple tracers (e.g., stacking an array and log tracer vertically).
- **VerticalLayout**: A layout option to display tracers vertically.
- **HorizontalLayout**: A layout option to display tracers horizontally.
- **Tracer.delay()**: Pauses execution to create a step-by-step animation effect, critical for visualizing algorithm progression.

## Writing JavaScript Code with Tracers

To write JavaScript code for Algorithm Visualizer, you need to import the necessary tracers, define input data, set up the visualization layout, and use tracer methods to visualize algorithm steps. Below is a structured approach to coding with `tracers.js`.

### 1. Importing Visualization Libraries
Start by importing the required tracer classes from the `algorithm-visualizer` module. For example:
```javascript
const { Array1DTracer, Array2DTracer, LogTracer, ChartTracer, GraphTracer, Layout, VerticalLayout, HorizontalLayout, Tracer } = require('algorithm-visualizer');
```

### 2. Defining Tracer Variables
Initialize tracer objects to visualize data structures and logs. Each tracer is given a name for display in the visualizer.
```javascript
const tracer = new Array1DTracer('Array'); // Visualizes a 1D array
const logger = new LogTracer('Console');   // Displays logs
```

### 3. Setting Up the Layout
Configure how tracers are displayed using `Layout.setRoot`. For example, to stack an array tracer and log tracer vertically:
```javascript
Layout.setRoot(new VerticalLayout([tracer, logger]));
```

### 4. Defining Input Data
Prepare the input data for the algorithm. For example, an array for a sorting algorithm:
```javascript
const array = [5, 2, 9, 1, 5, 6];
tracer.set(array); // Set the array to be visualized
Tracer.delay();    // Add a delay to show the initial state
```

### 5. Visualizing Algorithm Steps
Use tracer methods to highlight or modify elements during algorithm execution. Common methods are detailed below in the tracer methods section.

For example, in a Bubble Sort algorithm:
```javascript
function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      tracer.select(j); // Highlight the current element
      tracer.select(j + 1); // Highlight the next element
      Tracer.delay(); // Pause to show comparison
      if (arr[j] > arr[j + 1]) {
        // Swap elements
        let temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
        tracer.patch(j, arr[j]); // Update and highlight new value
        tracer.patch(j + 1, arr[j + 1]);
        Tracer.delay();
        tracer.depatch(j); // Remove highlight
        tracer.depatch(j + 1);
      }
      tracer.deselect(j); // Remove highlight
      tracer.deselect(j + 1);
    }
  }
  return arr;
}
```

### 6. Executing the Algorithm
Call the algorithm function within a `main` function to start the visualization:
```javascript
(function main() {
  bubbleSort(array);
})();
```

## Comprehensive List of Tracer and Layout Methods

Below is a detailed list of methods for each tracer class and layout class in the `tracers.js` library, based on the Algorithm Visualizer API.

### Tracer (Base Class)
The `Tracer` class provides utility methods for controlling visualization timing and state.
- **delay()**: Pauses execution to create an animation effect, allowing the visualization to update. No parameters.
- **reset()**: Resets the tracer to its initial state, clearing all visualizations. No parameters.

### Array1DTracer
Visualizes one-dimensional arrays with methods to highlight, update, or select elements.
- **set(array)**: Initializes the tracer with a one-dimensional array. Parameter: `array` (array of numbers or strings).
- **patch(index, value)**: Updates the value at the specified index and highlights it. Parameters: `index` (integer), `value` (number or string).
- **depatch(index)**: Removes the highlight from the specified index after patching. Parameter: `index` (integer).
- **select(index)**: Highlights the element at the specified index (e.g., for comparison). Parameter: `index` (integer).
- **deselect(index)**: Removes the highlight from the specified index. Parameter: `index` (integer).
- **selectRange(start, end)**: Highlights a range of elements from `start` to `end` (inclusive). Parameters: `start` (integer), `end` (integer).
- **deselectRange(start, end)**: Removes the highlight from a range of elements. Parameters: `start` (integer), `end` (integer).
- **key(index)**: Sets a key or label for the element at the specified index (e.g., for annotations). Parameter: `index` (integer).
- **notify(index)**: Temporarily highlights an element to draw attention (e.g., for a brief flash). Parameter: `index` (integer).
- **denotify(index)**: Removes the temporary highlight from an element. Parameter: `index` (integer).

### Array2DTracer
Visualizes two-dimensional arrays (grids) with methods for row/column operations.
- **set(array)**: Initializes the tracer with a two-dimensional array. Parameter: `array` (array of arrays).
- **patch(x, y, value)**: Updates the value at position (x, y) and highlights it. Parameters: `x` (row index, integer), `y` (column index, integer), `value` (number or string).
- **depatch(x, y)**: Removes the highlight from position (x, y). Parameters: `x` (row index, integer), `y` (column index, integer).
- **select(x, y)**: Highlights the element at position (x, y). Parameters: `x` (row index, integer), `y` (column index, integer).
- **deselect(x, y)**: Removes the highlight from position (x, y). Parameters: `x` (row index, integer), `y` (column index, integer).
- **selectRow(row)**: Highlights an entire row. Parameter: `row` (integer).
- **deselectRow(row)**: Removes the highlight from an entire row. Parameter: `row` (integer).
- **selectCol(col)**: Highlights an entire column. Parameter: `col` (integer).
- **deselectCol(col)**: Removes the highlight from an entire column. Parameter: `col` (integer).
- **key(x, y)**: Sets a key or label for the element at position (x, y). Parameters: `x` (row index, integer), `y` (column index, integer).
- **notify(x, y)**: Temporarily highlights an element at (x, y). Parameters: `x` (row index, integer), `y` (column index, integer).
- **denotify(x, y)**: Removes the temporary highlight from (x, y). Parameters: `x` (row index, integer), `y` (column index, integer).

### LogTracer
Displays textual logs for algorithm steps in a console-like interface.
- **print(message)**: Logs a message without a newline. Parameter: `message` (string).
- **println(message)**: Logs a message with a newline. Parameter: `message` (string).
- **clear()**: Clears all logged messages. No parameters.

### ChartTracer
Visualizes data as charts (e.g., bar charts for sorting algorithms).
- **set(array)**: Initializes the chart with an array of values. Parameter: `array` (array of numbers).
- **patch(index, value)**: Updates the value at the specified index and highlights it. Parameters: `index` (integer), `value` (number).
- **depatch(index)**: Removes the highlight from the specified index. Parameter: `index` (integer).
- **select(index)**: Highlights the element at the specified index. Parameter: `index` (integer).
- **deselect(index)**: Removes the highlight from the specified index. Parameter: `index` (integer).
- **key(index)**: Sets a key or label for the element at the specified index. Parameter: `index` (integer).

### GraphTracer
Visualizes graph structures with nodes and edges.
- **set(array)**: Initializes the graph with an adjacency matrix or list. Parameter: `array` (2D array for adjacency matrix or array of edges).
- **addNode(id, weight)**: Adds a node with an optional weight. Parameters: `id` (string or number), `weight` (number, optional).
- **removeNode(id)**: Removes a node by its ID. Parameter: `id` (string or number).
- **addEdge(from, to, weight)**: Adds an edge between two nodes with an optional weight. Parameters: `from` (node ID), `to` (node ID), `weight` (number, optional).
- **removeEdge(from, to)**: Removes an edge between two nodes. Parameters: `from` (node ID), `to` (node ID).
- **selectNode(id)**: Highlights a node. Parameter: `id` (string or number).
- **deselectNode(id)**: Removes the highlight from a node. Parameter: `id` (string or number).
- **selectEdge(from, to)**: Highlights an edge. Parameters: `from` (node ID), `to` (node ID).
- **deselectEdge(from, to)**: Removes the highlight from an edge. Parameters: `from` (node ID), `to` (node ID).
- **visit(id)**: Marks a node as visited (e.g., for traversal algorithms). Parameter: `id` (string or number).
- **leave(id)**: Marks a node as no longer visited. Parameter: `id` (string or number).
- **setDirected(isDirected)**: Sets whether the graph is directed or undirected. Parameter: `isDirected` (boolean).
- **setWeighted(isWeighted)**: Sets whether the graph edges have weights. Parameter: `isWeighted` (boolean).

### Layout
Manages the arrangement of multiple tracers.
- **setRoot(layout)**: Sets the root layout for displaying tracers. Parameter: `layout` (instance of VerticalLayout or HorizontalLayout).

### VerticalLayout
Arranges tracers vertically.
- **constructor(tracers)**: Initializes a vertical layout with an array of tracers. Parameter: `tracers` (array of tracer instances).

### HorizontalLayout
Arranges tracers horizontally.
- **constructor(tracers)**: Initializes a horizontal layout with an array of tracers. Parameter: `tracers` (array of tracer instances).


## Notes
- Always include `Tracer.delay()` after tracer operations to ensure the visualization updates are visible.
- Use meaningful tracer names (e.g., 'Array', 'Console') for clarity in the visualizer.
- Combine multiple tracers (e.g., Array1DTracer and LogTracer) with layouts to create comprehensive visualizations.
- Check the Algorithm Visualizer API reference for additional details or updates to tracer methods.
- Ensure method parameters are correctly typed (e.g., integers for indices, arrays for initialization) to avoid runtime errors.