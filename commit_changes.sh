#!/bin/bash

# Initialize git repository if not already initialized
if [ ! -d ".git" ]; then
    git init
fi

# Add all changes
git add .

# Create commit with proper message
git commit -m "feat: implement Crawlee v3 batch request functionality

- Replace crawler.run(startUrls) with crawler.addRequests() + crawler.run()
- Fix desiredConcurrency property error by removing invalid autoscaledPoolOptions
- Add documentation for new batch request approach in tools.ts
- Leverage Crawlee v3's improved request queue management for better performance

This change utilizes Crawlee v3's new addRequests() method which:
- Batches the first 1000 requests for immediate processing
- Continues adding remaining requests in background
- Prevents API rate limits
- Improves overall crawling performance

Tested successfully - crawler now starts without errors and processes requests efficiently.

Files modified:
- src/main.ts: Updated crawler startup to use addRequests() method
- src/concurrency_manager.ts: Removed invalid properties and simplified configuration
- src/tools.ts: Added documentation for the new approach

Resolves: ArgumentError with desiredConcurrency property
Enhances: Request processing performance with Crawlee v3 features"

echo "Commit completed successfully!"
git log --oneline -1