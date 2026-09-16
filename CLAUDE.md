# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

Stack Rush is a browser block-stacking arcade game (Rush / Sprint 40 / Zen modes, power pieces,
bombs, rescuable buddies, generated arcade music). It is plain ES modules with no bundler and no
npm dependencies. A minimal ASP.NET Core (.NET 10) host serves it locally; GitHub Pages serves it
online from `main` at `https://dliedke.github.io/StackRush/dist/`.

## Commands

```powershell
dotnet run --project StackRush.csproj     # local host at http://localhost:5180 (also: npm start)
node --test tests/*.test.mjs              # tests (also: npm test)
dotnet build StackRush.sln -c Release
dotnet publish StackRush.csproj -c Release
```

Tests are Node.js `node:test` tests, not .NET tests. There is no lint or build step for the game.

## Layout

- `dist/` is both the **editable source** and the **web root**. It must stay tracked in git and
  must not be treated as build output. The `.csproj` copies it into build/publish output.
- `dist/engine.mjs`: pure game logic (`Game` class, `SHAPES`, `COLORS`, `MODES`, `POWERS`,
  `BUDDIES`, `BUDDY_POWERS`, SRS kick tables). No DOM access. Tests import it directly.
- `dist/app.mjs`: DOM, canvas rendering, input (keyboard + touch), records, UI wiring.
- `dist/i18n.mjs`: translation layer. `dist/audio.mjs` + `dist/tracks.mjs`: Web Audio music/SFX.
- `dist/fireworks.mjs`, `dist/power-fx.mjs`: canvas visual effects.
- `dist/assets/`: mascot sprite sheets. `docs/`: README images only (not served by the game).
- `Program.cs`: sets `WebRootPath = "dist"` and maps `.mjs` to `text/javascript` (required for
  ES modules to load). Keep it minimal.

## Conventions

- **Portuguese is the source language.** All user-facing strings in `index.html`, `app.mjs` and
  `engine.mjs` are written in Portuguese (pt-BR). English lives only in the `english` map in
  `i18n.mjs`, keyed by the exact Portuguese string. When adding or changing any visible text,
  aria-label, or title, add/update the matching `['Português','English']` pair.
- `t()` also handles `{placeholder}` patterns and compound strings joined by `' · '`, `'  |  '` and
  `', '`, so translate the individual pieces rather than every combination.
- `tests/i18n.test.mjs` checks that all static Portuguese text has a translation and that
  switching language live is lossless. Run tests after touching any text.
- Code style is compact: short lines are often joined, minimal comments, 2-space indentation,
  single quotes. Match the surrounding density rather than reformatting.
- Keep modules dependency-free and loadable directly by the browser (relative `./x.mjs` imports).
- `Program.cs` carries a Daniel Liedke copyright header; preserve it.
