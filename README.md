<p align="center">
  <img src="assets/app_logo.png" width="200" alt="Taschenspielplatz" />
</p>

<h1 align="center">Taschenspielplatz</h1>

<p align="center">
  <strong>Not a game. A stage.</strong><br>
  A digital play board for little hands. No scores, no levels, no rules.<br>
  The story is told by the child.
</p>

<p align="center">
  <a href="https://harryherbig.github.io/taschenspielplatz/">Play now</a>
</p>

---

## What is this?

Taschenspielplatz is not another kids' game. It's a digital play board — a reactive stage where the play happens in real life. Children play with their parents or alone, telling stories with visual and tactile support from the app. The fire truck races to the hospital. The ADAC tows the broken car. The ambulance rushes through the night with its lights on. None of this is scripted. The child decides what happens.

Built for the in-between moments: car rides, restaurants, waiting rooms. The playground for when the real one is too far away.

## Philosophy

**No sound.** The app is played in cars and restaurants. Parents hand it over without worry. The kid makes the engine noises themselves.

**No gamification.** No points, no stars, no streaks, no quests. The app wants nothing from the child. It's a reactive stage where the child decides what happens.

**No text.** The target audience can't read. Everything is communicated through interaction.

**No rules.** There's no way to win and no way to lose. No tutorial, no fail state, no grown-up complexity. Just tiny cars on tiny roads.

## How it works

- **Tap a vehicle** to select it (it glows)
- **Drag** to steer it through the streets
- **Pinch** to zoom in and out
- **Two-finger drag** to pan around the world
- **Day/night toggle** — vehicles light up the road with headlights at night

7 vehicles with different sizes and speeds. Switch between them anytime.

## Asset Packs

Each world comes bundled with its own vehicles as an asset pack. The city pack ships with emergency vehicles (fire trucks, ambulance, ADAC) and a normal car. Future packs could include construction sites, farms, or harbors — each with their own themed vehicles.

```
assets/packs/city/
├── world.png
├── vehicle_normal.png
├── vehicle_fire_truck.png
├── vehicle_fire_car.png
├── vehicle_fire_medium.png
├── vehicle_fire_venus.png
├── vehicle_ambulance.png
└── vehicle_adac.png
```

## Tech

- Single `index.html`, no build step, no framework, no dependencies
- Canvas 2D rendering with pan/zoom viewport
- SmoothDamp physics (critically-damped spring) for vehicle movement
- Pointer Events API for unified touch/mouse handling
- Per-pack sprite loading with offscreen canvas caching
- Night mode with canvas-composited darkness and per-vehicle light cutouts
- Per-pack localStorage persistence (vehicle positions, viewport, day/night)

## Running locally

```
open index.html
```

Or serve it:

```
python3 -m http.server 8000
```

## Origin

Evolved from [Toyscape](https://github.com/harryherbig/toyscape), a tablet-on-the-table play mat for real toy cars. Taschenspielplatz takes the concept handheld: the device is held, the cars are virtual, the world is pre-built.

## License

MIT
