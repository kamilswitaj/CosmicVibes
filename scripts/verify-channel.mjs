import fs from 'node:fs';
const d=JSON.parse(fs.readFileSync('catalog/youtube-discography.json'));const n=JSON.parse(fs.readFileSync('catalog/new-wave.json'));
if(d.playlists.length!==24||n.length!==10)throw Error('Count mismatch');
for(const p of d.playlists)for(const t of p.tracks)if(!t.title||!t.id||t.description===null)throw Error('Missing source');
const html=fs.readFileSync('index.html','utf8');for(const m of html.matchAll(/src="(assets\/playlists\/[^"]+)"/g))if(!fs.existsSync(m[1]))throw Error('Missing cover: '+m[1]);
for(const s of n){for(const section of ['Verse 1','Pre-Chorus','Chorus','Verse 2','Bridge','Final Chorus'])if(!s.lyrics.includes('['+section+']'))throw Error('Missing section');}
console.log('Verified: 24 playlists, source descriptions, 10 complete drafts, local playlist covers.');
