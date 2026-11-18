"""Export only this app's legacy Flutter preferences for local PWA import.

The output is Git-ignored and is never included in the hosted static application.
"""
import json
import plistlib
from pathlib import Path

app_id = 'com.erni.marvelCharacterRoulette'
preferences = Path.home() / 'Library' / 'Containers' / app_id / 'Data/Library/Preferences' / f'{app_id}.plist'
if not preferences.exists():
    raise SystemExit('No saved Flutter preferences were found. The PWA already uses the original defaults.')
with preferences.open('rb') as source:
    data = plistlib.load(source)
raw = data.get('flutter.settings.v1', data.get('settings.v1'))
if raw is None:
    raise SystemExit('The original app has no saved settings. Use the matching defaults in the PWA.')
settings = json.loads(raw) if isinstance(raw, str) else raw
if isinstance(settings, str):
    settings = json.loads(settings)
if not isinstance(settings, dict):
    raise SystemExit('Saved preferences were not in the expected format.')
target = Path(__file__).resolve().parents[1] / 'legacy-settings.export.json'
target.write_text(json.dumps(settings, ensure_ascii=False, indent=2) + '\n')
print(f'Local export saved to {target}. Import it in Settings → Import. Do not publish this file.')
