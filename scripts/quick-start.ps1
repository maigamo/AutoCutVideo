# AutoCutVideo Quick Start Script
# Windows PowerShell Version

param(
    [string]$InputDir = "videos/input",
    [string]$OutputDir = "videos/output",
    [string]$MusicDir = "music",
    [switch]$Check,
    [switch]$Help
)

$ErrorActionPreference = "Stop"

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Show-Help {
    Write-ColorOutput "`n AutoCutVideo Quick Start`n" "Cyan"
    Write-Host "Usage:"
    Write-Host "  .\scripts\quick-start.ps1 [options]`n"
    Write-Host "Options:"
    Write-Host "  -InputDir <path>   Input video directory (default: videos/input)"
    Write-Host "  -OutputDir <path>  Output video directory (default: videos/output)"
    Write-Host "  -MusicDir <path>   Background music directory (default: music)"
    Write-Host "  -Check             Only check environment"
    Write-Host "  -Help              Show this help`n"
}

function Show-Banner {
    Write-ColorOutput "`n========================================" "Cyan"
    Write-ColorOutput "   AutoCutVideo Batch Processor" "Cyan"
    Write-ColorOutput "========================================`n" "Cyan"
}

function Main {
    if ($Help) {
        Show-Help
        exit 0
    }

    Show-Banner

    if ($Check) {
        Write-ColorOutput "Checking environment..." "Yellow"
        npm run check
        exit $LASTEXITCODE
    }

    Write-ColorOutput "Checking directories..." "Yellow"
    
    if (-not (Test-Path $InputDir)) {
        Write-ColorOutput "Input directory not found: $InputDir" "Red"
        Write-Host "`nPlease create directory and add videos:`n  mkdir $InputDir`n"
        exit 1
    }

    if (-not (Test-Path $MusicDir)) {
        Write-ColorOutput "Music directory not found: $MusicDir" "Red"
        Write-Host "`nPlease create directory and add music:`n  mkdir $MusicDir`n"
        exit 1
    }

    $videoFiles = Get-ChildItem -Path $InputDir -Include *.mp4,*.mov,*.avi,*.mkv,*.webm -File -ErrorAction SilentlyContinue
    $musicFiles = Get-ChildItem -Path $MusicDir -Include *.mp3,*.wav,*.aac,*.m4a,*.flac -File -ErrorAction SilentlyContinue

    $videoCount = if ($videoFiles) { $videoFiles.Count } else { 0 }
    $musicCount = if ($musicFiles) { $musicFiles.Count } else { 0 }

    Write-ColorOutput "  Input: $InputDir" "Green"
    Write-ColorOutput "  Output: $OutputDir" "Green"
    Write-ColorOutput "  Music: $MusicDir`n" "Green"

    if ($videoCount -eq 0) {
        Write-ColorOutput "No video files found" "Yellow"
        Write-Host "`nPlease add videos to: $InputDir"
        Write-Host "Supported: .mp4, .mov, .avi, .mkv, .webm`n"
        exit 1
    }

    if ($musicCount -eq 0) {
        Write-ColorOutput "No music files found" "Yellow"
        Write-Host "`nPlease add music to: $MusicDir"
        Write-Host "Supported: .mp3, .wav, .aac, .m4a, .flac`n"
        exit 1
    }

    Write-ColorOutput "File Statistics:" "Cyan"
    Write-Host "  Videos: $videoCount"
    Write-Host "  Music: $musicCount`n"

    Write-ColorOutput "Processing Parameters:" "Cyan"
    Write-Host "  - Speed: 1.2x"
    Write-Host "  - Flip: Horizontal"
    Write-Host "  - Sharpen: 10%"
    Write-Host "  - Audio: Background music"
    Write-Host "  - Quality: High (CRF 18)`n"

    Write-ColorOutput "Ready to process" "Green"
    $confirm = Read-Host "  Continue? (Y/n)"
    
    if ($confirm -eq "" -or $confirm -eq "Y" -or $confirm -eq "y") {
        Write-Host ""
        Write-ColorOutput "Starting batch processing...`n" "Cyan"
        
        node scripts/batch-video-processor.js $InputDir $OutputDir $MusicDir
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-ColorOutput "Processing complete!" "Green"
            Write-ColorOutput "  Output: $OutputDir`n" "Green"
            
            $openDir = Read-Host "  Open output directory? (Y/n)"
            if ($openDir -eq "" -or $openDir -eq "Y" -or $openDir -eq "y") {
                Invoke-Item $OutputDir
            }
        } else {
            Write-Host ""
            Write-ColorOutput "Processing failed" "Red"
            Write-Host "  Check error messages above`n"
            exit 1
        }
    } else {
        Write-Host ""
        Write-ColorOutput "  Cancelled" "Yellow"
        Write-Host ""
        exit 0
    }
}

try {
    Main
} catch {
    Write-ColorOutput "`nError: $_`n" "Red"
    exit 1
}

