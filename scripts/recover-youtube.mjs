import fs from 'node:fs';
export function parseYouTube(source){
const match=source.match(/var ytInitialData = (.*?);<\/script>/s);
if(!match)throw Error('YouTube data missing');
let raw=match[1];
if(raw.startsWith("'"))raw=raw.slice(1,-1).replace(/\\x([0-9a-f]{2})|\\u([0-9a-f]{4})|\\(.)/gi,(_,h,u,c)=>h?String.fromCharCode(parseInt(h,16)):u?String.fromCharCode(parseInt(u,16)):({n:'\n',r:'\r',t:'\t'}[c]??c));
const data=JSON.parse(raw);const playlists=[];const videos=[];
function walk(x){if(!x||typeof x!=='object')return;const p=x.compactPlaylistRenderer||x.playlistRenderer;if(p)playlists.push({id:p.playlistId,title:p.title?.simpleText||p.title?.runs?.map(r=>r.text).join(''),count:p.videoCountShortText?.simpleText||p.videoCountText?.runs?.map(r=>r.text).join(''),url:'https://www.youtube.com/playlist?list='+p.playlistId});const lock=x.lockupViewModel;if(lock?.contentType==="LOCKUP_CONTENT_TYPE_VIDEO")videos.push({id:lock.contentId,title:lock.metadata?.lockupMetadataViewModel?.title?.content,url:"https://www.youtube.com/watch?v="+lock.contentId});const v=x.playlistVideoRenderer||x.videoRenderer||x.compactVideoRenderer;if(v)videos.push({id:v.videoId,title:v.title?.runs?.map(r=>r.text).join(''),url:'https://www.youtube.com/watch?v='+v.videoId});Object.values(x).forEach(v=>typeof v==='object'&&walk(v));}
walk(data);return {playlists,videos};}
if(process.argv[1]?.endsWith('recover-youtube.mjs')){const result=parseYouTube(fs.readFileSync(process.argv[2],'utf8'));fs.mkdirSync('catalog',{recursive:true});fs.writeFileSync('catalog/youtube-discovery.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));}
