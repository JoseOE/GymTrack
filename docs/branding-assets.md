# Branding assets for GymTrack

GymTrack 0.1.1 keeps the current working Expo assets until the definitive brand files are supplied. Replacing them must not require application-logic changes.

## Expected definitive files

Place the following PNG files in `assets/images/`:

| File | Recommended canvas | Purpose |
| --- | --- | --- |
| `gymtrack-icon.png` | 1024 × 1024 px | Main iOS/Android icon and centered splash artwork |
| `gymtrack-adaptive-foreground.png` | 1024 × 1024 px, transparent | Android adaptive-icon foreground; keep the mark inside the platform safe area |
| `gymtrack-adaptive-background.png` | 1024 × 1024 px, opaque | Android adaptive-icon background |
| `gymtrack-monochrome.png` | 432 × 432 px, transparent, single-color silhouette | Android themed/monochrome icon |

Use lossless PNG, sRGB color, and no embedded credentials or user data. A separate 48 × 48 px or larger square favicon may be exported from the approved mark for web.

## Integration checklist

After the approved files exist, update only the asset paths in `app.json`:

- `expo.icon` and the splash image → `gymtrack-icon.png`;
- `android.adaptiveIcon.foregroundImage` → `gymtrack-adaptive-foreground.png`;
- `android.adaptiveIcon.backgroundImage` → `gymtrack-adaptive-background.png`;
- `android.adaptiveIcon.monochromeImage` → `gymtrack-monochrome.png`.

Keep the splash `backgroundColor` as `#000000`. Do not change `android.package`, `scheme`, `owner`, or `extra.eas.projectId` as part of an asset replacement. Run `npx expo export --platform android` and inspect the adaptive icon, themed icon, splash, and small launcher rendering on Android before release.

Current status: **branding pending definitive assets**. The existing files remain referenced so builds continue to work.
