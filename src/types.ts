export interface Tile {
  x: number;
  y: number;
  type: string;
  rotation?: number;
}

export interface Vehicle {
  id: string;
  type: string;
  x: number;
  y: number;
  angle: number;
  speed: number;
  hue: number;
}

export interface World {
  width: number;
  height: number;
  tiles: Tile[];
  interactives: unknown[];
  vehicles: Vehicle[];
  activeVehicleId: string | null;
}

export interface VehicleAnim {
  pixelX: number;
  pixelY: number;
  angle: number;
  path: Point[];
  moving: boolean;
  pathIndex: number;
  progress: number;
  tilt: number;
  squash: number;
  prevAngle: number;
  justStarted: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface PointerInfo {
  x: number;
  y: number;
}

export interface SavedVehicleState {
  id: string;
  x: number;
  y: number;
  angle: number;
  speed: number;
  hue: number;
}

export interface SavedState {
  vehicles: SavedVehicleState[];
  activeVehicleId: string | null;
  pan: { x: number; y: number };
  scale: number;
}
