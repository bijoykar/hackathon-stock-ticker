class StockTickerApp {
    constructor() {
        this.apiBaseUrl = 'http://localhost:8081/api';
        this.authToken = localStorage.getItem('authToken');
        this.currentUser = localStorage.getItem('currentUser');
        this.stockData = [];
        this.previousData = {};
        this.chartInstances = {};
        this.refreshInterval = null;
        this.countdownInterval = null;
        this.countdownValue = 60;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateAuthUI();
        
        if (this.authToken) {
            this.startDataRefresh();
        } else {
            this.hideLoading();
        }
        
        // Add table header click handlers for sorting
        this.setupTableSorting();
    }

    setupEventListeners() {
        // Authentication
        $('#loginBtn').on('click', () => this.login());
        $('#logoutBtn').on('click', () => this.logout());
        
        // View toggle
        $('.toggle-btn').on('click', (e) => this.toggleView(e));
        
        // Refresh button
        $('#refreshBtn').on('click', () => this.refreshData());
        
        // Close modal
        $('#closeErrorModal').on('click', () => this.hideModal());
        
        // Enter key for login
        $('#username, #password').on('keypress', (e) => {
            if (e.which === 13) this.login();
        });
    }

    updateAuthUI() {
        if (this.authToken && this.currentUser) {
            $('#loginSection').hide();
            $('#loggedInSection').show();
            $('#welcomeUser').text(`Welcome, ${this.currentUser}`);
            this.updateMarketStatus('online');
        } else {
            $('#loginSection').show();
            $('#loggedInSection').hide();
            this.updateMarketStatus('offline');
        }
    }

    updateMarketStatus(status) {
        const statusDot = $('#statusDot');
        const statusText = $('#marketStatus');
        
        if (status === 'online') {
            statusDot.css('background', '#00d4aa');
            statusText.text('Market Open');
        } else {
            statusDot.css('background', '#ff4757');
            statusText.text('Market Closed');
        }
    }

    async login() {
        const username = $('#username').val();
        const password = $('#password').val();
        
        if (!username || !password) {
            this.showError('Please enter username and password');
            return;
        }

        this.showLoading();
        
        try {
            const response = await $.ajax({
                url: `${this.apiBaseUrl}/auth/login`,
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ username, password })
            });

            if (response.success) {
                this.authToken = response.data.token;
                this.currentUser = response.data.username;
                
                localStorage.setItem('authToken', this.authToken);
                localStorage.setItem('currentUser', this.currentUser);
                
                this.updateAuthUI();
                this.startDataRefresh();
                
                // Clear password field
                $('#password').val('');
            } else {
                this.showError(response.message);
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showError('Login failed. Please check your credentials.');
        } finally {
            this.hideLoading();
        }
    }

    logout() {
        this.authToken = null;
        this.currentUser = null;
        
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        
        this.updateAuthUI();
        this.stopDataRefresh();
        this.clearStockData();
    }

    toggleView(e) {
        const view = $(e.target).closest('.toggle-btn').data('view');
        
        $('.toggle-btn').removeClass('active');
        $(e.target).closest('.toggle-btn').addClass('active');
        
        if (view === 'grid') {
            $('#stockGrid').addClass('active');
            $('.ticker-scroll').hide();
        } else {
            $('#stockGrid').removeClass('active');
            $('.ticker-scroll').show();
        }
    }

    async refreshData() {
        if (!this.authToken) {
            this.showError('Please login to access market data');
            return;
        }

        try {
            this.showLoading();
            await this.fetchLatestStockData();
        } catch (error) {
            console.error('Refresh error:', error);
            this.showError('Failed to refresh data');
        } finally {
            this.hideLoading();
        }
    }

    async fetchLatestStockData() {
        try {
            const response = await $.ajax({
                url: `${this.apiBaseUrl}/stock-data/latest`,
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                }
            });

            if (response.success && response.data) {
                this.processStockData(response.data);
                this.updateLastUpdateTime();
            } else {
                throw new Error(response.message || 'No data received');
            }
        } catch (error) {
            if (error.status === 401) {
                this.logout();
                this.showError('Session expired. Please login again.');
            } else {
                throw error;
            }
        }
    }

    processStockData(data) {
        const symbols = Object.keys(data.stockPrices);
        const processedData = [];

        symbols.forEach(symbol => {
            const currentPrice = data.stockPrices[symbol];
            const previousPrice = this.previousData[symbol] || currentPrice;
            
            const change = currentPrice - previousPrice;
            const changePercent = previousPrice !== 0 ? (change / previousPrice) * 100 : 0;
            
            // Generate some mock data for demo purposes
            const high = currentPrice * (1 + Math.random() * 0.05);
            const low = currentPrice * (1 - Math.random() * 0.05);
            
            processedData.push({
                symbol,
                currentPrice,
                change,
                changePercent,
                high,
                low,
                timestamp: data.timestamp,
                trend: change >= 0 ? 'up' : 'down'
            });
        });

        this.stockData = processedData;
        this.previousData = { ...data.stockPrices };
        
        this.updateStockDisplay();
        this.updateTickerScroll();
        this.updateStats();
    }

    updateStockDisplay() {
        const tbody = $('#stockTableBody');
        tbody.empty();

        this.stockData.forEach(stock => {
            const row = this.createStockTableRow(stock);
            tbody.append(row);
        });

        // Create sparklines after DOM update
        setTimeout(() => {
            this.stockData.forEach(stock => {
                this.createSparkline(stock.symbol);
            });
        }, 100);

        // Animate rows
        $('.stock-row').addClass('fade-in');
    }

    createStockTableRow(stock) {
        const isPositive = stock.change >= 0;
        const changeClass = isPositive ? 'positive' : 'negative';
        const trendIcon = isPositive ? 'fa-arrow-up' : 'fa-arrow-down';
        const trendClass = isPositive ? 'trend-up' : 'trend-down';

        return $(`
            <tr class="stock-row ${trendClass}" data-symbol="${stock.symbol}">
                <td class="symbol-cell">
                    <div class="symbol-wrapper">
                        <span class="symbol-text">${stock.symbol}</span>
                        <i class="fas ${trendIcon} trend-arrow ${changeClass}"></i>
                    </div>
                </td>
                <td class="price-cell">
                    <span class="current-price">$${stock.currentPrice.toFixed(2)}</span>
                </td>
                <td class="change-cell">
                    <span class="change-amount ${changeClass}">
                        ${isPositive ? '+' : ''}${stock.change.toFixed(2)}
                    </span>
                </td>
                <td class="change-percent-cell">
                    <span class="change-percent ${changeClass}">
                        ${isPositive ? '+' : ''}${stock.changePercent.toFixed(2)}%
                    </span>
                </td>
                <td class="high-cell">
                    <span class="day-high">$${stock.high.toFixed(2)}</span>
                </td>
                <td class="low-cell">
                    <span class="day-low">$${stock.low.toFixed(2)}</span>
                </td>
                <td class="sparkline-cell">
                    <canvas class="table-sparkline" id="chart-${stock.symbol}" width="80" height="30"></canvas>
                </td>
            </tr>
        `);
    }

    updateTickerScroll() {
        const container = $('#tickerScroll');
        container.empty();

        this.stockData.forEach(stock => {
            const isPositive = stock.change >= 0;
            const changeClass = isPositive ? 'positive' : 'negative';
            
            const tickerItem = $(`
                <div class="ticker-item">
                    <span class="ticker-symbol">${stock.symbol}</span>
                    <canvas class="ticker-sparkline" id="sparkline-${stock.symbol}" width="60" height="20"></canvas>
                    <span class="ticker-price">$${stock.currentPrice.toFixed(2)}</span>
                    <span class="ticker-change ${changeClass}">
                        ${isPositive ? '+' : ''}${stock.change.toFixed(2)} 
                        (${isPositive ? '+' : ''}${stock.changePercent.toFixed(2)}%)
                    </span>
                </div>
            `);
            
            container.append(tickerItem);
            
            // Create sparkline after the element is added to DOM
            setTimeout(() => {
                this.createTickerSparkline(stock.symbol, stock.currentPrice, isPositive);
            }, 0);
        });

        // Restart animation
        container.css('animation', 'none');
        container[0].offsetHeight; // Trigger reflow
        container.css('animation', 'scroll 120s linear infinite');
    }

    updateStats() {
        $('#totalSymbols').text(this.stockData.length);
        
        if (this.stockData.length > 0) {
            const lastTimestamp = new Date(this.stockData[0].timestamp);
            $('#lastMinute').text(lastTimestamp.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            }));
        }
    }

    updateLastUpdateTime() {
        const now = new Date();
        $('#lastUpdate').text(now.toLocaleTimeString());
    }

    generateSparklineData(symbol) {
        // Generate mock historical data for sparkline
        const points = 20;
        const basePrice = this.stockData.find(s => s.symbol === symbol)?.currentPrice || 100;
        const data = [];
        
        for (let i = 0; i < points; i++) {
            const variation = (Math.random() - 0.5) * 0.1;
            const price = basePrice * (1 + variation);
            data.push(price);
        }
        
        return data;
    }

    createSparkline(symbol) {
        const canvas = document.getElementById(`chart-${symbol}`);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const data = this.generateSparklineData(symbol);
        
        // Get stock info for color determination
        const stock = this.stockData.find(s => s.symbol === symbol);
        const isPositive = stock ? stock.change >= 0 : true;
        const chartColor = isPositive ? '#00ff88' : '#ff4757';
        const chartBgColor = isPositive ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 71, 87, 0.1)';
        
        // Destroy existing chart
        if (this.chartInstances[symbol]) {
            this.chartInstances[symbol].destroy();
        }

        this.chartInstances[symbol] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array(data.length).fill(''),
                datasets: [{
                    data: data,
                    borderColor: chartColor,
                    backgroundColor: chartBgColor,
                    borderWidth: 2,
                    fill: true,
                    pointRadius: 0,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                },
                scales: {
                    x: { display: false },
                    y: { display: false }
                },
                elements: {
                    point: { radius: 0 }
                },
                interaction: {
                    intersect: false
                }
            }
        });
    }

    createTickerSparkline(symbol, currentPrice, isPositive) {
        const canvas = document.getElementById(`sparkline-${symbol}`);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Generate simple sparkline data (10 points)
        const points = 10;
        const data = [];
        const basePrice = currentPrice;
        
        for (let i = 0; i < points; i++) {
            const variation = (Math.random() - 0.5) * 0.05; // 5% variation
            const price = basePrice * (1 + variation * (1 - i / points)); // Trend towards current price
            data.push(price);
        }
        
        // Ensure last point is current price
        data[data.length - 1] = currentPrice;
        
        // Find min and max for scaling
        const min = Math.min(...data);
        const max = Math.max(...data);
        const range = max - min || 1;
        
        // Set line color based on trend
        ctx.strokeStyle = isPositive ? '#00ff88' : '#ff4757';
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Draw sparkline
        ctx.beginPath();
        for (let i = 0; i < data.length; i++) {
            const x = (i / (data.length - 1)) * (width - 4) + 2;
            const y = height - 2 - ((data[i] - min) / range) * (height - 4);
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
        
        // Add subtle fill
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = isPositive ? '#00ff88' : '#ff4757';
        ctx.lineTo(width - 2, height - 2);
        ctx.lineTo(2, height - 2);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    startDataRefresh() {
        // Initial load
        this.refreshData();
        
        // Set up refresh interval (every minute)
        this.refreshInterval = setInterval(() => {
            this.refreshData();
        }, 60000);
        
        // Set up countdown
        this.startCountdown();
    }

    stopDataRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
        
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
    }

    startCountdown() {
        this.countdownValue = 60;
        
        this.countdownInterval = setInterval(() => {
            this.countdownValue--;
            $('#countdown').text(this.countdownValue);
            
            if (this.countdownValue <= 0) {
                this.countdownValue = 60;
            }
        }, 1000);
    }

    clearStockData() {
        this.stockData = [];
        this.previousData = {};
        $('#stockTableBody').empty();
        $('#tickerScroll').empty();
        $('#totalSymbols').text('--');
        $('#lastMinute').text('--:--');
        
        // Destroy all chart instances
        Object.values(this.chartInstances).forEach(chart => chart.destroy());
        this.chartInstances = {};
    }

    showLoading() {
        $('#loadingOverlay').show();
    }

    hideLoading() {
        $('#loadingOverlay').hide();
    }

    showError(message) {
        $('#errorMessage').text(message);
        $('#errorModal').addClass('show');
    }

    hideModal() {
        $('#errorModal').removeClass('show');
    }

    setupTableSorting() {
        $(document).on('click', '.stock-table th', (e) => {
            const column = $(e.target).text().trim().toLowerCase();
            this.sortStockData(column);
        });
    }

    sortStockData(column) {
        const sortMap = {
            'symbol': 'symbol',
            'last price': 'currentPrice',
            'change': 'change',
            'change %': 'changePercent',
            'day high': 'high',
            'day low': 'low'
        };
        
        const sortKey = sortMap[column];
        if (!sortKey) return;
        
        this.stockData.sort((a, b) => {
            if (sortKey === 'symbol') {
                return a[sortKey].localeCompare(b[sortKey]);
            }
            return b[sortKey] - a[sortKey]; // Descending order for numbers
        });
        
        this.updateStockDisplay();
    }
}

// Initialize the application when DOM is ready
$(document).ready(() => {
    // Add sparkline creation after DOM updates
    const originalUpdateStockDisplay = StockTickerApp.prototype.updateStockDisplay;
    StockTickerApp.prototype.updateStockDisplay = function() {
        originalUpdateStockDisplay.call(this);
        
        // Create sparklines after a short delay to ensure DOM is updated
        setTimeout(() => {
            this.stockData.forEach(stock => {
                this.createSparkline(stock.symbol);
            });
        }, 100);
    };
    
    window.stockApp = new StockTickerApp();
});

// Handle window resize for responsive charts
$(window).on('resize', () => {
    if (window.stockApp && window.stockApp.chartInstances) {
        Object.values(window.stockApp.chartInstances).forEach(chart => {
            chart.resize();
        });
    }
});
