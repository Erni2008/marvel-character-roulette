# Local character catalog

1. Put your own licensed full-body transparent PNG under `public/characters/`, for example `my-character.png`. No external URLs or downloads are used.
2. Edit `public/characters/manifest.json`:

```json
[
  { "id": "local-001", "name": "Your configurable display name", "nameRu": "Имя по-русски", "imagePath": "/characters/my-character.png", "enabled": true },
  { "id": "placeholder-001", "name": "CHAMPION 001", "imagePath": "", "enabled": true }
]
```

IDs must be unique. At least one entry must be enabled. Use simple Latin filenames with `.png`; subdirectories under `/characters/` are supported. `enabled: false` removes an entry from random selection. The included starter catalog has 40 text-only names. `name` is the English/default answer; optional `nameRu` is shown in Russian mode, with `name` as a fallback. The large gameplay answer plate uses the same selected entry, so spelling can be checked manually. An empty imagePath produces the intentional neutral silhouette/question-mark placeholder. Broken images also fall back safely.

3. Run `npm run build`, deploy the new `dist/client/` and accept the PWA update.

The vertical image stage uses `object-fit: contain`, centered alignment and internal padding; it never uses `cover` for characters. Different PNG sizes and aspect ratios are supported without cropping heads/feet. Keep transparent canvas padding modest and optimize PNG file size before publishing. The entire character name remains visible to participants/viewers. The guesser must look away.

The catalog itself is in the offline shell. PNG images use a bounded same-origin cache (40 previously viewed files); unseen images need a first online visit. Replacing an existing PNG should use a new filename when immediate cache invalidation is required.

Card shuffle presentation is independent of the selected entry. Editing a name or adding PNG artwork does not affect the deterministic trajectory or random selection logic.
