// Content script for scraping CalBar lawyer data
console.log('CalBar Lawyer Scraper content script loaded');

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'scrape') {
        console.log('Starting CalBar scrape operation...');
        scrapeCalBarLawyerData().then(result => {
            sendResponse(result);
        }).catch(error => {
            console.error('Scraping error:', error);
            sendResponse({success: false, error: error.message});
        });
        return true; // Keep message channel open for async response
    }
});

async function scrapeCalBarLawyerData() {
    try {
        const currentUrl = window.location.href;
        
        // Check if we're on a CalBar lawyer detail page
        if (!currentUrl.includes('apps.calbar.ca.gov/attorney/Licensee/Detail/')) {
            return {success: false, message: 'Not on a CalBar lawyer detail page'};
        }
        
        // Wait a moment for dynamic content to load
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const lawyer = {
            name: '',
            email: '',
            phone: '',
            firm: '',
            location: '',
            barNumber: '',
            status: '',
            admissionDate: '',
            url: currentUrl,
            scrapedDate: new Date().toISOString()
        };
        
        // Extract lawyer ID from URL
        const urlMatch = currentUrl.match(/\/Detail\/(\d+)/);
        if (urlMatch) {
            lawyer.barNumber = urlMatch[1];
        }
        
        // CalBar specific selectors and extraction
        extractCalBarData(lawyer);
        
        // Only proceed if we found meaningful data
        if (lawyer.name || lawyer.email || lawyer.barNumber) {
            // Store in Chrome storage
            const existingData = await chrome.storage.local.get(['lawyerData']);
            const allLawyers = [...(existingData.lawyerData || []), lawyer];
            
            // Remove duplicates based on bar number or name
            const uniqueLawyers = allLawyers.filter((l, index, arr) => {
                return index === arr.findIndex(existing => 
                    (l.barNumber && l.barNumber === existing.barNumber) || 
                    (l.name && l.name === existing.name && l.firm === existing.firm)
                );
            });
            
            await chrome.storage.local.set({lawyerData: uniqueLawyers});
            console.log(`Scraped lawyer: ${lawyer.name || 'Unknown'} (${lawyer.barNumber})`);
            
            return {
                success: true,
                count: 1,
                total: uniqueLawyers.length,
                lawyer: lawyer
            };
        }
        
        return {success: false, message: 'No lawyer data found on this page'};
        
    } catch (error) {
        console.error('Error in scrapeCalBarLawyerData:', error);
        throw error;
    }
}

function extractCalBarData(lawyer) {
    // CalBar website has specific structure - adapt these selectors based on actual site
    const selectors = {
        name: [
            'h1',
            '.attorney-name',
            '.licensee-name', 
            '[data-field="name"]',
            '.detail-name',
            '.profile-name'
        ],
        
        status: [
            '.status',
            '.attorney-status',
            '.licensee-status',
            '[data-field="status"]'
        ],
        
        email: [
            'a[href^="mailto:"]',
            '.email',
            '.contact-email',
            '[data-field="email"]'
        ],
        
        phone: [
            '.phone',
            '.telephone',
            '.contact-phone',
            'a[href^="tel:"]',
            '[data-field="phone"]'
        ],
        
        firm: [
            '.firm',
            '.firm-name',
            '.organization',
            '.employer',
            '[data-field="firm"]',
            '.practice-name'
        ],
        
        address: [
            '.address',
            '.location',
            '.contact-address',
            '[data-field="address"]'
        ],
        
        admissionDate: [
            '.admission-date',
            '.bar-date',
            '[data-field="admission"]',
            '.date-admitted'
        ]
    };
    
    // Extract name
    for (const selector of selectors.name) {
        const element = document.querySelector(selector);
        if (element && element.textContent.trim()) {
            lawyer.name = cleanText(element.textContent);
            break;
        }
    }
    
    // Extract status
    for (const selector of selectors.status) {
        const element = document.querySelector(selector);
        if (element && element.textContent.trim()) {
            lawyer.status = cleanText(element.textContent);
            break;
        }
    }
    
    // Extract email
    for (const selector of selectors.email) {
        const element = document.querySelector(selector);
        if (element) {
            if (element.href && element.href.startsWith('mailto:')) {
                lawyer.email = element.href.replace('mailto:', '');
                break;
            } else if (element.textContent.includes('@')) {
                lawyer.email = extractEmailFromText(element.textContent);
                break;
            }
        }
    }
    
    // Extract phone
    for (const selector of selectors.phone) {
        const element = document.querySelector(selector);
        if (element) {
            if (element.href && element.href.startsWith('tel:')) {
                lawyer.phone = element.href.replace('tel:', '');
                break;
            } else if (element.textContent.trim()) {
                lawyer.phone = extractPhoneFromText(element.textContent);
                break;
            }
        }
    }
    
    // Extract firm
    for (const selector of selectors.firm) {
        const element = document.querySelector(selector);
        if (element && element.textContent.trim()) {
            lawyer.firm = cleanText(element.textContent);
            break;
        }
    }
    
    // Extract address/location
    for (const selector of selectors.address) {
        const element = document.querySelector(selector);
        if (element && element.textContent.trim()) {
            lawyer.location = cleanText(element.textContent);
            break;
        }
    }
    
    // Extract admission date
    for (const selector of selectors.admissionDate) {
        const element = document.querySelector(selector);
        if (element && element.textContent.trim()) {
            lawyer.admissionDate = cleanText(element.textContent);
            break;
        }
    }
    
    // Fallback: search the entire page for patterns
    const pageText = document.body.textContent;
    
    if (!lawyer.email) {
        lawyer.email = extractEmailFromText(pageText);
    }
    
    if (!lawyer.phone) {
        lawyer.phone = extractPhoneFromText(pageText);
    }
    
    // Try to extract from tables (common in lawyer detail pages)
    const tables = document.querySelectorAll('table');
    for (const table of tables) {
        extractFromTable(table, lawyer);
    }
    
    // Try to extract from definition lists
    const dlElements = document.querySelectorAll('dl');
    for (const dl of dlElements) {
        extractFromDefinitionList(dl, lawyer);
    }
}

