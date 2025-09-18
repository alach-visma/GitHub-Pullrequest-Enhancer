/**
 * GitHub PR Table Enhancer - Configuration Template
 * 
 * Copy this file to 'config.js' and update the values below with your organization's settings.
 * The config.js file should not be committed to version control.
 */

const CONFIG = {
    // JIRA server base URL for PRD linking
    // Example: 'https://your-company.atlassian.net/browse'
    // Example: 'http://your-jira-server/jira/browse'
    jiraBaseUrl: 'YOUR_JIRA_SERVER_URL_HERE',
    
    // Optional: Custom PRD prefix if different from 'PRD'
    // Example: 'TICKET', 'ISSUE', 'REQ'
    prdPrefix: 'PRD'
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
}