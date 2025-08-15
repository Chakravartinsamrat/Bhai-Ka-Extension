// Background script for ABA Lawyer Scraper
console.log('ABA Lawyer Scraper background script loaded');

// Handle installation
chrome.runtime.onInstalled.addListener((details) => {
    console.log('Extension installed:', details);
    
    if (details.reason === 'install') {
        // Initialize storage
        chrome.storage.local.set({
            lawyerData: [],
            settings: {
                autoScrape: false,
                maxResults: 1000
            }
        });
        
        console.log('Extension initialized with default settings');
    }
});

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Background received message:', message);
    
    if (message.action === 'lawyerScraped') {
        // Handle when new lawyer data is scraped
        updateBadge(message.count);
        sendResponse({success: true});
    } else if (message.action === 'getBadgeCount') {
        // Get current count for badge
        chrome.storage.local.get(['lawyerData'], (result) => {
            const count = (result.lawyerData || []).length;
            sendResponse({count: count});
        });
        return true; // Keep message channel open
    }
});

// Update extension badge with count
async function updateBadge(count) {
    try {
        if (count > 0) {
            await chrome.action.setBadgeText({text: count.toString()});
            await chrome.action.setBadgeBackgroundColor({color: '#4CAF50'});
        } else {
            await chrome.action.setBadgeText({text: ''});
        }
    } catch (error) {
        console.error('Error updating badge:', error);
    }
}

// Update badge when storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.lawyerData) {
        const newCount = (changes.lawyerData.newValue || []).length;
        updateBadge(newCount);
    }
});

// Initialize badge on startup
chrome.storage.local.get(['lawyerData'], (result) => {
    const count = (result.lawyerData || []).length;
    updateBadge(count);
});

// Handle tab updates to check if we're on ABA site
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        if (tab.url.includes('americanbar.org')) {
            console.log('User navigated to ABA site:', tab.url);
            // Could potentially show a notification or update icon
        }
    }
});

// Context menu for right-click scraping (optional)
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'scrapeContact',
        title: 'Scrape Contact Info',
        contexts: ['selection', 'page'],
        documentUrlPatterns: ['*://*.americanbar.org/*']
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'scrapeContact') {
        // Send message to content script to scrape
        chrome.tabs.sendMessage(tab.id, {action: 'scrape'});
    }
});

// Utility function to validate scraped data
function validateLawyerData(lawyer) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /[\d\s\-\(\)\.]{10,}/;
    
    return {
        hasValidEmail: lawyer.email && emailRegex.test(lawyer.email),
        hasValidPhone: lawyer.phone && phoneRegex.test(lawyer.phone),
        hasName: lawyer.name && lawyer.name.length > 2,
        isValid: function() {
            return this.hasValidEmail || this.hasValidPhone || this.hasName;
        }
    };
}

// Export data cleanup utility
async function cleanupData() {
    try {
        const result = await chrome.storage.local.get(['lawyerData']);
        const lawyers = result.lawyerData || [];
        
        // Remove duplicates and invalid entries
        const cleanedLawyers = lawyers.filter((lawyer, index, arr) => {
            const validation = validateLawyerData(lawyer);
            if (!validation.isValid()) return false;
            
            // Check for duplicates
            return index === arr.findIndex(l => 
                l.email === lawyer.email || 
                (l.name === lawyer.name && l.firm === lawyer.firm)
            );
        });
        
        await chrome.storage.local.set({lawyerData: cleanedLawyers});
        console.log(`Cleaned data: ${lawyers.length} -> ${cleanedLawyers.length}`);
        
        return cleanedLawyers.length;
    } catch (error) {
        console.error('Error cleaning data:', error);
        return 0;
    }
}

// Periodic cleanup (every hour)
setInterval(cleanupData, 60 * 60 * 1000);
