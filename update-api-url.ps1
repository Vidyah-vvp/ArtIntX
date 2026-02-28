$frontendDir = "d:\Google Antigravity\frontend"
$htmlFiles = Get-ChildItem -Path $frontendDir -Filter "*.html"

foreach ($file in $htmlFiles) {
    (Get-Content $file.FullName) -replace "http://localhost:5000", "http://192.168.1.7:5000" | Set-Content $file.FullName
    Write-Host "Updated: $($file.Name)"
}
