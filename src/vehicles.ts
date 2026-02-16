import type { Vehicle, VehicleAnim, Point } from './types';
import { TILE_SIZE } from './constants';

export function initVehicleAnim(v: Vehicle): VehicleAnim {
  return {
    pixelX: (v.x + 0.5) * TILE_SIZE,
    pixelY: (v.y + 0.5) * TILE_SIZE,
    angle: v.angle || 0,
    path: [],
    moving: false,
    pathIndex: 0,
    progress: 0,
    tilt: 0,
    squash: 1,
    prevAngle: v.angle || 0,
    justStarted: 0,
  };
}

function lerpAngle(a: number, b: number, t: number): number {
  const diff = ((b - a + 540) % 360) - 180;
  return a + diff * t;
}

export function startVehiclePath(anim: VehicleAnim, path: Point[]): void {
  anim.path = path;
  anim.pathIndex = 0;
  anim.progress = 0;
  anim.moving = true;
  anim.justStarted = 0.25;
}

export function stopVehicle(anim: VehicleAnim): void {
  anim.moving = false;
  anim.path = [];
  anim.pathIndex = 0;
  anim.progress = 0;
  anim.squash = 0.92;
}

export function updateVehicle(v: Vehicle, anim: VehicleAnim, dt: number): void {
  if (!anim.moving || anim.path.length < 2) return;

  const speed = 3 * (v.speed || 1);
  anim.progress += dt * speed;

  while (anim.progress >= 1 && anim.pathIndex < anim.path.length - 2) {
    anim.pathIndex++;
    anim.progress -= 1;
  }

  if (anim.pathIndex >= anim.path.length - 1) {
    const last = anim.path[anim.path.length - 1];
    anim.pixelX = (last.x + 0.5) * TILE_SIZE;
    anim.pixelY = (last.y + 0.5) * TILE_SIZE;
    v.x = last.x;
    v.y = last.y;
    stopVehicle(anim);
    return;
  }

  const from = anim.path[anim.pathIndex];
  const to = anim.path[anim.pathIndex + 1];
  const t = Math.min(anim.progress, 1);
  const st = t * t * (3 - 2 * t); // smoothstep

  anim.pixelX = ((from.x + 0.5) + (to.x - from.x) * st) * TILE_SIZE;
  anim.pixelY = ((from.y + 0.5) + (to.y - from.y) * st) * TILE_SIZE;

  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (dx !== 0 || dy !== 0) {
    const targetAngle = Math.atan2(dy, dx) * 180 / Math.PI;
    anim.prevAngle = anim.angle;
    anim.angle = lerpAngle(anim.angle, targetAngle, Math.min(1, dt * 10));
  }

  const angularVel = ((anim.angle - anim.prevAngle + 540) % 360) - 180;
  const targetTilt = Math.max(-3.5, Math.min(3.5, angularVel * 0.8));
  anim.tilt += (targetTilt - anim.tilt) * Math.min(1, dt * 8);

  if (anim.justStarted > 0) {
    anim.justStarted -= dt;
    const sp = Math.max(0, anim.justStarted / 0.25);
    anim.squash = 1 - 0.08 * Math.sin(sp * Math.PI);
  } else {
    anim.squash += (1 - anim.squash) * Math.min(1, dt * 6);
  }

  v.x = from.x;
  v.y = from.y;
  v.angle = anim.angle;
}
