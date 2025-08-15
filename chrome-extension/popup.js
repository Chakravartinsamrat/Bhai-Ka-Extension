// Popup script for CalBar Lawyer Scraper
document.addEventListener('DOMContentLoaded', function() {
    const scrapeBtn = document.getElementById('scrapeBtn');
    const bulkScrapeBtn = document.getElementById('bulkScrapeBtn');
    const startBulkBtn = document.getElementById('startBulkBtn');
    const stopBulkBtn = document.getElementById('stopBulkBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const clearBtn = document.getElementById('clearBtn');
    const status = document.getElementById('status');
    const countElement = document.getElementById('count');
    const bulkOptions = document.getElementById('bulkOptions');
    
    let bulkScrapeActive = false;
    
    // Update count on load
    updateCount();
    
    scrapeBtn.addEventListener('click', async function() {
        try {
            // Get active tab
            const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
            
            if (!tab.url.includes('calbar.ca.gov')) {
                showStatus('❌ Please navigate to apps.calbar.ca.gov first', 'error');
                return;
            }
            
            showStatus('<div class="spinner"></div>Scraping current lawyer...', 'loading');
            scrapeBtn.disabled = true;
            
            // Execute content script
            const results = await chrome.tabs.sendMessage(tab.id, {action: 'scrape'});
            
            if (results && results.success) {
                showStatus(`✅ Found lawyer data`, 'success');
                updateCount();
            } else {
                showStatus('❌ No lawyer data found on this page', 'error');
            }
            
        } catch (error) {
            console.error('Scraping error:', error);
            showStatus('❌ Error occurred during scraping', 'error');
        } finally {
            scrapeBtn.disabled = false;
        }
    });
    
    // Toggle bulk scrape options
    bulkScrapeBtn.addEventListener('click', function() {
        bulkOptions.style.display = bulkOptions.style.display === 'none' ? 'block' : 'none';
    });
    
    // Start bulk scraping
    startBulkBtn.addEventListener('click', async function() {
        const startId = parseInt(document.getElementById('startId').value);
        const endId = parseInt(document.getElementById('endId').value);
        const delay = parseInt(document.getElementById('delayMs').value) || 2000;
        
        if (!startId || !endId || startId >= endId) {
            showStatus('❌ Please enter valid ID range', 'error');
            return;
        }
        
        if (endId - startId > 1000) {
            if (!confirm('Large range detected. This may take a long time. Continue?')) {
                return;
            }
        }
        
        bulkScrapeActive = true;
        startBulkBtn.style.display = 'none';
        stopBulkBtn.style.display = 'block';
        
        try {
            await startBulkScraping(startId, endId, delay);
        } catch (error) {
            console.error('Bulk scraping error:', error);
            showStatus('❌ Bulk scraping stopped due to error', 'error');
        } finally {
            bulkScrapeActive = false;
            startBulkBtn.style.display = 'block';
            stopBulkBtn.style.display = 'none';
        }
    });
    
    // Stop bulk scraping
    stopBulkBtn.addEventListener('click', function() {
        bulkScrapeActive = false;
        showStatus('⏹️ Bulk scraping stopped', 'info');
        startBulkBtn.style.display = 'block';
        stopBulkBtn.style.display = 'none';
    });
    
    downloadBtn.addEventListener('click', async function() {
        try {
            const data = await chrome.storage.local.get(['lawyerData']);
            const lawyers = data.lawyerData || [];
            
            if (lawyers.length === 0) {
                showStatus('❌ No data to download', 'error');
                return;
            }
            
            downloadCSV(lawyers);
            showStatus(`✅ Downloaded ${lawyers.length} records`, 'success');
            
        } catch (error) {
            console.error('Download error:', error);
            showStatus('❌ Error downloading data', 'error');
        }
    });
    
    clearBtn.addEventListener('click', async function() {
        try {
            await chrome.storage.local.remove(['lawyerData']);
            showStatus('🗑️ Data cleared', 'success');
            updateCount();
        } catch (error) {
            console.error('Clear error:', error);
            showStatus('❌ Error clearing data', 'error');
        }
    });
    
    async function updateCount() {
        try {
            const data = await chrome.storage.local.get(['lawyerData']);
            const count = (data.lawyerData || []).length;
            countElement.textContent = count;
        } catch (error) {
            console.error('Error updating count:', error);
            countElement.textContent = '0';
        }
    }
    
    function showStatus(message, type = 'info') {
        status.innerHTML = message;
        status.className = `status ${type}`;
        
        // Auto-clear status after 3 seconds for non-loading messages
        if (type !== 'loading') {
            setTimeout(() => {
                status.innerHTML = 'Ready to scrape';
                status.className = 'status';
            }, 3000);
        }
    }
    
    function downloadCSV(data) {
        // Create CSV content
        const headers = ['Name', 'Email', 'Phone', 'Firm', 'Location', 'Bar Number', 'Status', 'Admission Date', 'URL', 'Scraped Date'];
        const csvContent = [
            headers.join(','),
            ...data.map(lawyer => [
                escapeCSV(lawyer.name || ''),
                escapeCSV(lawyer.email || ''),
                escapeCSV(lawyer.phone || ''),
                escapeCSV(lawyer.firm || ''),
                escapeCSV(lawyer.location || ''),
                escapeCSV(lawyer.barNumber || ''),
                escapeCSV(lawyer.status || ''),
                escapeCSV(lawyer.admissionDate || ''),
                escapeCSV(lawyer.url || ''),
                escapeCSV(lawyer.scrapedDate || '')
            ].join(','))
        ].join('\n');
        
        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `calbar_lawyers_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    function escapeCSV(str) {
        if (str === null || str === undefined) return '';
        str = str.toString();
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
    }
    
    // Bulk scraping function
    async function startBulkScraping(startId, endId, delay) {
        let successCount = 0;
        let errorCount = 0;
        
        for (let id = startId; id <= endId && bulkScrapeActive; id++) {
            try {
                showStatus(`<div class="spinner"></div>Scraping ID ${id} (${id - startId + 1}/${endId - startId + 1})`, 'loading');
                
                // Create new tab with the lawyer URL
                const tab = await chrome.tabs.create({
                    url: `https://apps.calbar.ca.gov/attorney/Licensee/Detail/${id}`,
                    active: false
                });
                
                // Wait for tab to load
                await new Promise(resolve => {
                    chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
                        if (tabId === tab.id && info.status === 'complete') {
                            chrome.tabs.onUpdated.removeListener(listener);
                            resolve();
                        }
                    });
                });
                
                // Wait a bit more for content to load
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                try {
                    // Scrape the page
                    const results = await chrome.tabs.sendMessage(tab.id, {action: 'scrape'});
                    
                    if (results && results.success) {
                        successCount++;
                    } else {
                        errorCount++;
                    }
                } catch (scrapeError) {
                    console.log(`No data found for ID ${id}`);
                    errorCount++;
                }
                
                // Close the tab
                await chrome.tabs.remove(tab.id);
                
                // Update count display
                updateCount();
                
                // Wait before next request
                if (id < endId && bulkScrapeActive) {
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
                
            } catch (error) {
                console.error(`Error scraping ID ${id}:`, error);
                errorCount++;
                
                // Continue with next ID
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        
        if (bulkScrapeActive) {
            showStatus(`✅ Bulk scraping complete! Success: ${successCount}, Errors: ${errorCount}`, 'success');
        }
    }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'updateCount') {
        const countElement = document.getElementById('count');
        if (countElement) {
            countElement.textContent = message.count;
        }
    }
});
