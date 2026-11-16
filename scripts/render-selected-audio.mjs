import fs from 'node:fs';
const path='catalog/selected-masters.json';if(!fs.existsSync(path))process.exit(0);
const tracks=JSON.parse(fs.readFileSync(path));
let html=fs.readFileSync('nowa-fala.html','utf8').replace(/<div class="selected-audio">[\s\S]*?<\/div>/g,'');
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
const songs=JSON.parse(fs.readFileSync('catalog/new-wave.json'));
for(const track of tracks){const song=songs.find(s=>s.ideaId===track.ideaId);if(!song)continue;song.selectedVersion=track.version;song.selectedClipId=track.clipId;song.audioPreview=track.previewPath??'';song.wavDownloadUrl=track.wavUrl??'';fs.writeFileSync('content/songs/'+song.slug+'/song.json',JSON.stringify(song,null,2));
const player=track.previewPath&&fs.existsSync(track.previewPath)?`<audio controls preload="none" aria-label="${escape(track.title)} — wersja ${track.version}"><source src="${escape(track.previewPath)}" type="audio/mpeg"></audio>`:'';
const download=track.wavUrl?`<a class="button button--ghost" href="${escape(track.wavUrl)}" download>Pobierz WAV ↧</a>`:'';
const block=`<div class="selected-audio"><p class="eyebrow">WYBRANA WERSJA ${track.version}</p>${player}${download}</div>`;
html=html.replace(`id="${track.slug}">`,`id="${track.slug}">`+block);}
fs.writeFileSync('nowa-fala.html',html);fs.writeFileSync('catalog/new-wave.json',JSON.stringify(songs,null,2));
console.log('Selected versions attached: '+tracks.length);
