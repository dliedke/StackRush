# Stack Rush

Browser-based arcade game available on GitHub Pages or hosted locally by a small ASP.NET Core application.

## Play online

- [Play Stack Rush](https://dliedke.github.io/StackRush/dist/)
- [Direct game page](https://dliedke.github.io/StackRush/dist/index.html)

GitHub Pages publishes the `main` branch from `/ (root)`. The game lives in
`dist/index.html`, so the game URL includes `/dist/`. The online version serves
the static game files directly and does not require the ASP.NET Core host.

## Visual Studio 2026

Install the **ASP.NET and web development** workload and the **.NET 10 SDK**.
Open `StackRush.sln`, select the `StackRush` launch profile, and press **F5**
(or **Ctrl+F5** without debugging). The browser opens at `http://localhost:5180`.

## Project organization

- `StackRush.sln` / `StackRush.csproj`: Visual Studio solution and web project.
- `Program.cs`: HTTP host, default page, and static file configuration.
- `Properties/launchSettings.json`: local launch and browser settings.
- `dist/index.html`: game page.
- `dist/style.css`: layout and styling.
- `dist/app.mjs`: browser UI and input handling.
- `dist/engine.mjs`: game rules and state.
- `dist/i18n.mjs`: Portuguese and English translations.
- `dist/audio.mjs` / `dist/tracks.mjs`: audio and music.
- `dist/fireworks.mjs` / `dist/power-fx.mjs`: visual effects.
- `dist/assets/`: mascot images.
- `tests/`: Node.js tests for translations and related game behavior.

The existing `dist` directory is the editable web source and web root; it is
included in builds and publishes. No JavaScript bundling or npm install is needed.

## Command line

```powershell
dotnet build StackRush.sln -c Release
dotnet run --project StackRush.csproj
node --test tests/*.test.mjs
dotnet publish StackRush.csproj -c Release
```

Node.js is needed only for tests (`npm test` runs the same suite). These are
Node.js tests, so run them in the terminal rather than .NET Test Explorer.
To run published output, change into `bin/Release/net10.0/publish` and run
`dotnet StackRush.dll --urls http://localhost:5180`.

Static file hosting follows the
[ASP.NET Core documentation](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/static-files?view=aspnetcore-10.0).
