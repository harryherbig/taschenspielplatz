import type { VehicleAnim } from './types';

export interface GameState {
  panX: number;
  panY: number;
  scale: number;
  cameraFollowing: boolean;
  pulseTime: number;
}

export function createGameState(): GameState {
  return {
    panX: 0,
    panY: 0,
    scale: 1,
    cameraFollowing: false,
    pulseTime: 0,
  };
}

export function createVehicleAnims(): Record<string, VehicleAnim> {
  return {};
}
