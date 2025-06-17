// Trade Journal Sync with Google Sheets
// This module logs all trades to Google Sheets for record keeping and analysis

// Browser-compatible approach for Google Sheets
class TradeLogger {
    constructor() {
        this.initialized = false;
        this.trades = [];
        this.spreadsheetId = '';
    }
    
    // Initialize the logger and connect to Google Sheets
    async init(sheetId = null) {
        try {
            // Load saved trades from localStorage for persistence between sessions
            this.loadSavedTrades();
            
            // Initialize the Google API client
            await this.initGoogleAPI();
            
            // If a sheet ID was provided, use it, otherwise create a new spreadsheet
            if (sheetId) {
                this.spreadsheetId = sheetId;
                console.log(`Connected to existing Google Sheet ID: "${sheetId}"`);
            } else {
                // Create a new Google Sheet
                await this.createNewSpreadsheet();
            }
            
            this.initialized = true;
            return true;
        } catch (error) {
            console.error('Error initializing TradeLogger:', error);
            return false;
        }
    }
    
    // Initialize Google API client
    async initGoogleAPI() {
        return new Promise((resolve, reject) => {
            gapi.load('client:auth2', async () => {
                try {
                    // Initialize the Google API client with your API key and client ID
                    await gapi.client.init({
                        apiKey: 'YOUR_API_KEY', // Replace with your actual API key
                        clientId: 'your-client-id', // From credentials.json
                        discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
                        scope: 'https://www.googleapis.com/auth/spreadsheets'
                    });
                    
                    // Sign in the user
                    if (!gapi.auth2.getAuthInstance().isSignedIn.get()) {
                        await gapi.auth2.getAuthInstance().signIn();
                    }
                    
                    console.log('Google API initialized successfully');
                    resolve();
                } catch (error) {
                    console.error('Error initializing Google API client:', error);
                    reject(error);
                }
            });
        });
    }
    
