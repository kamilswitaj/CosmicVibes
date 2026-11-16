import fs from 'node:fs';
import assert from 'node:assert/strict';

const tracks = JSON.parse(fs.readFileSync('catalog/selected-masters.json', 'utf8'));
const songs = JSON.parse(fs.readFileSync('catalog/new-wave.json', 'utf8'));
const html = fs.readFileSync('nowa-fala.html', 'utf8');
const downloaded = tracks.filter(t => t.downloadStatus === 'Downloaded');
assert.equal(new Set(tracks.map(t => t.ideaId)).size, tracks.length);
for (const track of tracks) {
  const song = songs.find(s => s.ideaId === track.ideaId);
  assert.ok(song, track.ideaId);
  assert.equal(song.selectedClipId, track.clipId);
  assert.equal(song.selectedVersion, track.version);
  if (track.downloadStatus !== 'Downloaded') continue;
  assert.ok(fs.statSync(track.previewPath).size > 1000, track.ideaId);
  assert.equal(song.audioPreview, track.previewPath);
  assert.ok(html.includes(`src="${track.previewPath}"`), track.ideaId);
  assert.match(track.wavUrl, /^https:\/\/github\.com\/kamilswitaj\/CosmicVibes\/releases\/download\//);
  assert.equal(song.wavDownloadUrl, track.wavUrl);
  assert.ok(html.includes(`href="${track.wavUrl}"`), track.ideaId);
  if (fs.existsSync(track.localWavPath)) {
    const fd = fs.openSync(track.localWavPath, 'r');
    const header = Buffer.alloc(12);
    try { assert.equal(fs.readSync(fd, header, 0, 12, 0), 12); }
    finally { fs.closeSync(fd); }
    assert.ok(['RIFF', 'RF64'].includes(header.toString('ascii', 0, 4)));
    assert.equal(header.toString('ascii', 8, 12), 'WAVE');
    assert.equal(fs.statSync(track.localWavPath).size, track.wavBytes);
  }
}
assert.equal([...html.matchAll(/<audio controls preload="none"/g)].length, downloaded.length);
console.log(`Verified ${downloaded.length} selected players and WAV links; ${tracks.length - downloaded.length} pending.`);
