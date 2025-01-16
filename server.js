require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.json({
        'status': 'success',
        'message': 'Hello world!'
    })
})

app.listen(port, () => {
    console.log('Listening on port ' + port);
})