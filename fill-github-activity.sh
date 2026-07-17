#!/bin/bash

# Script to create commits for the past month to fill GitHub activity graph
# Usage: bash fill-github-activity.sh

echo "🎨 Filling GitHub activity for the past month..."

# Get today's date
today=$(date +%Y-%m-%d)

# Loop through the past 30 days
for i in {0..30}; do
  # Calculate the date (going backwards from today)
  commit_date=$(date -d "$today -$i days" +%Y-%m-%d 2>/dev/null || date -v-${i}d +%Y-%m-%d)
  
  # Create a random number of commits for this day (1-3)
  num_commits=$((RANDOM % 3 + 1))
  
  for j in $(seq 1 $num_commits); do
    # Random hour between 9-20 (working hours)
    hour=$((RANDOM % 12 + 9))
    minute=$((RANDOM % 60))
    
    # Full timestamp
    timestamp="$commit_date $hour:$minute:00"
    
    # Create or update a progress file
    echo "Progress update for $timestamp" >> .github-activity-log.txt
    
    # Stage the file
    git add .github-activity-log.txt
    
    # Create commit with backdated timestamp
    GIT_AUTHOR_DATE="$timestamp" GIT_COMMITTER_DATE="$timestamp" git commit -m "chore: daily progress update - $commit_date"
    
    echo "✓ Created commit for $timestamp"
  done
done

echo ""
echo "✅ Created commits for the past 30 days!"
echo "📤 Run 'git push' to push these commits to GitHub"
echo ""
echo "⚠️  Note: Make sure this aligns with your project's commit history."
