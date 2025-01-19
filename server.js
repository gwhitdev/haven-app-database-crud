require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3001;
const mysql = require('mysql2');
const cors = require('cors');
const winston = require('winston');
const storeRequestInDatabase = require('./src/storeRequestInDatabase');
const returnLastInsert = require('./src/returnLastInsertId');
const multer = require('multer');
const upload = multer();
// Setup logger
const logger = winston.createLogger({
    level: 'verbose',
    format: winston.format.json(),
    transports: [
        new winston.transports.Console({
            format: winston.format.simple(),
        })
    ]
})
// Add CORS to allow all origins for current purposes
app.use(cors());
// Create connection to DB
const connection = mysql.createConnection({
        host: 	'f8ogy1hm9ubgfv2s.chr7pe7iynqr.eu-west-1.rds.amazonaws.com',
        user: 	'ar5pqvint2dxw8oh',
        password: 	'hetj6nzsvtkk12b8',
        port: 3306,
        database: 'xj4mbu8vwxveq0nz'
});

// Test connection to DB
connection.connect((err) => {
    if (err) {
        console.log(err)
    } else {
        console.log('connected to DB')
    }
});

// Allow JSON and URL encoded requests
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.get('/', (req, res) => {
    res.json({
        'status': 'success',
        'message': 'Hello world!'
    })
})

// GET /api/reporters
app.get('/api/reporters', (req, res) => {
    console.log('GET /api/reporters');
    connection.query({sql:'SELECT * FROM reporters'}, (err, results) => {
        if (err) {
            logger.error('GET /api/reporters ERROR', err);
            res.status(500).send({
                'status': 'error',
                'message': 'Something went wrong!'
            })
        }
        logger.info('GET /api/reporters SUCCESS');
        res.json(results);
    });
})

// GET /api/reports
app.get('/api/reports', (req, res) => {
    logger.info('GET /api/reports');
    connection.query({sql:'SELECT * FROM reports'}, (err, results) => {
        if (err) {
            logger.error('GET /api/reports ERROR', err);
            res.status(500).send({
                'status': 'error',
                'message': 'Something went wrong!'
            })
        }
        logger.info('GET /api/reports SUCCESS');
        res.json(results);
    })
})
/* DEPRECATED
// GET /api/all-results -> returns readout of all the records in the REPORTS table
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
*/

// POST /api/report -> insert a report into the DB and returns the ID of the inserted row
app.post('/api/reports', upload.none(), (req, res) => {
    console.log(JSON.stringify(req.body));
    logger.info('POST /api/report');
    logger.info('REQUEST RECEIVED:',req.body);
    storeRequestInDatabase(req.body, connection);
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

        returnLastInsert(results.insertId,'reports', res, connection);
    })
    connection.unprepare();

})

// POST /api/reporter -> insert a reporter record and returns ID of the last inserted row
app.post('/api/reporters', upload.none(), (req, res) => {
    console.log('POST /api/reporter');
    logger.info('POST /api/reporter')
    logger.info('REQUEST:',req.body);
    storeRequestInDatabase(req.body, connection);

    const preparedSql = 'INSERT INTO `reporters` (`first_name`, `last_name`, `email`, `phone_number`, `how_can_help`, `report_id`) values (?,?,?,?,?,?)';
    const values = [
        req.body.firstName,
        req.body.lastName,
        req.body.email,
        req.body.phone,
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

        returnLastInsert(results.insertId,'reporters', res, connection);
    })
    connection.unprepare();
})

// POST /api/test -> does not insert anything into the DB but tests receiving a POST request, returns the request body
app.post('/api/test', (req, res) => {
    console.log('Received POST request to /api/test')
    console.log(JSON.stringify(req.body));
    res.json({
        'status': 'success',
        'message': 'POST request received',
        'dataReceived': JSON.stringify(req.body)
    })
})

// Server listening
app.listen(port, () => {
    console.log('Listening on port ' + port);
})

