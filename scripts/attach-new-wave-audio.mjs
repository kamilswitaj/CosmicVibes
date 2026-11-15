import fs from 'node:fs';
const audio=JSON.parse(fs.readFileSync('catalog/new-wave-audio.json'));
const generations=JSON.parse(fs.readFileSync('catalog/new-wave-generations.json'));
const songs=JSON.parse(fs.readFileSync('catalog/new-wave.json'));
let html=fs.readFileSync('nowa-fala.html','utf8');
html=html.replace(/<div class="actions generated-audio">[\s\S]*?<\/div>/g,'');
for(const song of songs){const ids=generations.find(g=>g.slug===song.slug)?.clip_ids??[];song.sunoRecordings=ids.map(id=>audio.find(a=>a.id===id)).filter(Boolean);song.generationStatus=song.sunoRecordings.every(a=>a.status==='complete')?'Complete':'Playable';song.status='AudioGenerated';fs.writeFileSync('content/songs/'+song.slug+'/song.json',JSON.stringify(song,null,2));const links='<div class="actions generated-audio">'+song.sunoRecordings.map((a,i)=>`<a class="button ${i?'button--ghost':''}" href="${a.url}" target="_blank" rel="noopener noreferrer">Słuchaj w Suno · wersja ${i?'B':'A'} ↗</a>`).join('')+'</div>';const marker=`id="${song.slug}">`;html=html.replace(marker,marker+links);}
html=html.replace('10 NOWYCH PERSPEKTYW · W PRZYGOTOWANIU','10 UTWORÓW · 20 WYKONAŃ W SUNO').replaceAll('SZKIC DO ODSŁUCHU','PIERWSZE WYKONANIA W SUNO').replace('Teksty i prompty do pierwszych prób w Suno.','Wybierz wersję A lub B i posłuchaj pierwszych wykonań w Suno.');
fs.writeFileSync('nowa-fala.html',html);fs.writeFileSync('catalog/new-wave.json',JSON.stringify(songs,null,2));
console.log('Attached '+audio.length+' playable Suno recordings.');
