# GitHub PR Table Enhancer

A Chrome extension that enhances the GitHub Pull Request table view with improved column layout, better data visibility, and integrated JIRA linking.

## Features

- **Enhanced Table View**: Converts the default GitHub PR list into a structured table format
- **Author Integration**: Displays full names with clickable links to GitHub profiles
- **PRD/JIRA Integration**: Automatically detects and links PRD references to JIRA
- **Label-based Organization**: Uses GitHub labels for better categorization
- **Test Status Tracking**: Visual indicators for "Test OK" status
- **Clean Design**: Undecorated links that maintain GitHub's aesthetic
- **Responsive Design**: Adapts to GitHub's existing theme and styling
- **Non-Intrusive**: Preserves original functionality while enhancing the display

## Columns

1. **Author** - Shows full name (fetched from GitHub API) linking to GitHub profile
2. **Labels** - Displays PR labels (excluding "Test OK") for categorization
3. **PR Title** - Clean title (PRD references removed) linking to the full PR
4. **PRD** - Dedicated column with clickable JIRA links for PRD references
5. **Test OK** - Visual indicator (✓ for Test OK label present, ✗ for absent)
6. **Comment Count** - Number of comments with icon

## PRD/JIRA Integration

The extension automatically detects PRD references in various formats:
- `PRD-12345`
- `Prd-12345` 
- `Prd 12345`

All formats are converted to clickable links: `http://hhsrv2/jira/browse/PRD-12345`

## Quick Setup

**🚀 Get started in 4 steps:**

1. **Download**: Clone or download this repository
   ```bash
   git clone https://github.com/alach-visma/github-pr-enhancer.git
   ```

2. **Configure**: Set up your JIRA server URL
   ```bash
   cd gh-ext
   # Edit config.js and replace 'YOUR_JIRA_SERVER_URL_HERE' with your JIRA URL
   # Example: 'https://your-company.atlassian.net/browse'
   ```

3. **Install**: Load the extension in Chrome
   - Open `chrome://extensions/`
   - Enable "Developer mode" (top-right toggle)
   - Click "Load unpacked" → Select the `gh-ext` folder

4. **Use**: Visit any GitHub repository's Pull Requests page
   - The enhanced table will appear automatically
   - Full names, PRD links, and test status will be visible

**That's it!** 🎉

### What You'll See

Your PR list transforms from:
```
🔸 Fix auth bug #123 by alach-visma
🔸 PRD-456 Update docs #124 by john-doe  
🔸 Add feature Prd 789 #125 by jane-smith
```

To an organized table:
| Author | Labels | PR Title | PRD | Test OK | Comments |
|--------|--------|----------|-----|---------|----------|
| Alan Acheson | bug, urgent | Fix auth bug | None | ✗ | 3 |
| John Doe | docs | Update docs | PRD-456 | ✓ | 0 |
| Jane Smith | feature | Add feature | PRD-789 | ✓ | 5 |

## Configuration

### Required: JIRA Server Setup

Edit `config.js` and update the `jiraBaseUrl`:

```javascript
const CONFIG = {
    jiraBaseUrl: 'https://your-company.atlassian.net/browse', // Replace with your JIRA URL
    // ... other options
};
```

**Common JIRA URL formats:**
- **Atlassian Cloud**: `https://your-company.atlassian.net/browse`
- **Server/Data Center**: `https://jira.your-company.com/browse` 
- **Internal Server**: `http://internal-jira:8080/browse`

### Optional: Custom PRD Prefix

If your tickets use a different prefix than "PRD":

```javascript
const CONFIG = {
    prdPrefix: 'TICKET', // Will match TICKET-123, Ticket 456, etc.
    // ... other options
};
```

**Note:** GitHub API calls for author names use anonymous access (60 requests/hour limit).

## Visual Design

- **Undecorated Links**: PR titles and author names appear as normal text
- **Hover Effects**: Links show blue color and underline on hover for feedback
- **PRD Badges**: Blue badges make JIRA links clearly distinguishable
- **Clean Separation**: PRD references are moved to dedicated column for clarity

## Installation

1. Download or clone this extension
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. Navigate to any GitHub repository's Pull Requests tab
6. The enhanced table view will automatically activate

## Usage

- Simply navigate to any GitHub repository's Pull Requests page (`/pulls`)
- The extension will automatically detect the PR list and enhance it
- The original GitHub interface remains fully functional
- The enhanced table provides better overview and readability

## Technical Details

- **Manifest Version**: 3
- **Permissions**: Only active on GitHub.com
- **Framework**: Vanilla JavaScript with GitHub API integration
- **Styling**: CSS that respects GitHub's design system
- **APIs Used**: 
  - GitHub API for fetching author full names (anonymous, 60 requests/hour)
  - DOM manipulation for PR data extraction
  - JIRA linking for PRD references

## Data Sources

- **Author Information**: GitHub user profiles via API (anonymous access)
- **PR Labels**: GitHub's IssueLabel elements with data-name attributes  
- **PRD Detection**: Regex pattern matching in PR titles
- **Test Status**: "Test OK" label presence detection
- **Comment Counts**: GitHub's comment indicators

## Compatibility

- Works with GitHub's current interface
- Compatible with light and dark themes
- Handles dynamic content loading
- Supports GitHub's single-page application navigation

## Development

The extension consists of:
- `manifest.json` - Extension configuration
- `content.js` - Main functionality script
- `styles.css` - Enhanced table styling
- `icons/` - Extension icons

## License

This project is open source and available under the MIT License.

