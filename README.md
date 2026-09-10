# Flyway Surfer

A 3D kitchen-counter endless runner: a fly is the runner and a giant pink flyswatter is the pursuer. Watch the experimental circuit pilot, or take over using arrows/WASD, Space, swipes, or touch controls.

## Run locally

Requires Node.js 20 or later. No package installation or build step is required.

```sh
npm start
```

Open the local address printed by the server. For checks, run `npm test`.

## How the pilot works

The bundled graph contains 1,072 neurons and 26,544 edges from the MaleCNS v1.0 dataset, prepared as the `flight-v1` subset by AbijahKaj. The simulator computes continuous bounded rates across real recorded connectivity. Artificial lane-threat inputs stimulate LC4/LPLC2 neurons; left/right DNp outputs influence lane changes. Hand-coded arcade reflexes jump and duck. Sugar attraction and track boundaries are artificial sensors. There is no learning and no whole-brain claim.

The sidebar displays the running model's dimensionless activity. The node layout is schematic, because the subset has no anatomical coordinates. Data credits and full provenance are bundled in `dist/credits.html` and `dist/data/provenance.json`.

## Project layout

- `dist/core.js`: deterministic obstacle generation, controls, collision, sugar, pursuit, and run state.
- `dist/pilot.js`: simplified signed recurrent rate model, sensor encoding, action decoder.
- `dist/scene.js`: Three.js kitchen, fly, swatter, obstacles, animation, and effects.
- `dist/main.js`: UI, lifecycle, input, sound, and live circuit display.
- `dist/style.css`: responsive game presentation.
- `tests/core.test.mjs`: meaningful gameplay and circuit checks.

Three mistakes end a run. Fifteen clean seconds recover one pursuit stage. Every obstacle row has an open lane. The difficulty accelerates gradually. Best distance and sound preference are browser-local only.

The project is a buildless static site, with vendored rendering code and dataset. WebGL 2 is required. No API keys or server-side inference are needed.
