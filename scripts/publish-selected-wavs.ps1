$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$manifestPath = Join-Path $root 'catalog/selected-masters.json'
$tracks = @(Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json)
$credentialLines = "protocol=https`nhost=github.com`n`n" | git credential fill
$credential = @{}
foreach ($line in $credentialLines) { if ($line -match '^([^=]+)=(.*)$') { $credential[$matches[1]] = $matches[2] } }
if (-not $credential['password']) { throw 'GitHub credential unavailable' }
$headers = @{ Authorization = 'Bearer ' + $credential['password']; Accept = 'application/vnd.github+json'; 'User-Agent' = 'CosmicVibes-Masters' }
$base = 'https://api.github.com/repos/kamilswitaj/CosmicVibes'
$tag = 'selected-masters-2026-11-16'
try { $release = Invoke-RestMethod -Uri ($base + '/releases/tags/' + $tag) -Headers $headers }
catch {
    if ([int]$_.Exception.Response.StatusCode -ne 404) { throw }
    $body = @{ tag_name=$tag; target_commitish='main'; name='Cosmic Vibes — wybrane WAV'; body='Wybrane wersje utworów: najnowsza dziesiątka B, wcześniejsze A. Oryginały WAV do pobrania z katalogu Cosmic Vibes.'; draft=$false; prerelease=$false } | ConvertTo-Json
    $release = Invoke-RestMethod -Method Post -Uri ($base + '/releases') -Headers $headers -ContentType 'application/json' -Body $body
}
$client = [System.Net.Http.HttpClient]::new()
$client.Timeout = [TimeSpan]::FromMinutes(20)
$client.DefaultRequestHeaders.Authorization = [System.Net.Http.Headers.AuthenticationHeaderValue]::new('Bearer',$credential['password'])
$client.DefaultRequestHeaders.UserAgent.ParseAdd('CosmicVibes-Masters')
try {
    foreach ($track in $tracks | Where-Object downloadStatus -eq 'Downloaded') {
        $wav = Join-Path $root $track.localWavPath
        $name = [IO.Path]::GetFileName($wav)
        $asset = $release.assets | Where-Object name -eq $name | Select-Object -First 1
        if ($asset -and $asset.size -ne (Get-Item -LiteralPath $wav).Length) { throw ('Asset size mismatch: ' + $name) }
        if (-not $asset) {
            $url = 'https://uploads.github.com/repos/kamilswitaj/CosmicVibes/releases/' + $release.id + '/assets?name=' + [Uri]::EscapeDataString($name)
            $stream = [IO.File]::OpenRead($wav)
            $content = [System.Net.Http.StreamContent]::new($stream)
            $content.Headers.ContentType = [System.Net.Http.Headers.MediaTypeHeaderValue]::new('audio/wav')
            try {
                $response = $client.PostAsync($url,$content).GetAwaiter().GetResult()
                $response.EnsureSuccessStatusCode() | Out-Null
                $asset = $response.Content.ReadAsStringAsync().GetAwaiter().GetResult() | ConvertFrom-Json
            } finally { $content.Dispose(); $stream.Dispose() }
        }
        $track | Add-Member -NotePropertyName wavUrl -NotePropertyValue $asset.browser_download_url -Force
        $track | Add-Member -NotePropertyName releaseAssetId -NotePropertyValue $asset.id -Force
        $tracks | ConvertTo-Json -Depth 20 | Set-Content -LiteralPath $manifestPath -Encoding utf8
        Write-Output ($track.ideaId + ': WAV release asset ready')
    }
} finally { $client.Dispose() }
Write-Output ('Release: ' + $release.html_url)
