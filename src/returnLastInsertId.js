const returnLastInsert = (insertId, tableName, res, connection) => {
    // Some basic validation for inserting into the correct table
    let preparedLastInsertSql = '';
    if (tableName === 'reports') preparedLastInsertSql = 'select * from `reports` where `id` = ?';
    if (tableName === 'reporters') preparedLastInsertSql = 'select * from `reporters` where `id` = ?';

    // Prepare the prepared values
    const valuesForLastInsert  = [insertId];

    // Then insert the values into the DB with the correct table
    connection.execute(preparedLastInsertSql, valuesForLastInsert, function (err, results) {
        if (err) return err;
        res.json({
            status: 'success',
            message: 'Successfully inserted into table',
            results
        })
    })
}

module.exports = returnLastInsert;