function extractFromTable(table, lawyer) {
    const rows = table.querySelectorAll('tr');
    for (const row of rows) {
        const cells = row.querySelectorAll('td, th');
        if (cells.length >= 2) {
            const label = cells[0].textContent.trim().toLowerCase();
            const value = cells[1].textContent.trim();
            
            if (value) {
                if (label.includes('name') && !lawyer.name) {
                    lawyer.name = cleanText(value);
                } else if (label.includes('email') && !lawyer.email) {
                    lawyer.email = extractEmailFromText(value);
                } else if (label.includes('phone') && !lawyer.phone) {
                    lawyer.phone = extractPhoneFromText(value);
                } else if ((label.includes('firm') || label.includes('organization')) && !lawyer.firm) {
                    lawyer.firm = cleanText(value);
                } else if ((label.includes('address') || label.includes('location')) && !lawyer.location) {
                    lawyer.location = cleanText(value);
                } else if (label.includes('status') && !lawyer.status) {
                    lawyer.status = cleanText(value);
                } else if ((label.includes('admission') || label.includes('bar date')) && !lawyer.admissionDate) {
                    lawyer.admissionDate = cleanText(value);
                }
            }
        }
    }
}

function extractFromDefinitionList(dl, lawyer) {
    const terms = dl.querySelectorAll('dt');
    const definitions = dl.querySelectorAll('dd');
    
    for (let i = 0; i < Math.min(terms.length, definitions.length); i++) {
        const label = terms[i].textContent.trim().toLowerCase();
        const value = definitions[i].textContent.trim();
        
        if (value) {
            if (label.includes('name') && !lawyer.name) {
                lawyer.name = cleanText(value);
            } else if (label.includes('email') && !lawyer.email) {
                lawyer.email = extractEmailFromText(value);
            } else if (label.includes('phone') && !lawyer.phone) {
                lawyer.phone = extractPhoneFromText(value);
            } else if ((label.includes('firm') || label.includes('organization')) && !lawyer.firm) {
                lawyer.firm = cleanText(value);
            } else if ((label.includes('address') || label.includes('location')) && !lawyer.location) {
                lawyer.location = cleanText(value);
            } else if (label.includes('status') && !lawyer.status) {
                lawyer.status = cleanText(value);
            } else if ((label.includes('admission') || label.includes('bar date')) && !lawyer.admissionDate) {
                lawyer.admissionDate = cleanText(value);
            }
        }
    }
}

function cleanText(text) {
    return text.trim().replace(/\s+/g, ' ').replace(/\n/g, ' ');
}

function extractEmailFromText(text) {
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    return emailMatch ? emailMatch[0] : '';
}

function extractPhoneFromText(text) {
    // Match various phone number formats
    const phonePatterns = [
        /\(\d{3}\)\s*\d{3}-\d{4}/,  // (123) 456-7890
        /\d{3}-\d{3}-\d{4}/,        // 123-456-7890
        /\d{3}\.\d{3}\.\d{4}/,      // 123.456.7890
        /\d{3}\s\d{3}\s\d{4}/,      // 123 456 7890
        /\+?1?\s*\(\d{3}\)\s*\d{3}-\d{4}/, // +1 (123) 456-7890
        /\+?1?\s*\d{3}-\d{3}-\d{4}/ // +1 123-456-7890
    ];
    
    for (const pattern of phonePatterns) {
        const match = text.match(pattern);
        if (match) {
            return match[0].trim();
        }
    }
    
    return '';
}

function extractEmailFromText(text) {
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    return emailMatch ? emailMatch[0] : '';
}

function extractPhoneFromText(text) {
    // Match various phone number formats
    const phonePatterns = [
        /\(\d{3}\)\s*\d{3}-\d{4}/,  // (123) 456-7890
        /\d{3}-\d{3}-\d{4}/,        // 123-456-7890
        /\d{3}\.\d{3}\.\d{4}/,      // 123.456.7890
        /\d{3}\s\d{3}\s\d{4}/,      // 123 456 7890
        /\+?1?\s*\(\d{3}\)\s*\d{3}-\d{4}/, // +1 (123) 456-7890
        /\+?1?\s*\d{3}-\d{3}-\d{4}/ // +1 123-456-7890
    ];
    
    for (const pattern of phonePatterns) {
        const match = text.match(pattern);
        if (match) {
            return match[0].trim();
        }
    }
    
    return '';
}

// Auto-inject a visual indicator when the script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addVisualIndicator);
} else {
    addVisualIndicator();
}

function addVisualIndicator() {
    // Add a small visual indicator that the extension is active
    const indicator = document.createElement('div');
    indicator.id = 'calbar-scraper-indicator';
    indicator.innerHTML = '⚖️ CalBar Scraper Active';
    indicator.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: #1976D2;
        color: white;
        padding: 8px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: bold;
        z-index: 10000;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        opacity: 0.9;
        font-family: Arial, sans-serif;
    `;
    
    document.body.appendChild(indicator);
    
    // Fade out after 3 seconds
    setTimeout(() => {
        indicator.style.transition = 'opacity 1s ease';
        indicator.style.opacity = '0';
        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.parentNode.removeChild(indicator);
            }
        }, 1000);
    }, 3000);
}
