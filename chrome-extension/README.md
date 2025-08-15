# CalBar Lawyer Data Scraper - Chrome Extension

A Chrome extension to scrape lawyer contact information from the California Bar Association (CalBar) attorney database.

## Features

- 🔍 **Single Lawyer Scraping**: Scrape individual lawyer profiles
- 🚀 **Bulk Scraping**: Automatically scrape ranges of lawyer IDs
- 📧 **Contact Extraction**: Extracts emails, phone numbers, names, and firm information
- � **Enhanced Data**: Captures bar numbers, admission dates, and status
- �💾 **Data Storage**: Stores scraped data locally in the browser
- 📥 **CSV Export**: Download all scraped data as a spreadsheet
- 🎨 **Clean Interface**: Beautiful, easy-to-use popup interface
- 🚀 **Fast & Lightweight**: No external dependencies

## Installation

1. **Download the Extension**:
   - Download or clone this repository
   - Extract the files to a folder on your computer

2. **Load in Chrome**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `chrome-extension` folder

3. **Pin the Extension**:
   - Click the Extensions icon (puzzle piece) in Chrome toolbar
   - Pin the "CalBar Lawyer Scraper" extension for easy access

## How to Use

### Method 1: Single Lawyer Scraping
1. **Navigate to CalBar**: Go to a specific lawyer profile page
   - Format: `https://apps.calbar.ca.gov/attorney/Licensee/Detail/{number}`
   - Example: `https://apps.calbar.ca.gov/attorney/Licensee/Detail/123456`
2. **Scrape**: Click the extension icon → "🔍 Scrape Current Lawyer"
3. **View Results**: The extension will extract and store the lawyer's data

### Method 2: Bulk Scraping (Recommended)
1. **Open Extension**: Click the extension icon in your toolbar
2. **Enable Bulk Mode**: Click "� Bulk Scrape (Range)"
3. **Set Range**: 
   - Start ID: Beginning lawyer ID number (e.g., 100000)
   - End ID: Ending lawyer ID number (e.g., 100100)
   - Delay: Time between requests in milliseconds (default: 2000ms)
4. **Start Scraping**: Click "▶️ Start Bulk Scrape"
5. **Monitor Progress**: Watch the progress in the popup
6. **Download**: Use "📥 Download CSV" when complete

### Data Management
- **View Count**: See total scraped lawyers in the popup badge
- **Download CSV**: Export all data to a spreadsheet
- **Clear Data**: Remove all stored information

## What Data is Extracted

The extension captures comprehensive lawyer information:

| Field | Description | Examples |
|-------|-------------|----------|
| **Name** | Lawyer's full name | "John Smith", "Jane Doe" |
| **Email** | Contact email address | "john@lawfirm.com" |
| **Phone** | Phone number (various formats) | "(555) 123-4567", "555-123-4567" |
| **Firm** | Law firm or organization | "Smith & Associates" |
| **Location** | Address or office location | "San Francisco, CA" |
| **Bar Number** | California Bar license number | "123456" |
| **Status** | License status | "Active", "Inactive", etc. |
| **Admission Date** | Date admitted to the bar | "01/15/2010" |
| **URL** | Source page URL | CalBar profile link |
| **Scraped Date** | When data was collected | ISO timestamp |

## URL Structure

The CalBar database uses a simple ID-based system:
```
https://apps.calbar.ca.gov/attorney/Licensee/Detail/{ID}
```

Where `{ID}` is a sequential number. You can:
- Find specific lawyers by trying different ID numbers
- Use bulk scraping to systematically collect data across ID ranges
- Identify valid ID ranges by testing different numbers

## Technical Details

### File Structure
```
chrome-extension/
├── manifest.json       # Extension configuration
├── popup.html          # Main interface with bulk scraping controls
├── popup.js           # Interface logic with bulk scraping
├── content.js         # CalBar-specific scraping logic
├── background.js      # Background processes
├── icons/             # Extension icons
└── README.md          # This file
```

### How It Works

1. **Single Scraping**: Analyzes the current CalBar lawyer detail page
2. **Bulk Scraping**: 
   - Opens new tabs with sequential lawyer IDs
   - Scrapes each page automatically
   - Closes tabs after data extraction
   - Includes configurable delays to avoid rate limiting
3. **Smart Selectors**: Uses multiple strategies to find data:
   - CSS selectors for common elements
   - Table parsing for structured data
   - Definition list extraction
   - Pattern matching for emails and phones
4. **Data Storage**: Uses Chrome's local storage
5. **Duplicate Prevention**: Filters duplicates based on bar number or name

### Bulk Scraping Features

