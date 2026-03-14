export type SortStep = {
  array: number[];
  comparing: [number, number] | null;
  swapping: [number, number] | null;
};

export type SortGenerator = Generator<SortStep, void, unknown>;

function snap(arr: number[], comparing: [number, number] | null, swapping: [number, number] | null): SortStep {
  return { array: [...arr], comparing, swapping };
}

export function* bubbleSort(arr: number[], ascending: boolean): SortGenerator {
  const a = [...arr];
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      yield snap(a, [j, j + 1], null);
      const cond = ascending ? a[j] > a[j + 1] : a[j] < a[j + 1];
      if (cond) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        yield snap(a, null, [j, j + 1]);
      }
    }
  }
  yield snap(a, null, null);
}

export function* selectionSort(arr: number[], ascending: boolean): SortGenerator {
  const a = [...arr];
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    let target = i;
    for (let j = i + 1; j < n; j++) {
      yield snap(a, [target, j], null);
      const cond = ascending ? a[j] < a[target] : a[j] > a[target];
      if (cond) target = j;
    }
    if (target !== i) {
      [a[i], a[target]] = [a[target], a[i]];
      yield snap(a, null, [i, target]);
    }
  }
  yield snap(a, null, null);
}

export function* insertionSort(arr: number[], ascending: boolean): SortGenerator {
  const a = [...arr];
  const n = a.length;
  for (let i = 1; i < n; i++) {
    let j = i;
    while (j > 0) {
      yield snap(a, [j - 1, j], null);
      const cond = ascending ? a[j - 1] > a[j] : a[j - 1] < a[j];
      if (!cond) break;
      [a[j - 1], a[j]] = [a[j], a[j - 1]];
      yield snap(a, null, [j - 1, j]);
      j--;
    }
  }
  yield snap(a, null, null);
}

export function* mergeSort(arr: number[], ascending: boolean): SortGenerator {
  const a = [...arr];
  const n = a.length;

  function* mergeSortHelper(lo: number, hi: number): SortGenerator {
    if (hi - lo <= 1) return;
    const mid = Math.floor((lo + hi) / 2);
    yield* mergeSortHelper(lo, mid);
    yield* mergeSortHelper(mid, hi);

    const left = a.slice(lo, mid);
    const right = a.slice(mid, hi);
    let i = 0, j = 0, k = lo;

    while (i < left.length && j < right.length) {
      yield snap(a, [lo + i, mid + j], null);
      const cond = ascending ? left[i] <= right[j] : left[i] >= right[j];
      if (cond) {
        a[k] = left[i];
        i++;
      } else {
        a[k] = right[j];
        j++;
      }
      yield snap(a, null, [k, k]);
      k++;
    }
    while (i < left.length) {
      a[k] = left[i];
      yield snap(a, null, [k, k]);
      i++; k++;
    }
    while (j < right.length) {
      a[k] = right[j];
      yield snap(a, null, [k, k]);
      j++; k++;
    }
  }

  yield* mergeSortHelper(0, n);
  yield snap(a, null, null);
}

export function* quickSort(arr: number[], ascending: boolean): SortGenerator {
  const a = [...arr];

  function* qs(lo: number, hi: number): SortGenerator {
    if (lo >= hi) return;
    const pivot = a[hi];
    let i = lo;
    for (let j = lo; j < hi; j++) {
      yield snap(a, [j, hi], null);
      const cond = ascending ? a[j] < pivot : a[j] > pivot;
      if (cond) {
        [a[i], a[j]] = [a[j], a[i]];
        yield snap(a, null, [i, j]);
        i++;
      }
    }
    [a[i], a[hi]] = [a[hi], a[i]];
    yield snap(a, null, [i, hi]);
    yield* qs(lo, i - 1);
    yield* qs(i + 1, hi);
  }

  yield* qs(0, a.length - 1);
  yield snap(a, null, null);
}

export function* heapSort(arr: number[], ascending: boolean): SortGenerator {
  const a = [...arr];
  const n = a.length;

  function* heapify(size: number, root: number): SortGenerator {
    let target = root;
    const left = 2 * root + 1;
    const right = 2 * root + 2;

    if (left < size) {
      yield snap(a, [target, left], null);
      const cond = ascending ? a[left] > a[target] : a[left] < a[target];
      if (cond) target = left;
    }
    if (right < size) {
      yield snap(a, [target, right], null);
      const cond = ascending ? a[right] > a[target] : a[right] < a[target];
      if (cond) target = right;
    }
    if (target !== root) {
      [a[root], a[target]] = [a[target], a[root]];
      yield snap(a, null, [root, target]);
      yield* heapify(size, target);
    }
  }

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    yield* heapify(n, i);
  }
  for (let i = n - 1; i > 0; i--) {
    [a[0], a[i]] = [a[i], a[0]];
    yield snap(a, null, [0, i]);
    yield* heapify(i, 0);
  }
  yield snap(a, null, null);
}

export function* countingSort(arr: number[], ascending: boolean): SortGenerator {
  const a = [...arr];
  const n = a.length;
  const max = Math.max(...a);
  const count = new Array(max + 1).fill(0);

  for (let i = 0; i < n; i++) {
    count[a[i]]++;
    yield snap(a, [i, i], null);
  }

  let idx = 0;
  const start = ascending ? 0 : max;
  const end = ascending ? max + 1 : -1;
  const step = ascending ? 1 : -1;

  for (let i = start; i !== end; i += step) {
    while (count[i] > 0) {
      a[idx] = i;
      yield snap(a, null, [idx, idx]);
      count[i]--;
      idx++;
    }
  }
  yield snap(a, null, null);
}

export type Algorithm = {
  name: string;
  fn: (arr: number[], ascending: boolean) => SortGenerator;
  time: string;
  space: string;
};

export const algorithms: Algorithm[] = [
  { name: "Bubble Sort", fn: bubbleSort, time: "O(n\u00B2)", space: "O(1)" },
  { name: "Selection Sort", fn: selectionSort, time: "O(n\u00B2)", space: "O(1)" },
  { name: "Insertion Sort", fn: insertionSort, time: "O(n\u00B2)", space: "O(1)" },
  { name: "Merge Sort", fn: mergeSort, time: "O(n log n)", space: "O(n)" },
  { name: "Quick Sort", fn: quickSort, time: "O(n log n)", space: "O(log n)" },
  { name: "Heap Sort", fn: heapSort, time: "O(n log n)", space: "O(1)" },
  { name: "Counting Sort", fn: countingSort, time: "O(n + k)", space: "O(k)" },
];
