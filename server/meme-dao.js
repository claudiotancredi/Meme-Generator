'use strict';
/* Data Access Object (DAO) module for accessing memes */

const db = require('./db');

/**
 * Query the db to get all the memes (both public and protected)
 * @returns a promise that will resolve to the list of memes retrieved from the db
 */
exports.retrieveAll = () => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT memes.id, memes.title, images.url, memes.sentence1, memes.sentence2, memes.sentence3, images.cssSentencesPosition, memes.cssFontClass, memes.cssColourClass, memes.protected, users.name, memes.user FROM memes, images, users WHERE memes.bgImage=images.id AND memes.user=users.id";
        db.all(sql, [], (err, rows) => {
            if (err)
                reject(err);
            else
                resolve(rows);
        });
    });
}

/**
 * Query the db to get all PUBLIC memes
 * @returns a promise that will resolve to the list of public memes retrieved from the db
 */
exports.retrieveOnlyPublic = () => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT memes.id, memes.title, images.url, memes.sentence1, memes.sentence2, memes.sentence3, images.cssSentencesPosition, memes.cssFontClass, memes.cssColourClass, memes.protected, users.name, memes.user FROM memes, images, users WHERE memes.protected=0 AND memes.bgImage=images.id AND memes.user=users.id";
        db.all(sql, [], (err, rows) => {
            if (err)
                reject(err);
            else
                resolve(rows);
        });
    });
}

/**
 * Query the db to delete a meme given its id
 * @param {string} id id of the meme to delete
 * @param {number} user user id of the user who's doing the request. The operation is done only if the meme belongs to the logged user
 * @returns a promise that will resolve
 */
exports.deleteByID = (id, user) => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM memes WHERE id = ? AND user = ?';
        db.run(sql, [id, user], function (err) {
            if (err)
                reject(err);
            else if (this.changes === 0)
                reject({
                    errors: [{
                        value: id, msg: "The specified id does not point to any resource on the server. Please be sure to point to an existing resource",
                        param: "id", location: "params"
                    }]
                })
            else
                resolve();
        });
    });
}

/**
 * Query the db to insert a new meme. Id will be automatically chosen by sqlite
 * @param {object} meme meme to insert in the db
 * @param {number} user user id of the user who's doing the request
 * @returns a promise that will resolve to the id of the new inserted meme
 */
exports.insertMeme = (meme, user) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO memes (title, bgImage, sentence1, sentence2, sentence3, cssFontClass, cssColourClass, protected, user) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)';
        db.run(sql, [meme.title, meme.imageId, meme.sentence1, meme.sentence2, meme.sentence3, meme.cssFontClass, meme.cssColourClass, meme.prot, user], function (err) {
            if (err)
                reject(err);
            else
                resolve(this.lastID);
        });
    });
};