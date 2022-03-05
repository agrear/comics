export type ObjectFit = 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';

export type ObjectPosition = 'left top' | 'left center' | 'left bottom' |
  'center top' | 'center center' | 'center bottom' |
  'right top' | 'right center' | 'right bottom';

export type Layout = {
  fit: ObjectFit,
  position: ObjectPosition,
  zoom: number
};

export type Point = {
  x: number,
  y: number
};

export type Size = {
  width: number,
  height: number
};

export function fitObjectPosition(
  position: ObjectPosition,
  container: Size,
  object: Size
): Point {
  const [horizontal, vertical] = getAlignment(position);
  let x = 0, y = 0;

  switch (horizontal) {
    case 'left':
      break;
    case 'center':
      x = (container.width - object.width) / 2;
      break;
    case 'right':
      x = container.width - object.width;
      break;
  }

  switch (vertical) {
    case 'top':
      break;
    case 'center':
      y = (container.height - object.height) / 2;
      break;
    case 'bottom':
      y = container.height - object.height;
      break;
  }

  return { x, y };
}

export function fitObjectSize(
  fit: ObjectFit,
  container: Size,
  object: Size
): Size {
  let x = 1, y = 1;

  switch (fit) {
    case 'contain':
      x = y = Math.min(
        container.width / object.width, container.height / object.height
      );
      break;
    case 'cover':
      x = y = Math.max(
        container.width / object.width, container.height / object.height
      );
      break;
    case 'fill':
      x = container.width / object.width;
      y = container.height / object.height;
      break;
    case 'none':
      break;
    case 'scale-down':
      if (object.width > container.width || object.height > container.height) {
        x = y = Math.min(
          container.width / object.width, container.height / object.height
        );
      }
      break;
    default:
      throw new Error('Unknown object-fit of page layout');
  }

  return { width: object.width * x, height: object.height * y };
}

export function getAlignment(position: ObjectPosition) {
  return position.split(' ');
}

export function getHorizontalAlignment(position: ObjectPosition) {
  switch (position.split(' ')[0]) {
    case 'left':
      return 'flex-start';
    case 'center':
      return 'center';
    case 'right':
      return 'flex-end';
    default:
      throw new Error('Unknown horizontal alignment');
  }
}

export function getVerticalAlignment(position: ObjectPosition) {
  switch (position.split(' ')[1]) {
    case 'top':
      return 'flex-start';
    case 'center':
      return 'center';
    case 'bottom':
      return 'flex-end';
    default:
      throw new Error('Unknown vertical alignment');
  }
}

export function createObjectUrlFromBuffer(buffer: ArrayBuffer, type: string) {
  const blob = new Blob([buffer], { type });
  const urlCreator = window.URL || window.webkitURL;
  return urlCreator.createObjectURL(blob);
}

export async function createBufferFromObjectUrl(
  objectUrl: string
): Promise<{ data: ArrayBuffer, type: string }> {
  const response = await fetch(objectUrl);

  return {
    data: await response.arrayBuffer(),
    type: response.type
  };
}

export function freeObjectUrl(objectUrl: string) {
  const urlCreator = window.URL || window.webkitURL;
  urlCreator.revokeObjectURL(objectUrl);
}

export function getFutureDate(seconds: number, baseDate?: Date) {
  const date = baseDate ? new Date(baseDate) : new Date();

  date.setSeconds(date.getSeconds() + seconds);

  return date;
}

export function identity<T>(value: T): T {
  return value;
}

// https://www.tutorialspoint.com/levenshtein-distance-in-javascript
// https://github.com/gf3/Levenshtein/blob/master/lib/levenshtein.js
export function levenshtein(a: string, b: string): number {
  if (a === b) {
    return 0;
  }

  if (a === '') {
    return b.length;
  }

  if (b === '') {
    return a.length;
  }

  const matrix: number[][] = Array.from({ length: b.length + 1 }, () => (
    Array(a.length + 1).fill(null)
  ));

  for (let i = 0; i <= a.length; ++i) {
    matrix[0][i] = i;
  }

  for (let i = 0; i <= b.length; ++i) {
    matrix[i][0] = i;
  }

  for (let i = 1; i <= b.length; ++i) {
    for (let j = 1; j <= a.length; ++j) {
      const indicator = Number(a[j - 1] !== b[i - 1]);
      matrix[i][j] = Math.min(
        matrix[i][j - 1] + 1,  // Deletion
        matrix[i - 1][j] + 1,  // Insertion
        matrix[i - 1][j - 1] + indicator,  // Substitution
      );
    }
  }

  return matrix[b.length][a.length];
}

// https://github.com/brunoV/String-Cluster-Hobohm/blob/master/lib/String/Cluster/Hobohm.pm
export function hobohm(list: string[], threshold: number = 0.62) {
  const clusters: string[][] = [];

  const isSimilar = (str: string) => clusters.find(cluster => {
    const distance = levenshtein(str, cluster[0]);
    const similarity = 1 - distance / Math.max(1, str.length);

    return similarity >= threshold;
  });

  list.forEach(str => {
    const cluster = isSimilar(str);
    if (cluster) {
      cluster.push(str);
    } else {
      clusters.push([str]);
    }
  });

  return clusters;
}

export function sortByLevenshteinScore(s: string, strings: string[]) {
  const scores = strings.map(entry => ({
    entry,
    score: levenshtein(s, entry)
  }));

  return scores.sort((a, b) => a.score - b.score).map(({ entry }) => entry);
}

export function findIndexLevenshtein(searchTerm: string, list: string[]) {
  return list.reduce((lowest, item, i) => {
    const distance = levenshtein(searchTerm, item);
    return distance < lowest.distance ? { distance, index: i } : lowest;
  }, { distance: Infinity, index: -1 }).index;
}

export function filterByLevenshteinDistance(
  searchTerm: string,
  list: string[],
  threshold = 0.62
) {
  return list.map((item, i) => ({
    similarity: 1 - levenshtein(searchTerm, item) / Math.max(1, item.length),
    index: i
  })).filter(({ similarity, index }) => similarity >= threshold);
}
