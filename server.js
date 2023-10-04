
const express = require('express');
const path = require('path');
const { Client, types } = require('pg');
const app = express();
const PORT = 5000;

const cors = require('cors');
const queries = require('./queries');

app.use(express.static(path.join(__dirname, 'web-test3', 'dist')));

app.use(cors()); 
// Date 객체로의 자동 변환 방지
types.setTypeParser(1082, 'text', val => val); // date

const client = new Client({
    host: '192.168.1.183',
    port: 5432,
    user: 'test',
    password: 'bigdata#0801',
    database: 'dbtest'
});


// 서버 시작할 때 데이터베이스 연결
client.connect().then(() => {
    console.log("Connected to the database");
}).catch((error) => {
    console.error("Failed to connect to the database", error);
});


const performQuery = async (query, params) => {
    try {
        const result = await client.query(query, params);
        return result.rows;
    } catch (error) {
        console.error("Failed to run query:", error);
        throw new Error("Internal Server Error");
    }
};

const isValidDate = (dateString) => {
    const regEx = /^\d{4}-\d{2}-\d{2}$/;
    if(!dateString.match(regEx)) return false;  // Invalid format
    const d = new Date(dateString);
    const dNum = d.getTime();
    if(!dNum && dNum !== 0) return false; // NaN value, Invalid date
    return d.toISOString().slice(0,10) === dateString;
};


app.get('/graph1data', async (req, res) => {
    let startDate = req.query.startDate;
    let endDate = req.query.endDate;

    if (!isValidDate(startDate) || !isValidDate(endDate)) {
        return res.status(400).send("Invalid date format");
    }

    const formattedToday = new Date().toISOString().split('T')[0];

    if (!startDate || startDate === 'null') {
        startDate = '2010-01-01';
    }

    if (!endDate || endDate === 'null') {
        endDate = formattedToday;
    }

    console.log(">>start / end", startDate, endDate);

    try {
        const data15_1 = await performQuery(queries.data15_1, [startDate, endDate]);
        const data15_2 = await performQuery(queries.data15_2, [startDate, endDate]);
        
        console.log(data15_1);
        
        res.json({
            data15_1: data15_1,
            data15_2: data15_2
        });
    } catch (error) {
        console.error("Error while fetching data:", error);
        res.status(500).send("Internal Server Error");
    }
});



app.get('/graph2data', async (req, res) => {
    try {
        const [data16_1, data16_2] = await Promise.all([
            performQuery(queries.data16_1),
            performQuery(queries.data16_2)
        ]);
        
        res.json({ data16_1, data16_2 });
    } catch (error) {
        res.status(500).send(error.message);
    }
});


app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'web-test3', 'dist', 'index.html'));
});


app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});
