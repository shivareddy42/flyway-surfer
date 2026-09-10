# Third-party notices

The root MIT license covers original Flyway Surfer code and documentation. It does not replace the licenses on the dataset or files in `dist/vendor/`.

## MaleCNS circuit data

- Bundled file: [`dist/data/flight-v1.json`](dist/data/flight-v1.json).
- Dataset: MaleCNS v1.0, 1,072 selected neurons and 26,544 directed edges.
- License: [Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/).
- Credit: Berg et al.; FlyEM at HHMI Janelia, University of Cambridge, MRC Laboratory of Molecular Biology, and Google Research.
- Prepared subset: `flight-v1` by [AbijahKaj](https://github.com/AbijahKaj/fruit-fly-brain-research).
- [Official dataset downloads](https://male-cns.janelia.org/download/).
- [Pinned prepared graph](https://github.com/AbijahKaj/fruit-fly-brain-research/blob/f84d061c3c220c9b0da20dcc486f3864ce0832d8/app/public/graphs/flight-v1.json).

The prepared graph is retained unchanged apart from an added final newline. The runtime derives normalized signed weights without modifying the bundled data. The game-specific sensors, simplified neuron model, schematic display, and action decoder are adaptations created for this project. The data providers have not endorsed the game.

The [provenance record](dist/data/provenance.json) includes the extraction parameters, source commit, and source Git blob hash.

## Three.js

Three.js 0.180.0 is bundled as `dist/vendor/three.module.js` and `dist/vendor/three.core.js` under the MIT License.

The [bundled Three.js license](dist/vendor/THREE-LICENSE.txt) contains the original copyright and license terms. Project source: [mrdoob/three.js](https://github.com/mrdoob/three.js).

## Fonts

The self-hosted fonts use the SIL Open Font License 1.1. Original notices and font-author credits are retained in these files:

| Font family | License notice |
| --- | --- |
| Barlow Condensed | [barlowcondensed-OFL.txt](dist/vendor/barlowcondensed-OFL.txt) |
| DM Sans | [dmsans-OFL.txt](dist/vendor/dmsans-OFL.txt) |
| Space Mono | [spacemono-OFL.txt](dist/vendor/spacemono-OFL.txt) |

[`dist/vendor/fonts.css`](dist/vendor/fonts.css) maps the bundled font files to these families. The fonts were obtained from Google Fonts.
