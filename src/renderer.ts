import type { World, Vehicle, VehicleAnim } from './types';
import { TILE_SIZE, RENDER_BUFFER } from './constants';
import { getTile, getActiveVehicle, screenToWorld } from './world';
import type { GameState } from './state';

const hueCache: Record<number, HTMLCanvasElement> = {};

export function getHueRotatedCar(hue: number, carAsset: HTMLImageElement): HTMLCanvasElement | HTMLImageElement {
  if (hue === 0) return carAsset;
  if (hueCache[hue]) return hueCache[hue];

  const w = carAsset.width;
  const h = carAsset.height;
  const oc = document.createElement('canvas');
  oc.width = w;
  oc.height = h;
  const octx = oc.getContext('2d')!;
  octx.drawImage(carAsset, 0, 0);

  const imageData = octx.getImageData(0, 0, w, h);
  const d = imageData.data;
  const shift = ((hue % 360) + 360) % 360;

  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] === 0) continue;

    const r = d[i] / 255, g = d[i + 1] / 255, b = d[i + 2] / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const delta = max - min;
    const l = (max + min) / 2;

    if (delta === 0) continue;

    const s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    let hVal: number;
    if (max === r) hVal = ((g - b) / delta + (g < b ? 6 : 0)) * 60;
    else if (max === g) hVal = ((b - r) / delta + 2) * 60;
    else hVal = ((r - g) / delta + 4) * 60;

    hVal = (hVal + shift) % 360;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((hVal / 60) % 2 - 1));
    const m = l - c / 2;
    let r1: number, g1: number, b1: number;

    if (hVal < 60)       { r1 = c; g1 = x; b1 = 0; }
    else if (hVal < 120) { r1 = x; g1 = c; b1 = 0; }
    else if (hVal < 180) { r1 = 0; g1 = c; b1 = x; }
    else if (hVal < 240) { r1 = 0; g1 = x; b1 = c; }
    else if (hVal < 300) { r1 = x; g1 = 0; b1 = c; }
    else                 { r1 = c; g1 = 0; b1 = x; }

    d[i]     = Math.round((r1 + m) * 255);
    d[i + 1] = Math.round((g1 + m) * 255);
    d[i + 2] = Math.round((b1 + m) * 255);
  }

  octx.putImageData(imageData, 0, 0);
  hueCache[hue] = oc;
  return oc;
}

function drawVehicle(
  ctx: CanvasRenderingContext2D,
  v: Vehicle,
  anim: VehicleAnim,
  isActive: boolean,
  carAsset: HTMLImageElement,
  state: GameState,
) {
  const carImg = getHueRotatedCar(v.hue, carAsset);
  const { panX, panY, scale, pulseTime } = state;

  const sx = anim.pixelX * scale + panX;
  const sy = anim.pixelY * scale + panY;
  const carW = TILE_SIZE * 0.55 * scale;
  const carH = TILE_SIZE * 0.75 * scale;
  const rotRad = (anim.angle - 90) * Math.PI / 180;
  const tiltRad = anim.tilt * Math.PI / 180;

  if (isActive) {
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(rotRad);

    const pulse = 0.35 + 0.2 * Math.sin(pulseTime * 3);
    ctx.shadowColor = `rgba(255, 255, 100, ${pulse})`;
    ctx.shadowBlur = Math.max(12, 20 * scale);
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    ctx.fillStyle = 'rgba(255, 255, 100, 0.01)';
    ctx.fillRect(-carW / 2 - 2, -carH / 2 - 2, carW + 4, carH + 4);
    ctx.restore();
  }

  ctx.save();
  ctx.translate(sx, sy);
  ctx.rotate(rotRad);
  ctx.transform(1, 0, Math.tan(tiltRad), anim.squash, 0, 0);

  ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
  ctx.shadowBlur = Math.max(4, 6 * scale);
  ctx.shadowOffsetX = 3 * scale;
  ctx.shadowOffsetY = 4 * scale;

  ctx.drawImage(carImg, -carW / 2, -carH / 2, carW, carH);
  ctx.restore();
}

export function render(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  world: World,
  assets: Record<string, HTMLImageElement>,
  vehicleAnims: Record<string, VehicleAnim>,
  state: GameState,
) {
  const { panX, panY, scale } = state;
  const cw = canvas.width;
  const ch = canvas.height;
  ctx.clearRect(0, 0, cw, ch);

  ctx.fillStyle = '#2a5a1e';
  ctx.fillRect(0, 0, cw, ch);

  const topLeft = screenToWorld(0, 0, panX, panY, scale);
  const bottomRight = screenToWorld(cw, ch, panX, panY, scale);

  let startCol = Math.floor(topLeft.x / TILE_SIZE) - RENDER_BUFFER;
  let startRow = Math.floor(topLeft.y / TILE_SIZE) - RENDER_BUFFER;
  let endCol = Math.ceil(bottomRight.x / TILE_SIZE) + RENDER_BUFFER;
  let endRow = Math.ceil(bottomRight.y / TILE_SIZE) + RENDER_BUFFER;

  startCol = Math.max(0, startCol);
  startRow = Math.max(0, startRow);
  endCol = Math.min(world.width - 1, endCol);
  endRow = Math.min(world.height - 1, endRow);

  const tileSizeScaled = TILE_SIZE * scale;

  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      const tile = getTile(world, col, row);
      if (!tile) continue;

      const sx = col * TILE_SIZE * scale + panX;
      const sy = row * TILE_SIZE * scale + panY;

      const assetName = tile.type || 'ground';
      const img = assets[assetName];
      if (!img) continue;

      const rotation = tile.rotation || 0;

      if (rotation === 0) {
        ctx.drawImage(img, sx, sy, tileSizeScaled, tileSizeScaled);
      } else {
        ctx.save();
        ctx.translate(sx + tileSizeScaled / 2, sy + tileSizeScaled / 2);
        ctx.rotate(rotation * Math.PI / 180);
        ctx.drawImage(img, -tileSizeScaled / 2, -tileSizeScaled / 2, tileSizeScaled, tileSizeScaled);
        ctx.restore();
      }
    }
  }

  // Draw inactive vehicles first, active last
  for (const v of world.vehicles) {
    if (v.id === world.activeVehicleId) continue;
    const anim = vehicleAnims[v.id];
    if (anim) drawVehicle(ctx, v, anim, false, assets.car, state);
  }

  const activeV = getActiveVehicle(world);
  if (activeV) {
    const anim = vehicleAnims[activeV.id];
    if (anim) drawVehicle(ctx, activeV, anim, true, assets.car, state);
  }
}
