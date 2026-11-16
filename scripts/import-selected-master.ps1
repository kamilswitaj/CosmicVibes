param(
    [Parameter(Mandatory=$true)][string]$IdeaId,
    [Parameter(Mandatory=$true)][string]$DownloadUrl
)
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$manifestPath = Join-Path $root 'catalog/selected-masters.json'
$tracks = @(Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json)
$track = $tracks | Where-Object ideaId -eq $IdeaId
if ($null -eq $track) { throw 'Unknown selected master' }
$name = $track.ideaId.ToLowerInvariant() + '__' + $track.version.ToLowerInvariant()
$directory = Join-Path $root ('media/songs/' + $track.ideaId.ToLowerInvariant())
$previewDirectory = Join-Path $root 'assets/audio'
New-Item -ItemType Directory -Path $directory,$previewDirectory -Force | Out-Null
$wav = Join-Path $directory ($name + '.wav')
if (-not (Test-Path -LiteralPath $wav)) {
    $partial = $wav + '.download'
    Invoke-WebRequest -Uri $DownloadUrl -OutFile $partial
    $stream = [IO.File]::OpenRead($partial)
    try {
        $header = New-Object byte[] 12
        $count = $stream.Read($header,0,12)
        if ($count -ne 12 -or [Text.Encoding]::ASCII.GetString($header,0,4) -notin @('RIFF','RF64') -or [Text.Encoding]::ASCII.GetString($header,8,4) -ne 'WAVE') { throw 'Download is not a WAV file' }
    } finally { $stream.Dispose() }
    Move-Item -LiteralPath $partial -Destination $wav
}
$preview = Join-Path $previewDirectory ($name + '.mp3')
if (-not (Test-Path -LiteralPath $preview)) {
    & ffmpeg -hide_banner -loglevel error -nostdin -i $wav -map_metadata -1 -codec:a libmp3lame -b:a 192k -y $preview
    if ($LASTEXITCODE -ne 0) { throw 'FFmpeg failed' }
}
$track | Add-Member -NotePropertyName localWavPath -NotePropertyValue ('media/songs/' + $track.ideaId.ToLowerInvariant() + '/' + $name + '.wav') -Force
$track | Add-Member -NotePropertyName previewPath -NotePropertyValue ('assets/audio/' + $name + '.mp3') -Force
$track | Add-Member -NotePropertyName downloadStatus -NotePropertyValue 'Downloaded' -Force
$track | Add-Member -NotePropertyName wavBytes -NotePropertyValue (Get-Item -LiteralPath $wav).Length -Force
$tracks | ConvertTo-Json -Depth 20 | Set-Content -LiteralPath $manifestPath -Encoding utf8
Write-Output ($IdeaId + ': WAV verified and MP3 preview ready')
