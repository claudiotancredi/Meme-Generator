'use strict';
/* Data Access Object (DAO) module for accessing images */

const db = require('./db');

/**
 * Query the db to get all the images
 * @returns a promise that will resolve to the list of images retrieved from the db
 */
exports.retrieveAll = () => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM images";
        db.all(sql, [], (err, rows) => {
            if (err)
                reject(err);
            else
                resolve(rows);
        });
    });
}