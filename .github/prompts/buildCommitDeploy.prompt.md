---
name: buildCommitDeploy
description: Build project, commit changes, and deploy to GitHub Pages
argument-hint: Optional commit message
---
Build the project for production, commit all changes with a meaningful commit message, and deploy the updates to GitHub Pages.

Steps:
1. Run the build command to generate production files
2. Stage all changes using git
3. Create a commit with the provided message or a default message
4. Deploy the built project to GitHub Pages

Use the project's configured build and deploy scripts from package.json.