    // Create a new Google Spreadsheet
    async createNewSpreadsheet() {
        try {
            const date = new Date().toLocaleDateString().replace(/\//g, '-');
            const response = await gapi.client.sheets.spreadsheets.create({
                properties: {
                    title: `IQTS Trade Journal - ${date}`
                },
                sheets: [
                    {
                        properties: {
                            title: 'Trades',
                            gridProperties: {
                                frozenRowCount: 1
                            }
                        }
                    },
                    {
                        properties: {
                            title: 'Performance',
                            gridProperties: {
                                frozenRowCount: 1
                            }
                        }
                    }
                ]
            });
            
            this.spreadsheetId = response.result.spreadsheetId;
            console.log(`Created new Google Sheet with ID: "${this.spreadsheetId}"`);
            
            // Set up the headers in the Trades sheet
            await this.setupTradesSheet();
            
            // Store the spreadsheet ID in localStorage for future use
            localStorage.setItem('iqts_sheet_id', this.spreadsheetId);
            
            // Open the spreadsheet in a new tab
            window.open(`https://docs.google.com/spreadsheets/d/${this.spreadsheetId}`, '_blank');
            
            return this.spreadsheetId;
        } catch (error) {
            console.error('Error creating new spreadsheet:', error);
            throw error;
        }
    }
    
    // Setup the headers and formatting for the Trades sheet
    async setupTradesSheet() {
        try {
            // Define the headers
            const headers = [
                'Timestamp', 'Symbol', 'Type', 'Price', 'Quantity', 
                'Total Value', '% Return', 'Confidence', 'Notes'
            ];
            
            // Add headers to the first row
            await gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId: this.spreadsheetId,
                range: 'Trades!A1:I1',
                valueInputOption: 'USER_ENTERED',
                resource: {
                    values: [headers]
                }
            });
            
            // Format the header row
            await gapi.client.sheets.spreadsheets.batchUpdate({
                spreadsheetId: this.spreadsheetId,
                resource: {
                    requests: [
                        {
                            repeatCell: {
                                range: {
                                    sheetId: 0,
                                    startRowIndex: 0,
                                    endRowIndex: 1,
                                    startColumnIndex: 0,
                                    endColumnIndex: headers.length
                                },
                                cell: {
                                    userEnteredFormat: {
                                        backgroundColor: {
                                            red: 0.2,
                                            green: 0.2,
                                            blue: 0.2
                                        },
                                        textFormat: {
                                            bold: true,
                                            foregroundColor: {
                                                red: 1.0,
                                                green: 1.0,
                                                blue: 1.0
                                            }
                                        }
                                    }
                                },
                                fields: 'userEnteredFormat(backgroundColor,textFormat)'
                            }
                        },
                        // Auto-resize columns
                        {
                            autoResizeDimensions: {
                                dimensions: {
                                    sheetId: 0,
                                    dimension: 'COLUMNS',
                                    startIndex: 0,
                                    endIndex: headers.length
                                }
                            }
                        }
                    ]
                }
            });
            
            console.log('Trades sheet headers set up successfully');
        } catch (error) {
            console.error('Error setting up Trades sheet:', error);
            throw error;
        }
    }      // Log a trade to Google Sheets
    async logToGoogleSheet(trade) {
        if (!this.initialized) {
            console.warn('TradeLogger not initialized. Call init() first.');
            return false;
        }
        
        try {
            const timestamp = new Date().toLocaleString();
            
            // Store in local array for quick access and display
            const tradeWithTimestamp = {
                ...trade,
                timestamp
            };
            
            this.trades.push(tradeWithTimestamp);
            
            // Save to localStorage for persistence
            localStorage.setItem('iqts_trade_log', JSON.stringify(this.trades));
            
            // Calculate the total value
            const totalValue = (parseFloat(trade.price) * parseFloat(trade.quantity)).toFixed(2);
            
            // Only proceed with Google Sheets if we have a spreadsheet ID
            if (this.spreadsheetId) {
                // Get the next available row
                const response = await gapi.client.sheets.spreadsheets.values.get({
                    spreadsheetId: this.spreadsheetId,
                    range: 'Trades!A:A'
                });
                
                const nextRow = response.result.values ? response.result.values.length + 1 : 2;
                
                // Add the trade data to the sheet
                await gapi.client.sheets.spreadsheets.values.update({
                    spreadsheetId: this.spreadsheetId,
                    range: `Trades!A${nextRow}:I${nextRow}`,
                    valueInputOption: 'USER_ENTERED',
                    resource: {
                        values: [[
                            timestamp,
                            trade.symbol || '',
                            trade.type || '',
                            trade.price || '',
                            trade.quantity || '',
                            totalValue,
                            trade.percentReturn || '0.0',
                            trade.confidence || '',
                            trade.notes || ''
                        ]]
                    }
                });
                
                console.log(`Trade logged to Google Sheet: ${trade.type} ${trade.symbol} at ${trade.price}`);
            } else {
                console.log(`Would add trade to Google Sheet (if connected): ${trade.type} ${trade.symbol} at ${trade.price}`);
            }
            
            return true;
        } catch (error) {
            console.error('Error logging trade:', error);
            return false;
        }
    }
      // Add a new method to manually log a trade (useful for testing)
    logTrade(trade) {
        const timestamp = new Date().toLocaleString();
        
        // Create a complete trade object
        const completeTradeObj = {
            symbol: trade.symbol || "AAPL",
            type: trade.type || "buy",
            price: trade.price || "150.25",
            quantity: trade.quantity || "10",
            percentReturn: trade.percentReturn || "0.0",
            confidence: trade.confidence || "medium",
            timestamp
        };
        
        // Add to local array
        this.trades.push(completeTradeObj);
        
        // Save to localStorage for persistence
        localStorage.setItem('iqts_trade_log', JSON.stringify(this.trades));
        
        console.log(`Trade manually logged: ${completeTradeObj.type} ${completeTradeObj.symbol}`);
        return true;
    }
    
    // Get today's trades
    getTodaysTrades() {
        const today = new Date().toDateString();
        return this.trades.filter(trade => {
            const tradeDate = new Date(trade.timestamp).toDateString();
            return tradeDate === today;
        });
    }
    
    // Get win rate calculation
    getWinRate() {
        if (this.trades.length === 0) return 0;
        
        const winningTrades = this.trades.filter(trade => 
            trade.percentReturn && parseFloat(trade.percentReturn) > 0
        ).length;
        
        return (winningTrades / this.trades.length) * 100;
    }
    
    // Get average hold time
    getAverageHoldTime() {
        if (this.trades.length === 0) return "0m";
        
        // This would require having entry and exit timestamps
        // For demo purposes returning a fixed value
        return "45m";
    }
    
    // Get average profit
    getAverageProfit() {
        if (this.trades.length === 0) return 0;
        
        const totalReturn = this.trades.reduce((sum, trade) => 
            sum + (parseFloat(trade.percentReturn) || 0), 0
        );
        
        return totalReturn / this.trades.length;
    }
    
    // Get monthly gain
    getMonthlyGain() {
        const currentMonth = new Date().getMonth();
        const monthlyTrades = this.trades.filter(trade => 
            new Date(trade.timestamp).getMonth() === currentMonth
        );
        
        if (monthlyTrades.length === 0) return 0;
        
        const monthlyReturn = monthlyTrades.reduce((sum, trade) => 
            sum + (parseFloat(trade.percentReturn) || 0), 0
        );
        
        return monthlyReturn;
    }
    
    // Get all performance stats
    getPerformanceStats() {
        return {
            winRate: this.getWinRate().toFixed(1),
            avgProfit: this.getAverageProfit().toFixed(2),
            holdTime: this.getAverageHoldTime(),
            monthlyGain: this.getMonthlyGain().toFixed(2),
            tradesCount: this.trades.length
        };
    }
    
    // Get the URL to the Google Sheet
    getSpreadsheetUrl() {
        if (this.spreadsheetId) {
            return `https://docs.google.com/spreadsheets/d/${this.spreadsheetId}`;
        }
        return null;
    }
    
    // Sync all local trades to Google Sheet
    async syncAllTrades() {
        if (!this.initialized || !this.spreadsheetId) {
            console.warn('TradeLogger not properly initialized with a spreadsheet ID.');
            return false;
        }
        
        try {
            // First, clear existing data (except headers)
            await gapi.client.sheets.spreadsheets.values.clear({
                spreadsheetId: this.spreadsheetId,
                range: 'Trades!A2:I'
            });
            
            // If no trades, we're done
            if (this.trades.length === 0) {
                console.log('No trades to sync');
                return true;
            }
            
            // Prepare the values for batch update
            const values = this.trades.map(trade => {
                const totalValue = (parseFloat(trade.price || 0) * parseFloat(trade.quantity || 0)).toFixed(2);
                return [
                    trade.timestamp,
                    trade.symbol || '',
                    trade.type || '',
                    trade.price || '',
                    trade.quantity || '',
                    totalValue,
                    trade.percentReturn || '0.0',
                    trade.confidence || '',
                    trade.notes || ''
                ];
            });
            
            // Add all trades in a batch
            await gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId: this.spreadsheetId,
                range: `Trades!A2:I${1 + values.length}`,
                valueInputOption: 'USER_ENTERED',
                resource: {
                    values
                }
            });
            
            console.log(`Synced ${values.length} trades to Google Sheet`);
            return true;
        } catch (error) {
            console.error('Error syncing trades:', error);
            return false;
        }
    }
    
    // Create a performance summary sheet
    async updatePerformanceSheet() {
        if (!this.initialized || !this.spreadsheetId) {
            console.warn('TradeLogger not properly initialized with a spreadsheet ID.');
            return false;
        }
        
        try {
            // Set up performance sheet headers
            const headers = [
                'Date', 'Total Trades', 'Win Rate', 'Total Profit/Loss', 
                'Best Trade', 'Worst Trade', 'Average Return'
            ];
            
            // Add headers to the Performance sheet
            await gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId: this.spreadsheetId,
                range: 'Performance!A1:G1',
                valueInputOption: 'USER_ENTERED',
                resource: {
                    values: [headers]
                }
            });
            
            // Format the header row
            await gapi.client.sheets.spreadsheets.batchUpdate({
                spreadsheetId: this.spreadsheetId,
                resource: {
                    requests: [
                        {
                            repeatCell: {
                                range: {
                                    sheetId: 1, // Performance sheet
                                    startRowIndex: 0,
                                    endRowIndex: 1,
                                    startColumnIndex: 0,
                                    endColumnIndex: headers.length
                                },
                                cell: {
                                    userEnteredFormat: {
                                        backgroundColor: {
                                            red: 0.2,
                                            green: 0.2,
                                            blue: 0.2
                                        },
                                        textFormat: {
                                            bold: true,
                                            foregroundColor: {
                                                red: 1.0,
                                                green: 1.0,
                                                blue: 1.0
                                            }
                                        }
                                    }
                                },
                                fields: 'userEnteredFormat(backgroundColor,textFormat)'
                            }
                        }
                    ]
                }
            });
            
            // Add formulas to calculate performance metrics
            const formulas = [
                // Date
                '=TODAY()',
                // Total Trades
                '=COUNTA(Trades!A:A)-1',
                // Win Rate
                '=COUNTIF(Trades!G:G,">0")/COUNTA(Trades!A:A)-1',
                // Total Profit/Loss
                '=SUM(Trades!G:G)',
                // Best Trade
                '=MAX(Trades!G:G)',
                // Worst Trade
                '=MIN(Trades!G:G)',
                // Average Return
                '=AVERAGE(Trades!G:G)'
            ];
            
            // Add formulas to the performance sheet
            await gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId: this.spreadsheetId,
                range: 'Performance!A2:G2',
                valueInputOption: 'USER_ENTERED',
                resource: {
                    values: [formulas]
                }
            });
            
            // Format the cells with proper number formatting
            await gapi.client.sheets.spreadsheets.batchUpdate({
                spreadsheetId: this.spreadsheetId,
                resource: {
                    requests: [
                        // Format win rate as percentage
                        {
                            repeatCell: {
                                range: {
                                    sheetId: 1,
                                    startRowIndex: 1,
                                    endRowIndex: 2,
                                    startColumnIndex: 2,
                                    endColumnIndex: 3
                                },
                                cell: {
                                    userEnteredFormat: {
                                        numberFormat: {
                                            type: 'PERCENT',
                                            pattern: '0.00%'
                                        }
                                    }
                                },
                                fields: 'userEnteredFormat.numberFormat'
                            }
                        },
                        // Format currency cells
                        {
                            repeatCell: {
                                range: {
                                    sheetId: 1,
                                    startRowIndex: 1,
                                    endRowIndex: 2,
                                    startColumnIndex: 3,
                                    endColumnIndex: 6
                                },
                                cell: {
                                    userEnteredFormat: {
                                        numberFormat: {
                                            type: 'CURRENCY',
                                            pattern: '"$"#,##0.00'
                                        }
                                    }
                                },
                                fields: 'userEnteredFormat.numberFormat'
                            }
                        },
                        // Format average return as percentage
                        {
                            repeatCell: {
                                range: {
                                    sheetId: 1,
                                    startRowIndex: 1,
                                    endRowIndex: 2,
                                    startColumnIndex: 6,
                                    endColumnIndex: 7
                                },
                                cell: {
                                    userEnteredFormat: {
                                        numberFormat: {
                                            type: 'PERCENT',
                                            pattern: '0.00%'
                                        }
                                    }
                                },
                                fields: 'userEnteredFormat.numberFormat'
                            }
                        }
                    ]
                }
            });
            
            console.log('Performance sheet updated successfully');
            return true;
        } catch (error) {
            console.error('Error updating performance sheet:', error);
            return false;
        }
    }
}

