# Flyway Surfer 🪰

Tiny fly. Giant swatter. Three lanes to survive.

A 3D endless runner through a colorful city rail yard, with a fly as the runner and a pink flyswatter on its tail. Watch an experimental fly-circuit pilot dodge trains, collect sugar, and try to stay alive, or take the controls yourself.

**[Play in your browser](https://flyway-surfer.lightningshiva1.chatgpt.site)** · **[Watch the launch clip](https://x.com/LightningShiva1/status/2098099796925902930)** · **[Model and credits](https://flyway-surfer.lightningshiva1.chatgpt.site/credits.html)**

## What is in here?

- Three lanes of trains, jump barriers, and duck obstacles, surrounded by stations, city blocks, and a scrolling skyline.
- An animated fly runner and a pursuing flyswatter that gets closer when you make mistakes.
- A circuit pilot using a real-connectivity subset of the MaleCNS fly nervous system, with live activity displayed alongside the game.
- Manual play with keyboard, swipes, and touch buttons.
- Increasing speed, sugar pickups, local best distance, pause controls, and optional synthesized sound.
- A self-contained static app with bundled rendering code, fonts, and graph data. No API keys, package installation, or remote inference required.

Flyway Surfer is an original project inspired by the three-lane endless-runner format of Subway Surfers. It is not affiliated with Subway Surfers and does not use its game assets.

## Run locally

You need Node.js 20 or later and a browser with WebGL 2 support.

```sh
git clone https://github.com/shivareddy42/flyway-surfer.git
cd flyway-surfer
npm start
```

Open **http://127.0.0.1:4173**. Stop the server with `Ctrl+C`.

There is no build step and no `npm install` step. The files in `dist/` are the editable application source and the files served to the browser. Use the local server instead of opening `index.html` directly, because the app loads JavaScript modules and graph data.

## How to play

Choose **Watch the fly** for the circuit pilot or **Take control** for manual play, then select **Release the fly**. You can switch modes during a run. Using a movement key or touch control also takes over from the pilot.

| Action | Keyboard | Touch |
| --- | --- | --- |
| Move left | Left arrow or A | Swipe left or left button |
| Move right | Right arrow or D | Swipe right or right button |
| Jump | Up arrow, W, or Space | Swipe up or jump button |
| Duck | Down arrow or S | Swipe down or duck button |
| Pause or resume | P or Escape | Pause or resume button |
| Toggle sound | Sound button | Sound button |

Collect sugar and keep your distance from the swatter. Three mistakes end a run. Fifteen clean seconds recover one pursuit stage. Every obstacle row has an open lane, and the game gradually speeds up. The game pauses when its browser tab becomes hidden.

## What does the fly brain actually do?

The bundled `flight-v1` graph contains **1,072 neurons and 26,544 directed edges** from **MaleCNS v1.0**, prepared as a subset by [AbijahKaj](https://github.com/AbijahKaj/fruit-fly-brain-research). All 1,072 nodes participate in the simulation.

The controller combines recorded connectivity with a simplified mathematical model and game-specific rules:

1. Obstacles, sugar, and track boundaries become artificial left/right sensory inputs.
2. Those inputs stimulate selected LC4 and LPLC2 neurons.
3. A signed recurrent rate model updates activity across the fixed graph.
4. Left/right descending-neuron output is decoded into steering decisions.
5. Separate hand-coded arcade reflexes handle jumping and ducking.

**This is a small circuit experiment, not a complete fly brain or a fly that learned to play.** The connections stay fixed. There is no learning, reward training, or biological spike simulation. The activity values are dimensionless model outputs, not recordings from a living fly.

The sidebar uses a schematic layout because this subset does not include anatomical coordinates. Brightness reflects computed activity. In manual mode, the circuit keeps receiving observations while the player controls the fly.

See the [model explanation](dist/credits.html), [data provenance](dist/data/provenance.json), and [third-party notices](THIRD_PARTY_NOTICES.md) for the model parameters, sources, and attribution.

## Tests

```sh
npm test
```

The checks cover deterministic generation, controls, collisions along full train lengths, pursuit recovery, bounded neural activity, directional circuit response, and a seeded pilot run. They also check train geometry, scenery looping, local asset references, and UI element IDs. These are code and geometry checks, not browser rendering tests.

GitHub Actions runs the same command on pushes and pull requests.

## Project map

| File | Purpose |
| --- | --- |
| `dist/index.html` | Game interface, start screen, circuit panel, and dialogs |
| `dist/style.css` | Responsive layout and visual theme |
| `dist/main.js` | Game loop, interface, input, sound, and circuit visualization |
| `dist/core.js` | Seeded generation, movement, collisions, scoring, and pursuit |
| `dist/pilot.js` | Sensory encoding, rate model, and action decoder |
| `dist/scene.js` | Fly, swatter, camera, animation, and effects |
| `dist/railway.js` | Tracks, city, stations, trains, and barriers |
| `dist/data/` | Bundled circuit graph and provenance |
| `dist/vendor/` | Three.js, fonts, and their license notices |
| `dist/credits.html` | In-game model explanation and credits |
| `server.mjs` | Local static server |
| `tests/` | Core, railway geometry, and asset checks; `run.mjs` runs them together |

## Hosting and privacy

Serve the contents of `dist/` from any static web host. No backend or environment variables are required. The included `.openai/hosting.json` connects the original project to its existing Sites deployment. When hosting your own fork, use your own hosting configuration.

The game stores best distance and sound preference in browser local storage. It implements no analytics or gameplay uploads. Rendering, graph simulation, and synthesized audio run in the browser.

## Contributing

Bug reports and focused improvements are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for local checks and guidance on changes to the circuit model.

## License and credits

Original game code and documentation are available under the [MIT License](LICENSE).

Third-party materials retain their own licenses:

- **MaleCNS graph data:** CC BY 4.0. Credit to Berg et al.; FlyEM at HHMI Janelia, University of Cambridge, MRC Laboratory of Molecular Biology, and Google Research. Prepared `flight-v1` subset by AbijahKaj.
- **Three.js 0.180.0:** MIT.
- **Barlow Condensed, DM Sans, and Space Mono:** SIL Open Font License 1.1.

See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for the bundled notices and pinned sources.

Created by [Shiva](https://github.com/shivareddy42). Follow the fly at [@LightningShiva1](https://x.com/LightningShiva1).
