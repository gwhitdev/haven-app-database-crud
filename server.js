require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3001;
const mysql = require('mysql2');

const connection = mysql.createConnection({
        host: 	'f8ogy1hm9ubgfv2s.chr7pe7iynqr.eu-west-1.rds.amazonaws.com',
        user: 	'ar5pqvint2dxw8oh',
        password: 	'hetj6nzsvtkk12b8',
        port: 3306,
        database: 'xj4mbu8vwxveq0nz'
});

connection.connect((err) => {
    if (err) {
        console.log(err)
    } else {
        console.log('connected to DB')
    }
});



app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.get('/', (req, res) => {
    res.json({
        'status': 'success',
        'message': 'Hello world!'
    })
})

app.get('/api/all-results', async (req, res) => {
    console.log('GET /api/all-results');


    connection.query(
        {
            sql: 'SELECT * FROM reports',
        },
        function (err, results, fields) {
            if (err) {
                res.json({
                    'status': 'error',
                    'message': 'Could not detect the report table in the database'
                })
            }
            console.log(results); // results contains rows returned by server
            res.json({
                'status': 'success',
                'message': 'Successfully detected reports table',
                'data': results
            })
        }
    );
});

app.post('/api/report', (req, res) => {
    console.log(JSON.stringify(req.body));
    res.json({
        'message-received': true,
        'data': JSON.stringify(req.body)
    })
})

app.post('/api/test', (req, res) => {
    console.log('Received POST request to /api/test')
    console.log(JSON.stringify(req.body));
    res.json({
        'status': 'success',
        'message': 'POST request received',
        'dataReceived': JSON.stringify(req.body)
    })
})

app.listen(port, () => {
    console.log('Listening on port ' + port);
})