// Export to global scope
window.TradeLogger = TradeLogger;

// Create a singleton instance
window.tradeLogger = new TradeLogger();

// Initialize the logger when the document is loaded
document.addEventListener('DOMContentLoaded', async () => {
    console.log("TradeLogger module loaded");
    
    // Try to initialize after a short delay to ensure other components are loaded
    setTimeout(async () => {
        try {
            // Check if we have a saved Google Sheet ID in localStorage
            const savedSheetId = localStorage.getItem('iqts_sheet_id');
            
            // Initialize with the saved sheet ID or create a new one if not found
            const initialized = await window.tradeLogger.init(savedSheetId);
            
            if (initialized) {
                console.log("Trade logging to Google Sheets is ready");
                
                // If we created a new spreadsheet, let's set up the performance sheet as well
                if (!savedSheetId && window.tradeLogger.spreadsheetId) {
                    await window.tradeLogger.updatePerformanceSheet();
                }
                
                // If we have local trades, sync them to the sheet
                if (window.tradeLogger.trades.length > 0) {
                    await window.tradeLogger.syncAllTrades();
                }
                
                // Display the spreadsheet URL if available
                const spreadsheetUrl = window.tradeLogger.getSpreadsheetUrl();
                if (spreadsheetUrl) {
                    console.log(`Google Sheet available at: ${spreadsheetUrl}`);
                    
                    // Add a button to the UI to open the Google Sheet
                    if (document.getElementById('dashboard-links')) {
                        const linkContainer = document.getElementById('dashboard-links');
                        const sheetLink = document.createElement('a');
                        sheetLink.href = spreadsheetUrl;
                        sheetLink.target = '_blank';
                        sheetLink.className = 'dashboard-link';
                        sheetLink.innerHTML = '<i class="fas fa-table"></i> Trade Journal';
                        linkContainer.appendChild(sheetLink);
                    }
                }
            } else {
                console.warn("Trade logging to Google Sheets failed to initialize");
            }
        } catch (error) {
            console.error("Error initializing trade logger:", error);
        }
    }, 2000);
});

// Expose a utility function for creating a new sheet manually
window.createNewTradeJournal = async () => {
    try {
        // Make sure the logger is initialized
        if (!window.tradeLogger.initialized) {
            await window.tradeLogger.init();
        }
        
        // Create a new spreadsheet
        const spreadsheetId = await window.tradeLogger.createNewSpreadsheet();
        
        // Set up the performance sheet
        await window.tradeLogger.updatePerformanceSheet();
        
        // Sync existing trades if any
        if (window.tradeLogger.trades.length > 0) {
            await window.tradeLogger.syncAllTrades();
        }
        
        console.log(`New trade journal created. Spreadsheet ID: ${spreadsheetId}`);
        console.log(`You can access your Trade Journal at: https://docs.google.com/spreadsheets/d/${spreadsheetId}`);
        
        return spreadsheetId;
    } catch (error) {
        console.error('Failed to create new trade journal:', error);
        return null;
    }
};
