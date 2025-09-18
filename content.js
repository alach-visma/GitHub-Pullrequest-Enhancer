/**
 * GitHub PR Table Enhancer - Content Script
 * Enhances the GitHub Pull Request table view with improved column layout
 */

class GitHubPREnhancer {
    constructor() {
        this.isEnhanced = false;
        this.observer = null;
        this.init();
    }

    init() {
        // Wait for the page to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.enhance());
        } else {
            this.enhance();
        }

        // Set up observer for dynamic content changes
        this.setupObserver();
    }

    setupObserver() {
        this.observer = new MutationObserver((mutations) => {
            let shouldReEnhance = false;
            
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Check if PR list content was added/changed
                            if (node.querySelector?.('[data-hovercard-type="pull_request"]') ||
                                node.classList?.contains('js-navigation-item') ||
                                node.querySelector?.('.js-navigation-item')) {
                                shouldReEnhance = true;
                            }
                        }
                    });
                }
            });

            if (shouldReEnhance && !this.isEnhanced) {
                setTimeout(() => this.enhance(), 100);
            }
        });

        this.observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    enhance() {
        // Check if we're on a PR list page
        if (!this.isPRListPage()) {
            return;
        }

        console.log('GitHub PR Enhancer: Starting enhancement...');
        
        // Find the PR list container
        const prContainer = this.findPRContainer();
        if (!prContainer) {
            console.log('GitHub PR Enhancer: PR container not found, retrying...');
            setTimeout(() => this.enhance(), 1000);
            return;
        }

        // Get all PR items
        const prItems = this.getPRItems(prContainer);
        if (prItems.length === 0) {
            console.log('GitHub PR Enhancer: No PR items found, retrying...');
            setTimeout(() => this.enhance(), 1000);
            return;
        }

        console.log(`GitHub PR Enhancer: Found ${prItems.length} PR items`);

        // Create enhanced table
        this.createEnhancedTable(prContainer, prItems);
        this.isEnhanced = true;
    }

    isPRListPage() {
        return window.location.pathname.includes('/pulls') && 
               (window.location.search.includes('is:pr') || window.location.search === '' || 
                window.location.pathname.endsWith('/pulls'));
    }

    findPRContainer() {
        // GitHub uses different selectors, try multiple approaches
        const selectors = [
            '[aria-labelledby="issues-tab"]',
            '.js-navigation-container',
            '[data-view-component="true"].js-navigation-container',
            '.Box--condensed .Box-body',
            '.Box-row-link'
        ];

        for (const selector of selectors) {
            const container = document.querySelector(selector);
            if (container && container.querySelector('[data-hovercard-type="pull_request"]')) {
                return container.closest('.Box, .js-navigation-container') || container;
            }
        }

        // Fallback: look for any container with PR links
        const prLinks = document.querySelectorAll('[data-hovercard-type="pull_request"]');
        if (prLinks.length > 0) {
            return prLinks[0].closest('.Box, .js-navigation-container') || 
                   prLinks[0].closest('[role="main"]') ||
                   prLinks[0].parentElement.parentElement;
        }

        return null;
    }

    getPRItems(container) {
        // Find all PR items using multiple selectors
        const selectors = [
            '.js-navigation-item',
            '.Box-row',
            '[data-hovercard-type="pull_request"]'
        ];

        let items = [];
        
        for (const selector of selectors) {
            const elements = container.querySelectorAll(selector);
            for (const element of elements) {
                // Check if this element contains a PR link
                if (element.querySelector('[data-hovercard-type="pull_request"]') || 
                    element.getAttribute('data-hovercard-type') === 'pull_request') {
                    
                    // Find the closest row/item container
                    const prItem = element.closest('.js-navigation-item') || 
                                  element.closest('.Box-row') || 
                                  element;
                    
                    if (prItem && !items.includes(prItem)) {
                        items.push(prItem);
                    }
                }
            }
        }

        return items;
    }

    extractPRData(prItem) {
        const data = {
            author: 'Unknown',
            authorUsername: '',
            authorFullName: '',
            authorAvatar: '',
            authorProfile: '',
            labels: [],
            title: 'Unknown',
            titleLink: '#',
            hasTestOk: false,
            commentCount: 0,
            number: 'Unknown'
        };

        try {
            // Extract PR title and link
            const titleLink = prItem.querySelector('[data-hovercard-type="pull_request"]');
            if (titleLink) {
                data.title = titleLink.textContent.trim();
                data.titleLink = titleLink.href;
                
                // Extract PR number from the link or nearby elements
                const numberMatch = titleLink.href.match(/\/pull\/(\d+)/);
                if (numberMatch) {
                    data.number = numberMatch[1];
                }

                // Process title to extract PRD links while keeping PR links for non-PRD text
                const titleProcessing = this.processTitleForPRD(data.title, data.titleLink);
                data.cleanTitle = titleProcessing.cleanTitle;
                data.prdLinks = titleProcessing.prdLinks;
            }

            // Extract author information
            const authorLink = prItem.querySelector('[data-hovercard-type="user"]');
            if (authorLink) {
                data.authorUsername = authorLink.textContent.trim() || authorLink.getAttribute('aria-label') || 'Unknown';
                data.author = data.authorUsername; // Keep for backward compatibility
                data.authorProfile = `https://github.com/${data.authorUsername}`;
                
                // Find author avatar
                const avatar = prItem.querySelector('.avatar, [alt*="@"]');
                if (avatar) {
                    data.authorAvatar = avatar.src || avatar.getAttribute('data-src') || '';
                }

                // Fetch author's full name asynchronously
                this.fetchAuthorFullName(data.authorUsername).then(fullName => {
                    data.authorFullName = fullName;
                    // Update the displayed name in the table
                    this.updateAuthorDisplay(data.authorUsername, fullName, data.authorProfile);
                });
            }

            // Extract labels and process them
            const labelElements = prItem.querySelectorAll('.IssueLabel');
            const allLabels = [];
            
            labelElements.forEach(labelElement => {
                const labelName = labelElement.getAttribute('data-name') || labelElement.textContent.trim();
                if (labelName) {
                    allLabels.push(labelName);
                    
                    // Check for "Test OK" label
                    if (labelName.toLowerCase() === 'test ok') {
                        data.hasTestOk = true;
                    }
                }
            });

            // Use labels as target branch (exclude "Test OK" label)
            data.labels = allLabels.filter(label => label.toLowerCase() !== 'test ok');

            // Extract comment count
            const commentElement = prItem.querySelector('[aria-label*="comment"], .octicon-comment + span, [title*="comment"]');
            if (commentElement) {
                const commentText = commentElement.textContent.trim();
                const commentMatch = commentText.match(/(\d+)/);
                if (commentMatch) {
                    data.commentCount = parseInt(commentMatch[1], 10);
                }
            }

        } catch (error) {
            console.warn('GitHub PR Enhancer: Error extracting PR data:', error);
        }

        return data;
    }

    processTitleForPRD(title, prLink) {
        // Extract PRD references and return clean title + PRD links separately
        if (title.includes('<a href=') || title.includes('target="_blank"') || title.includes('data-prd-processed')) {
            return { cleanTitle: title, prdLinks: [] };
        }
        
        // Check if configuration is properly set up
        if (!window.CONFIG || !window.CONFIG.jiraBaseUrl || window.CONFIG.jiraBaseUrl === 'YOUR_JIRA_SERVER_URL_HERE') {
            console.warn('GitHub PR Enhancer: JIRA URL not configured. Please update config.js with your JIRA server URL.');
            // Return clean title without PRD processing if not configured
            return { cleanTitle: title, prdLinks: [] };
        }
        
        const prdPrefix = window.CONFIG.prdPrefix || 'PRD';
        const prdRegex = new RegExp(`\\b(?:${prdPrefix}|${prdPrefix.toLowerCase()}|${prdPrefix.toUpperCase()})(?:\\s+|-)(\\d+)\\b`, 'g');
        const prdLinks = [];
        let match;
        
        // Extract all PRD references
        while ((match = prdRegex.exec(title)) !== null) {
            prdLinks.push({
                original: match[0],
                number: match[1],
                link: `${window.CONFIG.jiraBaseUrl}/${prdPrefix.toUpperCase()}-${match[1]}`
            });
        }
        
        // Remove PRD references from title and clean up extra spaces
        let cleanTitle = title.replace(prdRegex, '').replace(/\s+/g, ' ').trim();
        
        // If title is empty after removing PRDs, use original
        if (!cleanTitle) {
            cleanTitle = title;
        }
        
        return { cleanTitle, prdLinks };
    }

    async fetchAuthorFullName(username) {
        try {
            const response = await fetch(`https://api.github.com/users/${username}`);
            if (response.ok) {
                const userData = await response.json();
                return userData.name || username; // Fall back to username if no full name
            } else if (response.status === 403) {
                console.warn(`GitHub PR Enhancer: Rate limit exceeded for GitHub API (60 requests/hour limit for anonymous access)`);
            }
        } catch (error) {
            console.warn(`GitHub PR Enhancer: Failed to fetch full name for ${username}:`, error);
        }
        return username; // Fall back to username on error
    }

    updateAuthorDisplay(username, fullName, profileUrl) {
        // Find all author elements for this username and update them
        const authorElements = document.querySelectorAll(`[data-author="${username}"]`);
        authorElements.forEach(element => {
            const link = element.querySelector('a');
            if (link) {
                link.textContent = fullName;
            }
        });
    }

    createEnhancedTable(container, prItems) {
        // Extract data from all PR items
        const prData = prItems.map(item => this.extractPRData(item));

        // Create enhanced table
        const enhancedTable = document.createElement('table');
        enhancedTable.className = 'pr-table-enhanced';
        enhancedTable.innerHTML = `
            <thead>
                <tr>
                    <th class="author-column">Author</th>
                    <th class="branch-column">Labels</th>
                    <th class="title-column">PR Title</th>
                    <th class="prd-column">PRD</th>
                    <th class="test-ok-column">Test OK</th>
                    <th class="comments-column">Comments</th>
                </tr>
            </thead>
            <tbody>
                ${prData.map(pr => this.createTableRow(pr)).join('')}
            </tbody>
        `;

        // Add notice
        const notice = document.createElement('div');
        notice.className = 'pr-enhancement-notice';
        notice.innerHTML = '✨ Enhanced PR table view by GitHub PR Table Enhancer';

        // Hide original content and insert enhanced table
        const originalContainer = container.closest('.Box') || container;
        originalContainer.classList.add('pr-table-original', 'enhanced-hidden');

        // Insert enhanced content after the original
        originalContainer.parentNode.insertBefore(notice, originalContainer.nextSibling);
        originalContainer.parentNode.insertBefore(enhancedTable, notice.nextSibling);

        console.log('GitHub PR Enhancer: Enhancement complete!');
    }

    createTableRow(pr) {
        return `
            <tr>
                <td class="author-column">
                    <div class="author-info" data-author="${pr.authorUsername || pr.author}">
                        ${pr.authorAvatar ? `<img class="author-avatar" src="${pr.authorAvatar}" alt="${pr.author}">` : ''}
                        <a href="${pr.authorProfile || `https://github.com/${pr.author}`}" target="_blank" class="author-link">
                            ${pr.authorFullName || pr.author}
                        </a>
                    </div>
                </td>
                <td class="labels-column">
                    <div class="labels-list">
                        ${pr.labels.length > 0 ? pr.labels.join(', ') : '<span class="color-fg-muted">None</span>'}
                    </div>
                </td>
                <td class="title-column">
                    <div class="pr-title">
                        <a href="${pr.titleLink}" target="_blank">${pr.cleanTitle || pr.title}</a>
                    </div>
                </td>
                <td class="prd-column">
                    <div class="prd-links">
                        ${pr.prdLinks && pr.prdLinks.length > 0 ? 
                            pr.prdLinks.map(prd => 
                                `<a href="${prd.link}" target="_blank" class="prd-link">PRD-${prd.number}</a>`
                            ).join(' ') : 
                            '<span class="color-fg-muted">None</span>'
                        }
                    </div>
                </td>
                <td class="testok-column">
                    <span class="testok-indicator ${pr.hasTestOk ? 'testok-yes' : 'testok-no'}">
                        ${pr.hasTestOk ? '✓' : '✗'}
                    </span>
                </td>
                <td class="comments-column">
                    <div class="comment-count">
                        <svg class="comment-icon" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M1.75 1h8.5c.966 0 1.75.784 1.75 1.75v5.5A1.75 1.75 0 0 1 10.25 10H7.061l-2.574 2.573A1.458 1.458 0 0 1 2 11.543V10h-.25A1.75 1.75 0 0 1 0 8.25v-5.5C0 1.784.784 1 1.75 1ZM1.5 2.75v5.5c0 .138.112.25.25.25h1a.75.75 0 0 1 .75.75v2.19l2.72-2.72a.749.749 0 0 1 .53-.22h3.5a.25.25 0 0 0 .25-.25v-5.5a.25.25 0 0 0-.25-.25h-8.5a.25.25 0 0 0-.25.25Z"></path>
                        </svg>
                        <span>${pr.commentCount}</span>
                    </div>
                </td>
            </tr>
        `;
    }

    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
        
        // Remove enhanced elements
        document.querySelectorAll('.pr-table-enhanced, .pr-enhancement-notice').forEach(el => el.remove());
        
        // Show original content
        document.querySelectorAll('.pr-table-original.enhanced-hidden').forEach(el => {
            el.classList.remove('enhanced-hidden');
        });
        
        this.isEnhanced = false;
    }
}

// Initialize the enhancer when the script loads
const prEnhancer = new GitHubPREnhancer();

// Clean up when navigating away (for SPA behavior)
window.addEventListener('beforeunload', () => {
    prEnhancer.destroy();
});

// Re-enhance on navigation (GitHub uses Turbo for navigation)
document.addEventListener('turbo:load', () => {
    if (prEnhancer.isEnhanced) {
        prEnhancer.destroy();
    }
    setTimeout(() => prEnhancer.enhance(), 500);
});

// Also listen for pushState/popState for SPA navigation
let lastUrl = location.href;
new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
        lastUrl = url;
        if (prEnhancer.isEnhanced) {
            prEnhancer.destroy();
        }
        setTimeout(() => prEnhancer.enhance(), 500);
    }
}).observe(document, { subtree: true, childList: true });

console.log('GitHub PR Table Enhancer: Content script loaded');