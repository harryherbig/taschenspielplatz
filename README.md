<p align="center">
  <img src="assets/app_logo.png" width="200" alt="Taschenspielplatz" />
</p>

<h1 align="center">Taschenspielplatz</h1>

<p align="center">
  <strong>Spielen ohne Spielregeln.</strong><br>
  An interactive miniature city for toddlers. No scores, no levels, no rules.<br>
  Just tiny cars on tiny roads.
</p>

<p align="center">
  <a href="https://harryherbig.github.io/taschenspielplatz/">Play now</a>
</p>

---

## What is this?

A pocket-sized playground for kids aged 2-5. Hand them your phone and they'll steer colorful cars through a little town by tapping where they want to go. That's it. No tutorial, no fail state, no grown-up complexity.

Built for the in-between moments: car rides, restaurants, waiting rooms. The playground for when the real one is too far away.

## How it works

- **Tap a car** to select it (it glows)
- **Tap the road** to drive there
- **Drag** to pan around the world
- **Pinch** to zoom in and out
- **Day/night toggle** in the corner

5 cars with different colors and speeds. The active car pathfinds along the road network. Switch between them anytime.

## Design decisions

**No sound.** The app is played in cars and restaurants. Parents hand it over without worry. The kid makes the engine noises themselves.

**No text.** The target audience can't read. Everything is communicated through interaction.

**No gamification.** No points, no stars, no streaks, no quests. The app wants nothing from the child. It's a reactive stage where the child decides what happens.

**Single file.** One `index.html`, no build step, no framework, no dependencies. Open it in a browser and it works.

## Tech

- Canvas 2D rendering with viewport clipping (only visible tiles are drawn)
- Tile-based 20x20 grid with directional road connectivity
- BFS pathfinding on the road network
- Pointer Events API for unified touch/mouse handling
- Hue-rotated car sprites via offscreen canvas
- Per-vehicle animation: smoothstep interpolation, body tilt on curves, squash/stretch on start/stop
- Soft camera follow with user-override detection
- localStorage persistence (vehicle positions, active car, day/night, viewport)

The world is a pure data object, separated from the renderer. Future editors, generators, or JSON files can produce the world — the renderer just draws whatever it gets.

## Assets

Hand-crafted tile sprites: grass, straight road, curved road, T-junction, and 4-way crossroad. One car sprite, recolored at runtime via CSS `hue-rotate()` filter.

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
