param(
    [Parameter(Mandatory=$false)]
    [string]$RepoUrl
)

if (-not $RepoUrl) {
    $RepoUrl = Read-Host "Enter your GitHub repository URL (e.g. https://github.com/username/jobpilot-ai.git)"
}

if (-not $RepoUrl) {
    Write-Error "Repository URL cannot be empty."
    exit 1
}

Write-Host "`nSetting remote origin to $RepoUrl..." -ForegroundColor Cyan
git remote remove origin 2>$null
git remote add origin $RepoUrl
git branch -M main

Write-Host "`nPushing main branch to GitHub..." -ForegroundColor Green
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nSuccessfully pushed to GitHub! Your repository is now ready for Vercel deployment and GitHub Actions APK builds." -ForegroundColor Green
} else {
    Write-Host "`nPush failed. Please verify repository URL and your GitHub permissions." -ForegroundColor Red
}
