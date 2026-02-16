import type { World, Point } from './types';
import { getTile, isRoad } from './world';

function curveConnects(rotation: number, dx: number, dy: number): boolean {
  const connections: Record<number, [number, number][]> = {
    0:   [[0, 1], [1, 0]],
    90:  [[-1, 0], [0, 1]],
    180: [[0, -1], [-1, 0]],
    270: [[1, 0], [0, -1]],
  };
  const conns = connections[rotation] || connections[0];
  return conns.some(c => c[0] === dx && c[1] === dy);
}

function straightConnects(rotation: number, dx: number, dy: number): boolean {
  if (rotation === 0 || rotation === 180) {
    return dx === 0 && (dy === -1 || dy === 1);
  } else {
    return dy === 0 && (dx === -1 || dx === 1);
  }
}

function tjunctionConnects(rotation: number, dx: number, dy: number): boolean {
  const connections: Record<number, [number, number][]> = {
    0:   [[0, -1], [1, 0], [-1, 0]],
    90:  [[0, -1], [1, 0], [0, 1]],
    180: [[1, 0], [0, 1], [-1, 0]],
    270: [[0, -1], [0, 1], [-1, 0]],
  };
  const conns = connections[rotation] || connections[0];
  return conns.some(c => c[0] === dx && c[1] === dy);
}

function tileConnectsInDirection(world: World, x: number, y: number, dx: number, dy: number): boolean {
  const tile = getTile(world, x, y);
  if (!tile) return false;
  if (tile.type === 'road_crossroad') return true;
  if (tile.type === 'road_tjunction') return tjunctionConnects(tile.rotation || 0, dx, dy);
  if (tile.type === 'road') return straightConnects(tile.rotation || 0, dx, dy);
  if (tile.type === 'road_curved') return curveConnects(tile.rotation || 0, dx, dy);
  return false;
}

function getConnectedRoads(world: World, x: number, y: number): Point[] {
  const neighbors: Point[] = [];
  const dirs: [number, number][] = [[0, -1], [1, 0], [0, 1], [-1, 0]];
  for (const [dx, dy] of dirs) {
    const nx = x + dx;
    const ny = y + dy;
    if (tileConnectsInDirection(world, x, y, dx, dy) &&
        tileConnectsInDirection(world, nx, ny, -dx, -dy)) {
      neighbors.push({ x: nx, y: ny });
    }
  }
  return neighbors;
}

export function bfsPath(world: World, startX: number, startY: number, endX: number, endY: number): Point[] | null {
  if (startX === endX && startY === endY) return [{ x: startX, y: startY }];
  if (!isRoad(world, startX, startY) || !isRoad(world, endX, endY)) return null;

  const queue: Point[] = [{ x: startX, y: startY }];
  const visited = new Set<string>();
  const parent = new Map<string, Point | undefined>();
  const key = (x: number, y: number) => `${x},${y}`;

  visited.add(key(startX, startY));
  parent.set(key(startX, startY), undefined);

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (current.x === endX && current.y === endY) {
      const path: Point[] = [];
      let node: Point | undefined = current;
      while (node) {
        path.unshift({ x: node.x, y: node.y });
        node = parent.get(key(node.x, node.y));
      }
      return path;
    }

    const neighbors = getConnectedRoads(world, current.x, current.y);
    for (const n of neighbors) {
      const nk = key(n.x, n.y);
      if (!visited.has(nk)) {
        visited.add(nk);
        parent.set(nk, current);
        queue.push(n);
      }
    }
  }

  return null;
}
