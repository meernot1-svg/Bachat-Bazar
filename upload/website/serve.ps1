# Minimal static file server using HttpListener
$port = 8000
$root = $PSScriptRoot
Add-Type -AssemblyName System.Web
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "Serving $root on http://localhost:$port"
$mimes = @{
  '.html'='text/html'; '.css'='text/css'; '.js'='application/javascript';
  '.json'='application/json'; '.png'='image/png'; '.jpg'='image/jpeg';
  '.svg'='image/svg+xml'; '.ico'='image/x-icon'; '.webp'='image/webp';
  '.woff2'='font/woff2'; '.woff'='font/woff'
}
while ($listener.IsListening) {
  try {
    $ctx = $listener.GetContext()
    $req = $ctx.Request.Url.LocalPath
    $path = if ($req -eq '/') { '/index.html' } else { $req }
    $file = Join-Path $root ($path -replace '^/','')
    if (Test-Path $file -PathType Leaf) {
      $ext = [System.IO.Path]::GetExtension($file)
      $mime = if ($mimes.ContainsKey($ext)) { $mimes[$ext] } else { 'application/octet-stream' }
      $bytes = [System.IO.File]::ReadAllBytes($file)
      $ctx.Response.ContentType = $mime
      $ctx.Response.ContentLength64 = $bytes.Length
      $ctx.Response.AddHeader('Access-Control-Allow-Origin','*')
      $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $ctx.Response.StatusCode = 404
      $sw = New-Object System.IO.StreamWriter($ctx.Response.OutputStream)
      $sw.Write("404 Not Found: $file")
      $sw.Close()
    }
    $ctx.Response.Close()
  } catch {
    Write-Host $_.Exception.Message
  }
}
