import fs from 'node:fs';
import {parseYouTube} from './recover-youtube.mjs';
const {playlists}=JSON.parse(fs.readFileSync('catalog/youtube-discovery.json'));
const results=[];
for(let i=0;i<playlists.length;i+=4){await Promise.all(playlists.slice(i,i+4).map(async p=>{try{const response=await fetch(p.url+'&hl=en',{headers:{Cookie:'CONSENT=YES+cb.20210328-17-p0.en+FX+667; SOCS=CAI','User-Agent':'Mozilla/5.0'}});const d=parseYouTube(await response.text());results.push({...p,tracks:d.videos});console.log(p.title+': '+d.videos.length);}catch(e){results.push({...p,tracks:[],error:e.message});console.log(p.title+': '+e.message);}}));}
fs.writeFileSync('catalog/youtube-discography.json',JSON.stringify({retrievedAt:'2026-11-15',playlists:results},null,2));
