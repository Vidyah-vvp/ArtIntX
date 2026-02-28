$frontendDir = "d:\Google Antigravity\frontend"
$htmlFiles = Get-ChildItem -Path $frontendDir -Filter "*.html"

$pwaMeta = @"
  <!-- PWA Meta Tags -->
  <meta name="theme-color" content="#7C6AF4" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="ArtIntX" />
  <meta name="mobile-web-app-capable" content="yes" />
  <link rel="manifest" href="manifest.json" />
  <link rel="apple-touch-icon" href="icon-512.png" />
"@

$swScript = @"

  <!-- Service Worker Registration -->
  <script>
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then(reg => console.log('[PWA] Service Worker registered:', reg.scope))
          .catch(err => console.warn('[PWA] SW registration failed:', err));
      });
    }
  </script>
"@

foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw
    
    # Replace viewport meta to add mobile-optimized version + PWA tags
    $oldViewport = '<meta name="viewport" content="width=device-width, initial-scale=1.0" />'
    $newViewport = '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover" />' + "`r`n" + $pwaMeta
    
    $content = $content -replace [regex]::Escape($oldViewport), $newViewport
    
    # Add service worker script before </body>
    $content = $content -replace '</body>', ($swScript + "`r`n</body>")
    
    Set-Content -Path $file.FullName -Value $content -NoNewline
    Write-Host "Updated: $($file.Name)"
}

Write-Host "`nAll HTML files updated with PWA support!"
