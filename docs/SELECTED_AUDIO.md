# Wybrane nagrania

Manifest: `catalog/selected-masters.json`.

Wybór zatwierdzony 16 listopada 2026: CV-055–CV-064 w wersji B,
pozostałe zatwierdzone utwory w wersji A. Limit pobrania: 27 WAV-ów.
Pięć utworów ma status `PendingCredits`: CV-051, CV-019, CV-020,
CV-021 i CV-022. Nie pobierać ich bez nowej zgody.

- Oryginały lokalne: `media/songs/<id>/<id>__<wersja>.wav` (poza Git).
- Odsłuchy strony: `assets/audio/<id>__<wersja>.mp3`, 192 kb/s.
- Publiczne WAV-y: zasoby wydania GitHub wskazane przez `wavUrl`.
- Strona odsłuchowa: `nowa-fala.html`.

Po zmianie manifestu:

```powershell
node scripts/render-auditions.mjs
node scripts/render-selected-audio.mjs
node scripts/verify-channel.mjs
node scripts/verify-selected-audio.mjs
```

`scripts/import-selected-master.ps1` zapisuje WAV z zatwierdzonego linku
pobrania Suno i tworzy MP3 przez FFmpeg. Nie zapisujemy czasowych,
podpisanych linków w repozytorium. Importy uruchamiamy pojedynczo.

`scripts/publish-selected-wavs.ps1` wysyła pobrane oryginały jako zasoby
wydania `selected-masters-2026-11-16`, wykorzystując lokalne poświadczenie
GitHub. Istniejące zasoby o zgodnym rozmiarze są używane ponownie.
Nie uruchamiać publikacji równocześnie z importem: oba polecenia
aktualizują manifest.

Publikacja tych plików na stronie nie publikuje utworów na YouTube.
