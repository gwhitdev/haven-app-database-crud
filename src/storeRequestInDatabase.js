function storeRequestInDatabase(requestData, connection) {
    const itemToStore = JSON.stringify(requestData);
    const prepared = 'INSERT INTO `audit` (`entity`) values (?)';
    const values = [itemToStore];

    connection.execute(prepared, values, function (err, results) {
        if (err) console.error(err);
        console.log(results);
    })
}

module.exports = storeRequestInDatabase;