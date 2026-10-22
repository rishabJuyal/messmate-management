$ErrorActionPreference = 'Stop'
$repoUrl = 'https://github.com/rishabJuyal/messmate-management.git'

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Error 'Git is not installed. Install Git for Windows, then run this script again.'
}

Set-Location $PSScriptRoot
if (-not (Test-Path '.git')) {
  git init
  if ($LASTEXITCODE -ne 0) { throw 'git init failed' }
}
git branch -M main
if ($LASTEXITCODE -ne 0) { throw 'Could not set branch to main' }
$remote = git remote get-url origin 2>$null
if ($LASTEXITCODE -eq 0) {
  git remote set-url origin $repoUrl
} else {
  git remote add origin $repoUrl
}
if ($LASTEXITCODE -ne 0) { throw 'Could not configure origin remote' }
git add .
if ($LASTEXITCODE -ne 0) { throw 'git add failed' }
$hasHead = git rev-parse --verify HEAD 2>$null
if ($LASTEXITCODE -ne 0) {
  git commit -m 'Initial commit: MessMate React demo'
} else {
  git diff --cached --quiet
  if ($LASTEXITCODE -ne 0) { git commit -m 'Add MessMate React demo' }
}
if ($LASTEXITCODE -ne 0) { throw 'git commit failed; make sure git user.name and user.email are configured' }
git push -u origin main
if ($LASTEXITCODE -ne 0) { throw 'Push failed. Sign in when prompted, and make sure the GitHub repository is empty or compatible with this history.' }
Write-Host "`nMessMate pushed successfully: https://github.com/rishabJuyal/messmate-management" -ForegroundColor Green
