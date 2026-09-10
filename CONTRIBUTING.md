# Contributing to Flyway Surfer

Thanks for helping the fly survive.

## Get started

1. Fork and clone the repository.
2. Use Node.js 20 or later.
3. Run `npm start` and open http://127.0.0.1:4173.
4. Edit the files in `dist/`. There is no build or package installation step.
5. Run `npm test` before opening a pull request.

## Keep changes focused

Describe the problem, the resulting behavior, and how you checked the change. Include reproduction steps for bugs. For visual or gameplay changes, include a screenshot or a short clip when practical.

Preserve keyboard and touch controls, pause behavior, and the fly-and-swatter premise. Update documentation when controls or game rules change. Use plain language without em dashes in project-authored copy.

## Circuit and data changes

Keep the distinction between recorded connectivity, simulated activity, and hand-designed game behavior explicit. Do not describe the current model as a whole-brain simulation or a trained agent.

If you change the graph, update `dist/data/provenance.json`, its counts, source revision, transformation notes, and license attribution. If you change the model or decoder, update the explanation in `dist/credits.html` and README and run the relevant circuit and pilot checks.

Keep third-party license notices intact. Original contributions use this repository's MIT License; third-party material retains its own license and attribution.

## Hosting

The live demo is hosted separately. A pull request or GitHub push does not publish a new version of that demo. Use your own hosting configuration for a fork.
