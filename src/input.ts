import type { World, Vehicle, VehicleAnim } from './types';
import { TILE_SIZE, MIN_SCALE, MAX_SCALE } from './constants';
import { getActiveVehicle, screenToWorld, screenToTile, isRoad, findNearestRoad } from './world';
import { bfsPath } from './pathfinding';
import { stopVehicle, startVehiclePath } from './vehicles';
import { saveState } from './persistence';
import type { GameState } from './state';

interface PointerInfo {
  x: number;
  y: number;
}

let pointers: Record<number, PointerInfo> = {};
let touchStartTime = 0;
let touchMoved = false;
let lastPanX = 0;
let lastPanY = 0;
let lastPinchDist = 0;
let lastPinchCX = 0;
let lastPinchCY = 0;
let isPanning = false;
let tapStartX = 0;
let tapStartY = 0;

function getPointerArray(): PointerInfo[] {
  return Object.values(pointers);
}

function getPinchData(arr: PointerInfo[]) {
  const dx = arr[1].x - arr[0].x;
  const dy = arr[1].y - arr[0].y;
  return {
    dist: Math.sqrt(dx * dx + dy * dy),
    cx: (arr[0].x + arr[1].x) / 2,
    cy: (arr[0].y + arr[1].y) / 2,
  };
}

function getVehicleNearScreenPos(
  clientX: number,
  clientY: number,
  world: World,
  vehicleAnims: Record<string, VehicleAnim>,
  state: GameState,
): Vehicle | null {
  const wp = screenToWorld(clientX, clientY, state.panX, state.panY, state.scale);
  let bestV: Vehicle | null = null;
  let bestDist = Infinity;
  const threshold = TILE_SIZE * 0.7;

  for (const v of world.vehicles) {
    const anim = vehicleAnims[v.id];
    if (!anim) continue;

    const dx = wp.x - anim.pixelX;
    const dy = wp.y - anim.pixelY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < threshold && dist < bestDist) {
      bestDist = dist;
      bestV = v;
    }
  }
  return bestV;
}

function switchToVehicle(
  v: Vehicle,
  world: World,
  vehicleAnims: Record<string, VehicleAnim>,
  state: GameState,
): void {
  if (world.activeVehicleId === v.id) return;

  const current = getActiveVehicle(world);
  if (current) {
    const currentAnim = vehicleAnims[current.id];
    if (currentAnim && currentAnim.moving) {
      if (currentAnim.pathIndex < currentAnim.path.length) {
        const snapTile = currentAnim.path[currentAnim.pathIndex];
        current.x = snapTile.x;
        current.y = snapTile.y;
      }
      stopVehicle(currentAnim);
    }
  }

  world.activeVehicleId = v.id;

  const anim = vehicleAnims[v.id];
  if (anim) {
    state.cameraFollowing = true;
  }

  saveState(world, state);
}

function navigateActiveVehicleTo(
  tx: number,
  ty: number,
  world: World,
  vehicleAnims: Record<string, VehicleAnim>,
  state: GameState,
): void {
  const v = getActiveVehicle(world);
  if (!v) return;

  const anim = vehicleAnims[v.id];
  let startX = v.x;
  let startY = v.y;

  if (anim && anim.moving && anim.path.length > 0 && anim.pathIndex < anim.path.length) {
    startX = anim.path[anim.pathIndex].x;
    startY = anim.path[anim.pathIndex].y;
    v.x = startX;
    v.y = startY;
  }

  let targetX = tx;
  let targetY = ty;

  if (!isRoad(world, tx, ty)) {
    const nearest = findNearestRoad(world, tx, ty);
    if (nearest) {
      targetX = nearest.x;
      targetY = nearest.y;
    } else {
      return;
    }
  }

  const path = bfsPath(world, startX, startY, targetX, targetY);
  if (path && path.length >= 2 && anim) {
    stopVehicle(anim);
    startVehiclePath(anim, path);
    state.cameraFollowing = true;
  }
}

function handleTap(
  clientX: number,
  clientY: number,
  world: World,
  vehicleAnims: Record<string, VehicleAnim>,
  state: GameState,
): void {
  const tappedVehicle = getVehicleNearScreenPos(clientX, clientY, world, vehicleAnims, state);
  if (tappedVehicle) {
    switchToVehicle(tappedVehicle, world, vehicleAnims, state);
    return;
  }

  const tile = screenToTile(clientX, clientY, state.panX, state.panY, state.scale);
  navigateActiveVehicleTo(tile.x, tile.y, world, vehicleAnims, state);
}

