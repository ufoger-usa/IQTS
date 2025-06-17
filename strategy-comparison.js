/**
 * Strategy Comparison Dashboard
 * Compares performance metrics between different trading strategies
 */

// Function to check if Chart.js is properly loaded
function checkChartJsLoaded() {
  if (typeof Chart === 'undefined') {
    console.error('Chart.js is not loaded! Strategy comparison will not work.');
    
    // Create error message on the page
    const strategyPanel = document.getElementById('strategy-comparison');
    if (strategyPanel) {
      const errorMsg = document.createElement('div');
      errorMsg.style.color = 'red';
      errorMsg.style.padding = '15px';
      errorMsg.style.margin = '10px 0';
      errorMsg.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
      errorMsg.style.border = '1px solid red';
      errorMsg.style.borderRadius = '5px';
      errorMsg.innerHTML = '<strong>Error:</strong> Chart.js library not loaded properly. Please check console for details.';
      
      // Insert before chart container
      const chartContainer = document.querySelector('.comparison-chart');
      if (chartContainer) {
        strategyPanel.insertBefore(errorMsg, chartContainer);
      } else {
        strategyPanel.appendChild(errorMsg);
      }
    }
    return false;
  }
  return true;
}

// Function to initialize the strategy comparison features
function initStrategyComparison() {
  console.log('Initializing strategy comparison...');
  
  // First check if Chart.js is loaded
  if (!checkChartJsLoaded()) {
    return; // Stop initialization if Chart.js isn't available
  }
  
  if (document.getElementById('strategyChart')) {
    console.log('Strategy chart found, updating...');
    updateStrategyChart('swing'); // Initialize with default strategy
  } else {
    console.error('Strategy chart element not found');
  }
  
  // Add event listeners to strategy tabs if they exist
  const strategyTabs = document.querySelectorAll('.strategy-tab');
  if (strategyTabs && strategyTabs.length > 0) {
    console.log(`Found ${strategyTabs.length} strategy tabs`);
    
    strategyTabs.forEach(tab => {
      tab.addEventListener('click', function() {
        console.log(`Strategy tab clicked: ${this.getAttribute('data-strategy')}`);
        
        // Remove active class from all tabs
        strategyTabs.forEach(t => t.classList.remove('active'));
        
        // Add active class to clicked tab
        this.classList.add('active');
        
        // Update chart based on selected strategy
        const strategy = this.getAttribute('data-strategy');
        updateStrategyChart(strategy);
      });
    });
  } else {
    console.error('Strategy tabs not found');
  }
}

// Initialize when the document is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Wait a short moment to ensure all elements are properly loaded
  setTimeout(initStrategyComparison, 500);
});

/**
 * Updates the strategy comparison chart with performance data
 * @param {string} activeStrategy - The currently selected strategy
 */
function updateStrategyChart(activeStrategy = 'swing') {
  console.log(`Updating strategy chart with active strategy: ${activeStrategy}`);
  
  const chartElement = document.getElementById('strategyChart');
  if (!chartElement) {
    console.error('Strategy chart canvas not found');
    return;
  }
  
  const ctx = chartElement.getContext('2d');
  
  // Destroy existing chart if it exists
  if (window.strategyChart instanceof Chart) {
    console.log('Destroying existing chart');
    window.strategyChart.destroy();
  }
  
  // Highlight the active strategy in the chart
  const backgroundColors = [
    'rgba(75, 192, 192, 0.6)',   // Swing
    'rgba(54, 162, 235, 0.6)',   // Scalp
    'rgba(153, 102, 255, 0.6)'   // AI Optimized
  ];
  
  const borderColors = [
    'rgb(75, 192, 192)',   // Swing
    'rgb(54, 162, 235)',   // Scalp
    'rgb(153, 102, 255)'   // AI Optimized
  ];
  
  // Make the active strategy slightly more opaque
  if (activeStrategy === 'swing') {
    backgroundColors[0] = 'rgba(75, 192, 192, 0.85)';
    borderColors[0] = 'rgb(75, 192, 192)';
  } else if (activeStrategy === 'scalp') {
    backgroundColors[1] = 'rgba(54, 162, 235, 0.85)';
    borderColors[1] = 'rgb(54, 162, 235)';
  } else if (activeStrategy === 'ai-optimized') {
    backgroundColors[2] = 'rgba(153, 102, 255, 0.85)';
    borderColors[2] = 'rgb(153, 102, 255)';
  }
  
  // Create new chart
  window.strategyChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Swing', 'Scalp', 'AI Optimized'],
      datasets: [{
        label: 'Profit % (30d)',
        data: [12.5, 8.2, 15.7],
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Profit %'
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `Profit: ${context.raw}%`;
            }
          }
        }
      }
    }
  });
  
  // Update strategy statistics based on active strategy
  updateStrategyStats(activeStrategy);
}

