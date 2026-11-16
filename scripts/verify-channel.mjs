import fs from 'node:fs';
const d=JSON.parse(fs.readFileSync('catalog/youtube-discography.json'));const n=JSON.parse(fs.readFileSync('catalog/new-wave.json'));
const selection=JSON.parse(fs.readFileSync('catalog/selection-decisions.json'));const batch=JSON.parse(fs.readFileSync('catalog/'+selection.currentBatch+'.json'));
if(d.playlists.length!==24||n.length!==new Set([...selection.kept,...batch.map(s=>s.ideaId)]).size)throw Error('Count mismatch');
for(const p of d.playlists)for(const t of p.tracks)if(!t.title||!t.id||t.description===null)throw Error('Missing source');
const html=fs.readFileSync('index.html','utf8');for(const m of html.matchAll(/src="(assets\/playlists\/[^"]+)"/g))if(!fs.existsSync(m[1]))throw Error('Missing cover: '+m[1]);
for(const s of n){for(const section of ['Verse 1','Chorus','Verse 2','Bridge','Final Chorus'])if(!s.lyrics.includes('['+section+']'))throw Error('Missing section');}
const auditions=fs.readFileSync('nowa-fala.html','utf8');
for(const s of n){if(!auditions.includes('data-id="'+s.ideaId+'"'))throw Error('Missing checkbox');for(const a of s.sunoRecordings??[])if(!auditions.includes(a.url))throw Error('Missing audio link');}
const decisions=JSON.parse(fs.readFileSync('catalog/selection-decisions.json'));for(const id of decisions.rejected)if(n.some(s=>s.ideaId===id))throw Error('Rejected song in catalogue');
console.log('Verified: 24 playlists, '+n.length+' audition titles, checkboxes, audio links and rejected-song exclusions.');