export function setupInput(
  viewportEl: HTMLElement,
  canvas: HTMLCanvasElement,
  world: World,
  vehicleAnims: Record<string, VehicleAnim>,
  state: GameState,
): void {
  function onPointerDown(e: PointerEvent) {
    if ((e.target as HTMLElement).closest('.ui-btn')) return;
    e.preventDefault();

    pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
    const pArr = getPointerArray();

    if (pArr.length === 1) {
      touchStartTime = Date.now();
      touchMoved = false;
      lastPanX = e.clientX;
      lastPanY = e.clientY;
      tapStartX = e.clientX;
      tapStartY = e.clientY;
      isPanning = false;
    } else if (pArr.length >= 2) {
      const pd = getPinchData(pArr);
      lastPinchDist = pd.dist;
      lastPinchCX = pd.cx;
      lastPinchCY = pd.cy;
      isPanning = true;
    }
  }

  function onPointerMove(e: PointerEvent) {
    if (!pointers[e.pointerId]) return;
    e.preventDefault();

    pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
    const pArr = getPointerArray();

    if (pArr.length === 1) {
      const dx = e.clientX - lastPanX;
      const dy = e.clientY - lastPanY;

      if (!isPanning && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
        isPanning = true;
        touchMoved = true;
        state.cameraFollowing = false;
      }

      if (isPanning) {
        state.panX += dx;
        state.panY += dy;
        lastPanX = e.clientX;
        lastPanY = e.clientY;
      }
    } else if (pArr.length >= 2) {
      const pd = getPinchData(pArr);
      state.cameraFollowing = false;

      const zoomRatio = pd.dist / lastPinchDist;
      const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, state.scale * zoomRatio));

      const dCx = pd.cx - lastPinchCX;
      const dCy = pd.cy - lastPinchCY;

      state.panX = state.panX + dCx - (lastPinchCX - state.panX) * (newScale / state.scale - 1);
      state.panY = state.panY + dCy - (lastPinchCY - state.panY) * (newScale / state.scale - 1);
      state.scale = newScale;

      lastPinchDist = pd.dist;
      lastPinchCX = pd.cx;
      lastPinchCY = pd.cy;

      touchMoved = true;
    }
  }

  function onPointerUp(e: PointerEvent) {
    if (!pointers[e.pointerId]) return;
    e.preventDefault();

    delete pointers[e.pointerId];

    const elapsed = Date.now() - touchStartTime;
    if (!touchMoved && elapsed < 400) {
      handleTap(tapStartX, tapStartY, world, vehicleAnims, state);
    }

    const pArr = getPointerArray();
    if (pArr.length >= 2) {
      const pd = getPinchData(pArr);
      lastPinchDist = pd.dist;
      lastPinchCX = pd.cx;
      lastPinchCY = pd.cy;
    }
  }

  function onPointerCancel(e: PointerEvent) {
    delete pointers[e.pointerId];
  }

  function onWheel(e: WheelEvent) {
    e.preventDefault();
    state.cameraFollowing = false;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, state.scale * zoomFactor));

    state.panX = mx - (mx - state.panX) * (newScale / state.scale);
    state.panY = my - (my - state.panY) * (newScale / state.scale);
    state.scale = newScale;
  }

  viewportEl.addEventListener('pointerdown', onPointerDown, { passive: false });
  viewportEl.addEventListener('pointermove', onPointerMove, { passive: false });
  viewportEl.addEventListener('pointerup', onPointerUp, { passive: false });
  viewportEl.addEventListener('pointercancel', onPointerCancel);
  viewportEl.addEventListener('wheel', onWheel, { passive: false });

  document.addEventListener('touchstart', (e) => {
    if (!(e.target as HTMLElement).closest('.ui-btn')) e.preventDefault();
  }, { passive: false });
  document.addEventListener('touchmove', (e) => {
    e.preventDefault();
  }, { passive: false });
  document.addEventListener('gesturestart', (e) => { e.preventDefault(); });
}