/**
 * Updates the strategy statistics display
 * @param {string} strategy - The strategy to display stats for
 */
function updateStrategyStats(strategy) {
  console.log(`Updating stats for strategy: ${strategy}`);
  
  // Example statistics - in a real app, these would come from your backend
  const strategyStats = {
    'swing': {
      winRate: '68%',
      avgProfit: '3.2%',
      maxDrawdown: '8.4%'
    },
    'scalp': {
      winRate: '72%',
      avgProfit: '1.4%',
      maxDrawdown: '5.2%'
    },
    'ai-optimized': {
      winRate: '76%',
      avgProfit: '3.8%',
      maxDrawdown: '6.1%'
    }
  };
  
  // Get stats for selected strategy
  const stats = strategyStats[strategy] || strategyStats['swing'];
  console.log('Strategy stats:', stats);
  
  // Check if the stats container exists, if not create it
  let statsContainer = document.getElementById('strategy-stats-container');
  if (!statsContainer) {
    console.log('Creating strategy stats container');
    statsContainer = document.createElement('div');
    statsContainer.id = 'strategy-stats-container';
    statsContainer.className = 'strategy-stats';
    
    // Create stat cards
    const winRateCard = createStatCard('strategy-win-rate', 'Win Rate');
    const avgProfitCard = createStatCard('strategy-avg-profit', 'Avg Profit');
    const maxDrawdownCard = createStatCard('strategy-max-drawdown', 'Max Drawdown');
    
    statsContainer.appendChild(winRateCard);
    statsContainer.appendChild(avgProfitCard);
    statsContainer.appendChild(maxDrawdownCard);
    
    // Add the container after the chart
    const chartContainer = document.querySelector('.comparison-chart');
    if (chartContainer) {
      chartContainer.parentNode.insertBefore(statsContainer, chartContainer.nextSibling);
    } else {
      document.getElementById('strategy-comparison').appendChild(statsContainer);
    }
  }
  
  // Update stats display with unique IDs to avoid conflicts
  if (document.getElementById('strategy-win-rate')) {
    document.getElementById('strategy-win-rate').textContent = stats.winRate;
  }
  
  if (document.getElementById('strategy-avg-profit')) {
    document.getElementById('strategy-avg-profit').textContent = stats.avgProfit;
  }
  
  if (document.getElementById('strategy-max-drawdown')) {
    document.getElementById('strategy-max-drawdown').textContent = stats.maxDrawdown;
  }
}

/**
 * Creates a stat card element
 * @param {string} id - The ID for the stat value element
 * @param {string} label - The label text
 * @returns {HTMLElement} The created stat card
 */
function createStatCard(id, label) {
  const card = document.createElement('div');
  card.className = 'strategy-stat-card';
  
  const valueElement = document.createElement('div');
  valueElement.className = 'strategy-stat-value';
  valueElement.id = id;
  valueElement.textContent = '--';
  
  const labelElement = document.createElement('div');
  labelElement.className = 'strategy-stat-label';
  labelElement.textContent = label;
  
  card.appendChild(valueElement);
  card.appendChild(labelElement);
  
  return card;
}