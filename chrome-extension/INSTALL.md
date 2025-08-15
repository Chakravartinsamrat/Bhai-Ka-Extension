# Quick Installation Guide

## Install the Chrome Extension

### 1. Prepare the Extension
- Make sure all files are in the `chrome-extension` folder
- You need these files:
  ```
  manifest.json
  popup.html
  popup.js
  content.js
  background.js
  README.md
  ```

### 2. Load in Chrome
1. Open Google Chrome
2. Type `chrome://extensions/` in the address bar
3. Turn ON "Developer mode" (switch in top-right corner)
4. Click "Load unpacked" button
5. Select the `chrome-extension` folder
6. Click "Select Folder"

### 3. Pin the Extension
1. Click the puzzle piece icon (🧩) in Chrome toolbar
2. Find "ABA Lawyer Scraper" in the list
3. Click the pin icon (📌) to pin it to your toolbar

## How to Use

### Basic Usage
1. **Go to ABA Website**: Navigate to `https://www.americanbar.org`
2. **Find Lawyer Pages**: Look for directories, search results, or lawyer profiles
3. **Click Extension**: Click the ABA Scraper icon in your toolbar
4. **Start Scraping**: Click "🔍 Start Scraping" button
5. **Download Data**: Click "📥 Download CSV" when done

### Example URLs to Try
- `https://www.americanbar.org/directories/lawyers/`
- `https://www.americanbar.org/groups/lawyer_referral/`
- Search for lawyers in your area on the ABA site

### What Gets Scraped
- ✅ Lawyer names
- ✅ Email addresses  
- ✅ Phone numbers
- ✅ Law firm names
- ✅ Locations/addresses

## Troubleshooting

**Extension won't load?**
- Make sure all files are in the correct folder
- Check that manifest.json is valid JSON
- Try refreshing the extensions page

**No data found?**
- Make sure you're on an ABA website page
- Try different ABA directory pages
- Some pages may not have scrapeable data

**Download not working?**
- Check if you have data to download (counter shows > 0)
- Try allowing downloads in Chrome settings
- Clear data and try scraping again

## Important Notes

⚠️ **Legal Compliance**: Only use this tool in accordance with the American Bar Association's terms of service and applicable laws.

🔒 **Privacy**: All data is stored locally in your browser. Nothing is sent to external servers.

🚀 **Performance**: The extension works best on pages with clear lawyer directory structures.

## Need Help?

If you encounter issues:
1. Check the browser console (F12) for error messages
2. Make sure you're on a supported ABA page
3. Try reloading the extension from `chrome://extensions/`

---

Ready to start scraping! 🏛️
