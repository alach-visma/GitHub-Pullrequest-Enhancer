# Installation Guide - GitHub PR Table Enhancer

## Prerequisites
- Google Chrome or Chromium-based browser
- Access to GitHub repositories with pull requests
- Internet connection for GitHub API calls (fetching author full names)

## What's New in This Version

### Enhanced Features
- **Author Full Names**: Displays real names fetched from GitHub API
- **PRD/JIRA Integration**: Automatic detection and linking of PRD references
- **Test Status Tracking**: Visual indicators for "Test OK" labels
- **Clean Design**: Undecorated links with hover effects
- **Dedicated PRD Column**: Separate column for JIRA links

### PRD Detection
Supports multiple formats:
- `PRD-12345` 
- `Prd-12345`
- `Prd 12345`

All link to: `http://hhsrv2/jira/browse/PRD-{number}`

## Step 1: Prepare the Extension

1. **Create Icons (Required)**
   - Convert the `icons/icon-template.svg` to PNG format at these sizes:
     - `icon16.png` (16x16 pixels)
     - `icon48.png` (48x48 pixels) 
     - `icon128.png` (128x128 pixels)
   - Replace the placeholder files in the `icons/` folder
   - You can use online converters like [Convertio](https://convertio.co/svg-png/) or design tools

2. **Configure JIRA Server (Required)**
   - Open `config.js` in your text editor
   - Replace `'YOUR_JIRA_SERVER_URL_HERE'` with your actual JIRA server URL
   - Examples:
     * Atlassian Cloud: `'https://your-company.atlassian.net/browse'`
     * Server: `'https://jira.your-company.com/browse'`
     * Internal: `'http://internal-jira:8080/browse'`

## Step 2: Load the Extension

1. **Open Chrome Extensions**
   - Type `chrome://extensions/` in your browser address bar
   - Or go to Chrome menu → More tools → Extensions

2. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

3. **Load the Extension**
   - Click "Load unpacked" button
   - Navigate to and select the `gh-ext` folder
   - The extension should now appear in your extensions list

## Step 3: Verify Installation

1. **Check Extension Status**
   - The extension should show as "Enabled"
   - You should see the GitHub PR Table Enhancer in your extensions list

2. **Test on GitHub**
   - Navigate to any GitHub repository
   - Go to the "Pull requests" tab
   - You should see an enhanced table with these columns:
     * **Author**: Full names (clickable GitHub profile links)
     * **Labels**: PR labels for categorization
     * **PR Title**: Clean titles (clickable PR links)
     * **PRD**: Blue JIRA link badges 
     * **Test OK**: ✓/✗ based on "Test OK" label
     * **Comments**: Comment count with icon

## Configuration Options

### GitHub API Rate Limits
- **Unauthenticated**: 60 requests/hour for author names
- **Authenticated**: 5,000 requests/hour (if GitHub token added)

### JIRA Server
Default JIRA server: `http://hhsrv2/jira/browse/`
To change, edit the `processTitleForPRD` method in `content.js`

## Troubleshooting

### Extension Not Loading
- Make sure all files are in the correct locations
- Check that the PNG icons have been created and placed in the `icons/` folder
- Verify the manifest.json file is valid

### Not Working on GitHub
- Refresh the GitHub page after installing
- Check the browser console (F12) for any error messages
- Ensure you're on a repository's Pull Requests page (URL contains `/pulls`)

### Table Not Enhanced
- The extension only works on Pull Requests pages
- Make sure there are actual PRs to display
- Try refreshing the page or navigating to a different repository

### Author Names Not Loading
- Check internet connection for GitHub API access
- GitHub API rate limit may be reached (60/hour without auth)
- Check console for "Failed to fetch full name" messages

### PRD Links Not Working
- Verify access to JIRA server: `http://hhsrv2/jira/browse/`
- Check network/VPN settings for internal JIRA access
- Ensure PRD format matches: `PRD-12345`, `Prd-12345`, or `Prd 12345`

### Test OK Column Always Shows ✗
- Extension looks for labels with exact text "Test OK"
- Check that labels are properly set on PRs
- Label detection is case-insensitive

## Uninstalling

1. Go to `chrome://extensions/`
2. Find "GitHub PR Table Enhancer"
3. Click "Remove"
4. Confirm the removal

## Support

If you encounter issues:
1. Check the browser console for error messages (F12 → Console tab)
2. Look for messages starting with "GitHub PR Enhancer:"
3. Verify you're on a GitHub Pull Requests page
4. Try disabling and re-enabling the extension
5. Refresh the GitHub page

### Console Debug Messages
- `Starting enhancement...` - Extension initializing
- `Found X PR items` - PRs detected successfully  
- `Enhancement complete!` - Table created
- `Failed to fetch full name for {user}` - GitHub API issue

## Example Output

**Before Enhancement:**
```
- PRD-98613 Fix authentication bug alach-visma
- Update docs john-doe  
- Add feature with Prd 12345 jane-smith
```

**After Enhancement:**

| Author | Labels | PR Title | PRD | Test OK | Comments |
|--------|--------|----------|-----|---------|----------|
| [Alan Acheson](github.com/alach-visma) | bug, urgent | Fix authentication bug | [PRD-98613](jira-link) | ✗ | 3 |
| [John Doe](github.com/john-doe) | docs | Update docs | None | ✓ | 0 |
| [Jane Smith](github.com/jane-smith) | feature | Add feature | [PRD-12345](jira-link) | ✓ | 5 |

## File Structure

Your final extension folder should look like:
```
gh-ext/
├── manifest.json
├── content.js
├── styles.css
├── README.md
├── INSTALL.md
└── icons/
    ├── icon16.png
    ├── icon48.png
    ├── icon128.png
    └── icon-template.svg
```