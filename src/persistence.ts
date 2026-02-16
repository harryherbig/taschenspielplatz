import type { World, SavedState } from './types';
import { STORAGE_KEY } from './constants';
import type { GameState } from './state';

export function saveState(world: World, state: GameState): void {
  try {
    const vehicleStates = world.vehicles.map(v => ({
      id: v.id, x: v.x, y: v.y, angle: v.angle,
      speed: v.speed, hue: v.hue,
    }));

    const saved: SavedState = {
      vehicles: vehicleStates,
      activeVehicleId: world.activeVehicleId,
      pan: { x: state.panX, y: state.panY },
      scale: state.scale,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  } catch {
    // ignore
  }
}

export function loadState(world: World, state: GameState): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const saved: SavedState = JSON.parse(raw);

    if (saved.vehicles && saved.vehicles.length === world.vehicles.length) {
      for (let i = 0; i < saved.vehicles.length; i++) {
        const sv = saved.vehicles[i];
        const v = world.vehicles[i];
        if (sv.id === v.id) {
          v.x = sv.x;
          v.y = sv.y;
          v.angle = sv.angle || 0;
        }
      }
    }

    if (saved.activeVehicleId) {
      world.activeVehicleId = saved.activeVehicleId;
    }

    if (saved.pan) {
      state.panX = saved.pan.x;
      state.panY = saved.pan.y;
    }
    if (saved.scale) {
      state.scale = saved.scale;
    }

    return true;
  } catch {
    return false;
  }
}
