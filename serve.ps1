$ErrorActionPreference = 'Stop'
$root = (Resolve-Path -LiteralPath $PSScriptRoot).Path.TrimEnd([IO.Path]::DirectorySeparatorChar)
$listener = [Net.Sockets.TcpListener]::new([Net.IPAddress]::Any, 8000)
$mimeTypes = @{
    '.html' = 'text/html; charset=utf-8'
    '.css' = 'text/css; charset=utf-8'
    '.js' = 'application/javascript; charset=utf-8'
    '.png' = 'image/png'
    '.jpg' = 'image/jpeg'
    '.jpeg' = 'image/jpeg'
    '.svg' = 'image/svg+xml'
    '.ico' = 'image/x-icon'
}

$listener.Start()
Write-Host 'Serving this website on http://0.0.0.0:8000'
Write-Host 'Press Ctrl+C to stop the server.'

try {
    while ($true) {
        $client = $listener.AcceptTcpClient()
        try {
            $stream = $client.GetStream()
            $reader = [IO.StreamReader]::new($stream, [Text.Encoding]::ASCII, $false, 1024, $true)
            $requestLine = $reader.ReadLine()
            if (-not $requestLine) { continue }
            while ($reader.ReadLine() -ne '') { }

            $parts = $requestLine.Split(' ')
            $method = $parts[0]
            $status = '200 OK'
            $body = [byte[]]::new(0)
            $contentType = 'text/plain; charset=utf-8'

            if ($method -ne 'GET' -and $method -ne 'HEAD') {
                $status = '405 Method Not Allowed'
                $body = [Text.Encoding]::UTF8.GetBytes('Method not allowed')
            } else {
                $requestPath = [Uri]::UnescapeDataString(($parts[1] -split '\?', 2)[0]).TrimStart('/')
                if (-not $requestPath) { $requestPath = 'index.html' }
                $relativePath = $requestPath.Replace('/', [IO.Path]::DirectorySeparatorChar)
                $filePath = Join-Path $root $relativePath

                try {
                    $resolvedPath = (Resolve-Path -LiteralPath $filePath).Path
                    if (-not $resolvedPath.StartsWith($root + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
                        throw 'Path is outside the website folder.'
                    }
                    if ((Get-Item -LiteralPath $resolvedPath).PSIsContainer) {
                        $resolvedPath = Join-Path $resolvedPath 'index.html'
                    }
                    $body = [IO.File]::ReadAllBytes($resolvedPath)
                    $extension = [IO.Path]::GetExtension($resolvedPath).ToLowerInvariant()
                    if ($mimeTypes.ContainsKey($extension)) { $contentType = $mimeTypes[$extension] }
                } catch {
                    $status = '404 Not Found'
                    $body = [Text.Encoding]::UTF8.GetBytes('Not found')
                }
            }

            $length = $body.Length
            $headers = "HTTP/1.1 $status`r`nContent-Type: $contentType`r`nContent-Length: $length`r`nConnection: close`r`n`r`n"
            $headerBytes = [Text.Encoding]::ASCII.GetBytes($headers)
            $stream.Write($headerBytes, 0, $headerBytes.Length)
            if ($method -ne 'HEAD' -and $body.Length -gt 0) { $stream.Write($body, 0, $body.Length) }
            $stream.Flush()
        } catch {
            Write-Warning $_
        } finally {
            if ($reader) { $reader.Dispose() }
            if ($client) { $client.Close() }
        }
    }
} finally {
    $listener.Stop()
}
