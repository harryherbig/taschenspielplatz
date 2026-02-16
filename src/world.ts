import type { World, Tile } from './types';
import { TILE_SIZE } from './constants';

export function createEmptyWorld(w: number, h: number): World {
  const tiles: Tile[] = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      tiles.push({ x, y, type: 'ground' });
    }
  }
  return {
    width: w,
    height: h,
    tiles,
    interactives: [],
    vehicles: [],
    activeVehicleId: null,
  };
}

export function getTile(world: World, x: number, y: number): Tile | null {
  if (x < 0 || x >= world.width || y < 0 || y >= world.height) return null;
  return world.tiles[y * world.width + x];
}

export function setTile(world: World, x: number, y: number, type: string, rotation?: number): void {
  if (x < 0 || x >= world.width || y < 0 || y >= world.height) return;
  const tile = world.tiles[y * world.width + x];
  tile.type = type;
  tile.rotation = rotation || 0;
}

export function isRoad(world: World, x: number, y: number): boolean {
  const t = getTile(world, x, y);
  if (!t) return false;
  return t.type === 'road' || t.type === 'road_curved' || t.type === 'road_crossroad' || t.type === 'road_tjunction';
}

export function buildDefaultWorld(): World {
  const world = createEmptyWorld(20, 20);

  function road(x: number, y: number, rot?: number) { setTile(world, x, y, 'road', rot || 0); }
  function curve(x: number, y: number, rot?: number) { setTile(world, x, y, 'road_curved', rot || 0); }
  function cross(x: number, y: number) { setTile(world, x, y, 'road_crossroad', 0); }
  function tjunc(x: number, y: number, rot?: number) { setTile(world, x, y, 'road_tjunction', rot || 0); }

  // Main horizontal avenue (row 3)
  curve(2, 3, 0);
  road(3, 3, 90); road(4, 3, 90); road(5, 3, 90); road(6, 3, 90);
  cross(7, 3);
  road(8, 3, 90); road(9, 3, 90); road(10, 3, 90);
  tjunc(11, 3, 180);
  road(12, 3, 90); road(13, 3, 90); road(14, 3, 90); road(15, 3, 90);
  tjunc(16, 3, 180);
  curve(17, 3, 90);

  // Main horizontal avenue (row 10)
  curve(2, 10, 270);
  road(3, 10, 90); road(4, 10, 90); road(5, 10, 90); road(6, 10, 90);
  cross(7, 10);
  road(8, 10, 90); road(9, 10, 90); road(10, 10, 90);
  cross(11, 10);
  road(12, 10, 90); road(13, 10, 90); road(14, 10, 90); road(15, 10, 90);
  tjunc(16, 10, 0);
  curve(17, 10, 180);

  // Main horizontal avenue (row 16)
  curve(4, 16, 270);
  road(5, 16, 90); road(6, 16, 90);
  tjunc(7, 16, 0);
  road(8, 16, 90); road(9, 16, 90); road(10, 16, 90);
  cross(11, 16);
  road(12, 16, 90); road(13, 16, 90);
  curve(14, 16, 180);

  // Vertical street: col 2, rows 3→10
  road(2, 4, 0); road(2, 5, 0); road(2, 6, 0); road(2, 7, 0);
  road(2, 8, 0); road(2, 9, 0);

  // Vertical street: col 7, rows 3→16
  road(7, 4, 0); road(7, 5, 0); road(7, 6, 0); road(7, 7, 0);
  road(7, 8, 0); road(7, 9, 0);
  road(7, 11, 0); road(7, 12, 0); road(7, 13, 0); road(7, 14, 0);
  road(7, 15, 0);

  // Vertical street: col 11, rows 3→16
  road(11, 4, 0); road(11, 5, 0); road(11, 6, 0); road(11, 7, 0);
  road(11, 8, 0); road(11, 9, 0);
  road(11, 11, 0); road(11, 12, 0); road(11, 13, 0); road(11, 14, 0);
  road(11, 15, 0);

  // Vertical street: col 16, rows 3→10
  road(16, 4, 0); road(16, 5, 0); road(16, 6, 0); road(16, 7, 0);
  road(16, 8, 0); road(16, 9, 0);

  // Vertical street: col 17, rows 3→10
  road(17, 4, 0); road(17, 5, 0); road(17, 6, 0); road(17, 7, 0);
  road(17, 8, 0); road(17, 9, 0);

  // Small loop: top-left residential area
  curve(4, 1, 0);
  road(5, 1, 90); road(6, 1, 90);
  curve(7, 1, 90);
  road(4, 2, 0);
  road(7, 2, 0);
  setTile(world, 4, 3, 'road_tjunction', 0);

  // Small spur: dead-end street going north from row 3
  road(14, 1, 0); road(14, 2, 0);
  setTile(world, 14, 3, 'road_tjunction', 0);

  // Small loop: bottom-right
  tjunc(14, 13, 90);
  road(15, 13, 90); road(16, 13, 90);
  curve(17, 13, 90);
  road(14, 14, 0);
  road(17, 14, 0);
  curve(14, 15, 270);
  road(15, 15, 90); road(16, 15, 90);
  curve(17, 15, 180);
  road(14, 11, 0); road(14, 12, 0);
  setTile(world, 14, 10, 'road_tjunction', 180);

  // Dead-end street south from crossroad at (11,16)
  road(11, 17, 0); road(11, 18, 0); road(11, 19, 0);

  // Short connector: col 4, row 10→16
  road(4, 13, 0); road(4, 14, 0); road(4, 15, 0);
  setTile(world, 4, 10, 'road_tjunction', 180);
  road(4, 11, 0); road(4, 12, 0);

  // Place 5 vehicles
  world.vehicles = [
    { id: 'car1', type: 'car', x: 5,  y: 3,  angle: 90,  speed: 1.0, hue: 0 },
    { id: 'car2', type: 'car', x: 9,  y: 3,  angle: 90,  speed: 0.6, hue: 200 },
    { id: 'car3', type: 'car', x: 7,  y: 6,  angle: 0,   speed: 0.8, hue: 100 },
    { id: 'car4', type: 'car', x: 4,  y: 12, angle: 180, speed: 0.4, hue: 40 },
    { id: 'car5', type: 'car', x: 16, y: 7,  angle: 0,   speed: 0.7, hue: 300 },
  ];
  world.activeVehicleId = 'car1';

  return world;
}

export function getActiveVehicle(world: World) {
  return world.vehicles.find(v => v.id === world.activeVehicleId) ?? null;
}

export function findNearestRoad(world: World, tx: number, ty: number): Tile | null {
  let best: Tile | null = null;
  let bestDist = Infinity;
  for (const t of world.tiles) {
    if (t.type === 'road' || t.type === 'road_curved' || t.type === 'road_crossroad' || t.type === 'road_tjunction') {
      const dx = t.x - tx;
      const dy = t.y - ty;
      const dist = dx * dx + dy * dy;
      if (dist < bestDist) {
        bestDist = dist;
        best = t;
      }
    }
  }
  return best;
}

export function screenToWorld(sx: number, sy: number, panX: number, panY: number, scale: number) {
  return {
    x: (sx - panX) / scale,
    y: (sy - panY) / scale,
  };
}

export function screenToTile(sx: number, sy: number, panX: number, panY: number, scale: number) {
  const w = screenToWorld(sx, sy, panX, panY, scale);
  return {
    x: Math.floor(w.x / TILE_SIZE),
    y: Math.floor(w.y / TILE_SIZE),
  };
}
