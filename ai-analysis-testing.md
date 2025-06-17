# AI Analysis Testing Checklist

## Python Microservice Setup
- [ ] Python 3.7+ installed
- [ ] Required libraries installed:
  - [ ] Flask
  - [ ] Flask-CORS
  - [ ] Pandas
  - [ ] scikit-learn
- [ ] Start the analysis service:
  - [ ] Run `start_analysis_service.bat`
  - [ ] Confirm service is running at http://localhost:8000
  - [ ] Test endpoint by accessing http://localhost:8000/analyze in browser

## UI Integration
- [ ] Dashboard loads with AI insights panel
- [ ] AI Best Strategy field displays a strategy after loading
- [ ] AI Warning field shows warning or "All good!"
- [ ] Refresh Analysis button works when clicked
- [ ] Verify loading animation when analysis is refreshed

## Telegram Commands
- [ ] Send `/analyze` command to the bot
- [ ] Verify response contains strategy recommendation
- [ ] Verify response contains warning data

## Strategy Optimization
- [ ] Check console log for "Strategy optimized for..." message
- [ ] Verify trading settings changed after analysis (check console or UI)
- [ ] Test multiple different strategies:
  - [ ] Create a test dataset with different feature importances
  - [ ] Confirm strategy changes accordingly

## Error Handling
- [ ] Stop Python service and verify graceful error handling in UI
- [ ] Verify error handling in Telegram `/analyze` command
- [ ] Send malformed data to analyze endpoint and verify error handling

## Cross-browser Testing
- [ ] Test functionality in Chrome
- [ ] Test functionality in Firefox
- [ ] Test functionality in Safari (if available)
- [ ] Test functionality in Edge

## Mobile Testing
- [ ] AI insights panel displays correctly on mobile
- [ ] Refresh button is easily tappable on mobile
- [ ] Telegram commands work from mobile device

## Notes
- Write any issues or observations below:
