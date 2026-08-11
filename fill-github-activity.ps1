# PowerShell script to create commits for the past month
# Usage: .\fill-github-activity.ps1

Write-Host "🎨 Filling GitHub activity for the past month..." -ForegroundColor Cyan

# Get today's date
$today = Get-Date

# Loop through the past 30 days
for ($i = 0; $i -le 30; $i++) {
    # Calculate the date (going backwards from today)
    $commitDate = $today.AddDays(-$i)
    
    # Create a random number of commits for this day (1-3)
    $numCommits = Get-Random -Minimum 1 -Maximum 4
    
    for ($j = 1; $j -le $numCommits; $j++) {
        # Random hour between 9-20 (working hours)
        $hour = Get-Random -Minimum 9 -Maximum 21
        $minute = Get-Random -Minimum 0 -Maximum 60
        
        # Create timestamp
        $timestamp = $commitDate.Date.AddHours($hour).AddMinutes($minute)
        $timestampStr = $timestamp.ToString("yyyy-MM-dd HH:mm:ss")
        
        # Create or update a progress file
        Add-Content -Path ".github-activity-log.txt" -Value "Progress update for $timestampStr"
        
        # Stage the file
        git add .github-activity-log.txt
        
        # Create commit with backdated timestamp
        $env:GIT_AUTHOR_DATE = $timestampStr
        $env:GIT_COMMITTER_DATE = $timestampStr
        git commit -m "chore: daily progress update - $($commitDate.ToString('yyyy-MM-dd'))"
        
        Write-Host "✓ Created commit for $timestampStr" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "✅ Created commits for the past 30 days!" -ForegroundColor Green
Write-Host "📤 Run 'git push' to push these commits to GitHub" -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  Note: Make sure this aligns with your project's commit history." -ForegroundColor Yellow
