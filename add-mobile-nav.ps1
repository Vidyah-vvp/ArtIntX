$frontendDir = "d:\Google Antigravity\frontend"

# App pages (not index.html which has a different layout)
$appPages = @("dashboard.html", "chatbot.html", "mood.html", "assessment.html", "analytics.html", "risk.html", "resources.html", "profile.html")

$mobileElements = @"
    <!-- Mobile Menu -->
    <button class="mobile-menu-btn" id="mobileMenuBtn" onclick="toggleSidebar()">☰</button>
    <div class="sidebar-overlay" id="sidebarOverlay" onclick="toggleSidebar()"></div>

    <!-- PWA Install Banner -->
    <div class="pwa-install-banner" id="installBanner">
        <div class="pwa-install-banner-icon">🧠</div>
        <div class="pwa-install-banner-text">
            <div class="pwa-install-banner-title">Install ArtIntX</div>
            <div class="pwa-install-banner-desc">Add to home screen for the full app experience</div>
        </div>
        <button class="pwa-install-btn" id="installBtn" onclick="installPWA()">Install</button>
        <button class="pwa-install-close" onclick="dismissInstall()">✕</button>
    </div>
"@

$mobileScript = @"

    <!-- Mobile Navigation & PWA Install -->
    <script>
        // Mobile sidebar toggle
        function toggleSidebar() {
            const sidebar = document.querySelector('.sidebar');
            const overlay = document.getElementById('sidebarOverlay');
            const isOpen = sidebar.classList.toggle('open');
            if (isOpen) {
                overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            } else {
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        }

        // Close sidebar when clicking a nav link on mobile
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    toggleSidebar();
                }
            });
        });

        // PWA Install prompt
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            if (!localStorage.getItem('pwa_install_dismissed')) {
                setTimeout(() => {
                    document.getElementById('installBanner')?.classList.add('show');
                }, 3000);
            }
        });

        function installPWA() {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then(choice => {
                    if (choice.outcome === 'accepted') {
                        console.log('[PWA] App installed');
                    }
                    deferredPrompt = null;
                    document.getElementById('installBanner')?.classList.remove('show');
                });
            }
        }

        function dismissInstall() {
            document.getElementById('installBanner')?.classList.remove('show');
            localStorage.setItem('pwa_install_dismissed', 'true');
        }
    </script>
"@

foreach ($page in $appPages) {
    $filePath = Join-Path $frontendDir $page
    $content = Get-Content $filePath -Raw
    
    # Add mobile elements right after <body> tag (after any orbs/toasts)
    # Insert before the first <div class="app-layout">
    $content = $content -replace '<div class="app-layout">', ($mobileElements + "`r`n`r`n    <div class=""app-layout"">")
    
    # Add mobile script before the service worker script (before </body>)
    $content = $content -replace '  <!-- Service Worker Registration -->', ($mobileScript + "`r`n  <!-- Service Worker Registration -->")
    
    Set-Content -Path $filePath -Value $content -NoNewline
    Write-Host "Updated: $page"
}

Write-Host "`nAll app pages updated with mobile menu & install banner!"