- **Range Selection**: Specify start and end lawyer ID numbers
- **Progress Tracking**: Real-time progress updates
- **Rate Limiting**: Configurable delays between requests
- **Error Handling**: Continues scraping even if some IDs fail
- **Stop Control**: Ability to stop bulk scraping mid-process

## Privacy & Security

- ✅ **Local Storage Only**: All data stays in your browser
- ✅ **No External Servers**: No data is sent to third parties
- ✅ **CalBar Sites Only**: Only works on apps.calbar.ca.gov
- ✅ **Open Source**: All code is visible and auditable
- ✅ **Rate Limited**: Built-in delays to be respectful to the server

## Best Practices

### Responsible Scraping
1. **Use Reasonable Delays**: Keep the default 2-second delay or higher
2. **Limit Range Sizes**: Don't scrape more than 1000 records at once
3. **Scrape During Off-Hours**: Avoid peak usage times
4. **Respect the Server**: Don't overload the CalBar website

### Effective Usage
1. **Start Small**: Test with ranges of 10-50 IDs first
2. **Find Valid Ranges**: Not all ID numbers have active lawyers
3. **Monitor Progress**: Watch for patterns in successful vs. failed scrapes
4. **Regular Exports**: Download CSV files regularly to avoid data loss

## Limitations

- Only works on California Bar Association website
- Depends on CalBar website structure (updates may affect scraping)
- Limited by Chrome extension security policies
- Sequential ID scraping may miss some lawyers if IDs are not continuous
- Bulk scraping requires manual monitoring

## Legal Notice

⚖️ **Important**: 
- This tool is for educational and research purposes
- Respect the California Bar Association's Terms of Service
- Use scraped data responsibly and in compliance with applicable laws
- Consider the website's robots.txt and terms of use
- Be mindful of rate limiting and server load

## Troubleshooting

### Extension Not Working
1. Check that you're on an `apps.calbar.ca.gov` page
2. Refresh the page and try again
3. Check the browser console for error messages
4. Reload the extension from `chrome://extensions/`

### Bulk Scraping Issues
1. **High Error Rate**: Try smaller ID ranges or increase delay
2. **Slow Performance**: Reduce range size or increase delay time
3. **Extension Freezes**: Stop and restart, try smaller batches
4. **No Data Found**: Verify the ID range contains valid lawyers

### CSV Download Issues
1. Make sure you have scraped data first (counter shows > 0)
2. Check your browser's download settings
3. Try clearing data and scraping again

## Example Usage

### Finding Lawyer ID Ranges
1. Try some test IDs manually:
   - `https://apps.calbar.ca.gov/attorney/Licensee/Detail/100000`
   - `https://apps.calbar.ca.gov/attorney/Licensee/Detail/200000`
   - `https://apps.calbar.ca.gov/attorney/Licensee/Detail/300000`

2. Look for patterns in successful responses
3. Use bulk scraping on promising ranges

### Bulk Scraping Workflow
1. **Test Range**: Start with 10-20 IDs to test
2. **Expand**: Gradually increase range size
3. **Monitor**: Watch success/error rates
4. **Export**: Download CSV regularly
5. **Continue**: Move to next ID range

## Support

If you encounter issues:
1. Check this README for troubleshooting tips
2. Review the browser console for error messages
3. Ensure you're using the latest version of Chrome
4. Verify you're on the correct CalBar website

---

**Disclaimer**: This extension is not affiliated with the California Bar Association. It's an independent tool for educational and research purposes. Users are responsible for complying with all applicable terms of service and laws.

## Development

### Modifying the Extension

1. **Edit Files**: Modify the JavaScript, HTML, or CSS files
2. **Reload Extension**: Go to `chrome://extensions/` and click the reload button
3. **Test**: Try the extension on ABA pages

### Adding New Selectors

Edit `content.js` and add new CSS selectors to the `selectors` object:

```javascript
const selectors = {
    names: ['.lawyer-name', '.your-new-selector'],
    emails: ['a[href^="mailto:"]', '.your-email-selector'],
    // ... add more selectors
};
```

### Debugging

- Open Chrome DevTools (F12) on any ABA page
- Check the Console tab for extension messages
- Use `chrome://extensions/` to view extension errors

## Version History

- **v1.0**: Initial release with basic scraping functionality

## Support

If you encounter issues:
1. Check this README for troubleshooting tips
2. Review the browser console for error messages
3. Ensure you're using the latest version of Chrome
4. Verify you're on a supported ABA website page

---

**Disclaimer**: This extension is not affiliated with the American Bar Association. It's an independent tool for data extraction research purposes.
