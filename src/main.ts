import { TILE_SIZE, ASSET_NAMES } from './constants';
import { buildDefaultWorld, getActiveVehicle } from './world';
import { initVehicleAnim, updateVehicle } from './vehicles';
import { render } from './renderer';
import { setupInput } from './input';
import { saveState, loadState } from './persistence';
import { createGameState } from './state';
import type { VehicleAnim } from './types';

const assets: Record<string, HTMLImageElement> = {};
let assetsLoaded = 0;

function loadAssets(callback: () => void) {
  for (const name of ASSET_NAMES) {
    const img = new Image();
    img.onload = () => {
      assets[name] = img;
      assetsLoaded++;
      if (assetsLoaded === ASSET_NAMES.length) callback();
    };
    img.onerror = () => {
      console.error('Failed to load asset: ' + name);
      assetsLoaded++;
      if (assetsLoaded === ASSET_NAMES.length) callback();
    };
    img.src = name + '.png';
  }
}

function init() {
  const canvas = document.getElementById('world-canvas') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d')!;
  const viewportEl = document.getElementById('viewport')!;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();

  const world = buildDefaultWorld();
  const state = createGameState();
  const vehicleAnims: Record<string, VehicleAnim> = {};

  // Initialize animation state for all vehicles
  for (const v of world.vehicles) {
    vehicleAnims[v.id] = initVehicleAnim(v);
  }

  // Load saved state (or use defaults)
  const loaded = loadState(world, state);

  // Re-init anim positions from possibly-loaded vehicle positions
  for (const v of world.vehicles) {
    const anim = vehicleAnims[v.id];
    if (anim) {
      anim.pixelX = (v.x + 0.5) * TILE_SIZE;
      anim.pixelY = (v.y + 0.5) * TILE_SIZE;
      anim.angle = v.angle || 0;
      anim.prevAngle = v.angle || 0;
    }
  }

  if (!loaded) {
    const activeV = getActiveVehicle(world);
    if (activeV) {
      const carCenterX = (activeV.x + 0.5) * TILE_SIZE;
      const carCenterY = (activeV.y + 0.5) * TILE_SIZE;

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      state.scale = Math.min(vw / (10 * TILE_SIZE), vh / (14 * TILE_SIZE), 1.2);

      state.panX = vw / 2 - carCenterX * state.scale;
      state.panY = vh / 2 - carCenterY * state.scale;
    }
  }

  // Setup input
  setupInput(viewportEl, canvas, world, vehicleAnims, state);

  window.addEventListener('resize', resizeCanvas);

  setInterval(() => saveState(world, state), 5000);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) saveState(world, state);
  });

  // Game loop
  let lastTime = 0;

  function gameLoop(timestamp: number) {
    if (!lastTime) lastTime = timestamp;
    const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
    lastTime = timestamp;

    state.pulseTime += dt;

    // Update all vehicles
    for (const v of world.vehicles) {
      const anim = vehicleAnims[v.id];
      if (!anim) continue;

      updateVehicle(v, anim, dt);

      // Spring back squash/tilt when stopped
      if (!anim.moving) {
        anim.squash += (1 - anim.squash) * Math.min(1, dt * 8);
        anim.tilt += (0 - anim.tilt) * Math.min(1, dt * 6);
      }
    }

    // Camera follow active vehicle
    if (state.cameraFollowing) {
      const activeV = getActiveVehicle(world);
      if (activeV) {
        const activeAnim = vehicleAnims[activeV.id];
        if (activeAnim) {
          const targetPanX = canvas.width / 2 - activeAnim.pixelX * state.scale;
          const targetPanY = canvas.height / 2 - activeAnim.pixelY * state.scale;
          const ease = Math.min(1, dt * 2.5);
          state.panX += (targetPanX - state.panX) * ease;
          state.panY += (targetPanY - state.panY) * ease;

          if (!activeAnim.moving) {
            const dPan = Math.abs(targetPanX - state.panX) + Math.abs(targetPanY - state.panY);
            if (dPan < 1) state.cameraFollowing = false;
          }
        }
      }
    }

    render(ctx, canvas, world, assets, vehicleAnims, state);

    requestAnimationFrame(gameLoop);
  }

  lastTime = 0;
  requestAnimationFrame(gameLoop);
}

loadAssets(init);
