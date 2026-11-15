import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const catalog=JSON.parse(fs.readFileSync(path.join(root,'assets/suno-catalog.json'),'utf8'));
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
function links(slug){const tracks=catalog[slug];if(!tracks?.length)return '';return `<details class="suno-versions"><summary>Posłuchaj w Suno · ${tracks.length} wersji</summary><p class="suno-access">Nagrania prywatne · dostęp może wymagać konta właściciela.</p><ol>${tracks.map((t,i)=>{const seconds=Math.round(t.duration);const duration=`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;return `<li><a href="${escape(t.url)}" target="_blank" rel="noopener noreferrer"><span>${escape(t.title)} · ${i+1}</span><small>${duration} ↗</small></a></li>`;}).join('')}</ol></details>`;}
for(const [slug] of Object.entries(catalog)){const file=path.join(root,'songs',slug,'index.html');let html=fs.readFileSync(file,'utf8');html=html.replace('              <section class="notes">',links(slug)+'\n              <section class="notes">');fs.writeFileSync(file,html);}
for(const relative of ['index.html','songs/index.html']){const file=path.join(root,relative);let html=fs.readFileSync(file,'utf8');html=html.replace(/<article class="song-card">[\s\S]*?<\/article>/g,card=>{const slug=card.match(/<h3><a href="[^"]*?([^/"\s]+)\/">/)?.[1];return card.replace('</article>',links(slug)+'</article>');});fs.writeFileSync(file,html);}
console.log(`Linked ${Object.keys(catalog).length} songs, ${Object.values(catalog).flat().length} recordings.`);
