const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const https = require('https');
const app = express();

require('dotenv').config(); // Load environment variables

// Fetch stock data from the API
const options = {
    method: 'GET',
    hostname: 'nairobi-stock-exchange-nse.p.rapidapi.com',
    port: null,
    path: '/stocks',
    headers: {
        'x-rapidapi-key': '3e16410030msh87cfb9548a7bcc5p15f918jsn240b9d5e41e1', 
        'x-rapidapi-host': 'nairobi-stock-exchange-nse.p.rapidapi.com'
    }
};

// API request and render the data to the view
app.get('/', (req, res) => {
    const apiReq = https.request(options, (apiRes) => {
        let data = '';

        // Collect data from the API
        apiRes.on('data', (chunk) => {
            data += chunk;
        });

        // When the response ends, render the data
        apiRes.on('end', () => {
            const stocks = JSON.parse(data);

            const selectedStocks = [
                'Safaricom Plc', 
                'Kenya Power & Lighting Company', 
                'Britam Holdings Limited', 
                'KCB Group'
            ];
            const filteredStocks = stocks.filter(stock => selectedStocks.includes(stock.name));

            // Prepare data for the chart
            const labels = filteredStocks.map(stock => stock.name);
            const stockPrices = filteredStocks.map(stock => stock.price); // Assuming 'price' is the correct property

            const chartData = {
                labels: labels,
                datasets: [{
                    label: 'Stock Prices',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 3, 
                    borderDash: [5, 5],
                    data: stockPrices,
                    tension: 0.4,
                }]
            };

            // Pass the chart data to the index.ejs view
            res.render('index', { chartData: JSON.stringify(chartData), filteredStocks : filteredStocks });
        });
    });

    apiReq.on('error', (e) => {
        console.error(`Problem with request: ${e.message}`);
        res.status(500).send('Error fetching stock data.');
    });

    apiReq.end();
});

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS as the template engine
app.set('view engine', 'ejs');

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server Running on http://localhost:${PORT}`);
});
