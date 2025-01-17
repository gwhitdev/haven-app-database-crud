require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3001;
const mysql = require('mysql2');
const cors = require('cors');

app.use(cors());

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

const returnLastInsert = (insertId, tableName, res) => {
    let preparedLastInsertSql = '';

    if (tableName === 'reports') {
        preparedLastInsertSql = 'select * from `reports` where `id` = ?';
    }
    if (tableName === 'reporters') {
        preparedLastInsertSql = 'select * from `reporters` where `id` = ?';
    }
    console.log(preparedLastInsertSql)
    const valuesForLastInsert  = [insertId];

    connection.execute(preparedLastInsertSql, valuesForLastInsert, function (err, results) {
        if (err) return err;
        res.json({
            status: 'success',
            message: 'Successfully inserted into table',
            results
        })
    })
}

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
    storeRequestInDatabase(req.body);
    const preparedSql = 'INSERT INTO `reports` (`incident_description`,`location`) ' +
        'VALUES (?,?)';
    const values = [
        req.body.description,
        req.body.location
    ];
    console.log(preparedSql, values);
    connection.execute(preparedSql, values, function (err, results) {
        if (err) {
            console.error(err);
            res.status(500).json({
                'status': 'error',
                'message': 'Could not insert into table'
            })
        }

        returnLastInsert(results.insertId,'reports', res);
    })
    connection.unprepare();

})



app.post('/api/reporter', (req, res) => {
    console.log('POST /api/reporter');

    storeRequestInDatabase(req.body);

    const preparedSql = 'INSERT INTO `reporters` (`first_name`, `last_name`, `email`, `phone_number`, `how_can_help`, `report_id`) values (?,?,?,?,?,?)';
    const values = [
        req.body.firstName,
        req.body.lastName,
        req.body.email,
        req.body.phoneNumber,
        req.body.howCanHelp,
        req.body.reportId
    ];

    connection.execute(preparedSql, values, function (err, results) {
        if (err) {
            console.error(err);
            res.status(500).json({
                'status': 'error',
                'message': 'Could not insert into table'
            })
        }

        returnLastInsert(results.insertId,'reporters', res);
    })
    connection.unprepare();
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

function storeRequestInDatabase(requestData) {
    const itemToStore = JSON.stringify(requestData);
    const prepared = 'INSERT INTO `audit` (`entity`) values (?)';
    const values = [itemToStore];

    connection.execute(prepared, values, function (err, results) {
        if (err) console.error(err);
        console.log(results);
    })
}