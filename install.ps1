# Prior CLI — Installer
# Usage: iwr https://priornetwork.com/install-cli.ps1 | iex

$ErrorActionPreference = "Stop"
$THEME = "Cyan"

function Write-Header {
    Write-Host ""
    Write-Host "  ██████╗ ██████╗ ██╗ ██████╗ ██████╗ " -ForegroundColor $THEME
    Write-Host "  ██╔══██╗██╔══██╗██║██╔═══██╗██╔══██╗" -ForegroundColor $THEME
    Write-Host "  ██████╔╝██████╔╝██║██║   ██║██████╔╝" -ForegroundColor $THEME
    Write-Host "  ██╔═══╝ ██╔══██╗██║██║   ██║██╔══██╗" -ForegroundColor $THEME
    Write-Host "  ██║     ██║  ██║██║╚██████╔╝██║  ██║" -ForegroundColor $THEME
    Write-Host "  ╚═╝     ╚═╝  ╚═╝╚═╝ ╚═════╝ ╚═╝  ╚═╝" -ForegroundColor $THEME
    Write-Host ""
    Write-Host "  CLI Installer" -ForegroundColor DarkGray
    Write-Host "  ─────────────────────────────────────" -ForegroundColor DarkGray
    Write-Host ""
}

Write-Header

# ── Check Node.js ──────────────────────────────────────────────
Write-Host "  Checking Node.js..." -NoNewline

try {
    $nodeVer = node --version 2>&1
    if ($LASTEXITCODE -ne 0) { throw "not found" }
    Write-Host " $nodeVer" -ForegroundColor Green
} catch {
    Write-Host " not found" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  Installing Node.js LTS via winget..." -ForegroundColor Cyan

    try {
        winget install OpenJS.NodeJS.LTS --silent --accept-package-agreements --accept-source-agreements | Out-Null
        # Refresh PATH
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" +
                    [System.Environment]::GetEnvironmentVariable("Path","User")
        Write-Host "  ✓ Node.js installed." -ForegroundColor Green
    } catch {
        Write-Host ""
        Write-Host "  ✗ Could not auto-install Node.js." -ForegroundColor Red
        Write-Host "    Download it from: https://nodejs.org" -ForegroundColor DarkGray
        Write-Host "    Then re-run this installer." -ForegroundColor DarkGray
        Write-Host ""
        exit 1
    }
}

# ── Check npm ─────────────────────────────────────────────────
Write-Host "  Checking npm..." -NoNewline
try {
    $npmVer = npm --version 2>&1
    Write-Host " v$npmVer" -ForegroundColor Green
} catch {
    Write-Host " not found" -ForegroundColor Red
    Write-Host "  ✗ npm is required. Reinstall Node.js from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# ── Install Prior CLI ─────────────────────────────────────────
Write-Host ""
Write-Host "  Installing Prior CLI..." -ForegroundColor Cyan

try {
    npm install -g prior-cli 2>&1 | ForEach-Object {
        if ($_ -match "added|updated|changed") {
            Write-Host "  $_" -ForegroundColor DarkGray
        }
    }

    Write-Host ""
    Write-Host "  ✓ Prior CLI installed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "  ─────────────────────────────────────" -ForegroundColor DarkGray
    Write-Host "  Get started:" -ForegroundColor White
    Write-Host ""
    Write-Host "    prior login" -ForegroundColor Cyan
    Write-Host "    prior chat `"hello`"" -ForegroundColor Cyan
    Write-Host "    prior imagine `"a neon city at night`"" -ForegroundColor Cyan
    Write-Host "    prior --help" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  ─────────────────────────────────────" -ForegroundColor DarkGray
    Write-Host ""
} catch {
    Write-Host "  ✗ Installation failed: $_" -ForegroundColor Red
    Write-Host "  Try running manually: npm install -g prior-cli" -ForegroundColor DarkGray
    exit 1
}
