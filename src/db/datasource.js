var MongoClient = require('mongodb').MongoClient;
const rofl = require('../log/file_logger');
var dbrofl = require('../log/db_logger');
var mongoConfig = require('./mongo_config');
var dbEventHandler = require('./db_event_handler');

class DataSource {

    constructor() {
        this._client = undefined;
    }

    async connect(_cb) {
        return new Promise((resolve, reject) => {
            MongoClient.connect(mongoConfig.url, mongoConfig.options).then((client) => {
                this._client = client;
                rofl.info('', {}, 'Connected');
                dbrofl.initDbLogging();
                dbEventHandler(this._client, '');
                if(_cb) _cb(this._client);
                resolve(client);
            }).catch((err) => {
                rofl.fatal('', {}, 'Could NOT connect database', err);
                reject(err);
            });
        });
    }

    async getdb(c, dbname) {
        return c.db(dbname);
    }

    async getcollection(db, collectionname) {
        return await db.collection(collectionname);
    }

    async getcollections(dbname) {
        let _db = this.getdb;
        let _disconnect = this.disconnect;

        return new Promise((resolve, reject) => {
            this.connect((c) => {
                _db(c, dbname).then((db) => {
                    return db.collections();
                }).then((doc) => {
                    resolve(doc);
                }).then(() => {
                    _disconnect(c);
                }).catch((err) => {
                    reject(err);
                });
            });
        });
    }

    disconnect(c) {
        c.close();
    }

    async find(dbname, collectionname, q) {
        let _db = this.getdb;
        let _coll = this.getcollection;
        let _disconnect = this.disconnect;
        rofl.info('', {}, 'query', q);

        return new Promise((resolve, reject) => {
            this.connect((c) => {
                _db(c, dbname).then((db) => {
                    return _coll(db, collectionname);
                }).then((coll) => {
                    return coll.find(q).toArray();
                }).then((doc) => {
                    resolve(doc);
                }).then(() => {
                    _disconnect(c);
                }).catch((err) => {
                    reject(err);
                });
            }).catch((err) => {
                rofl.fatal('', {}, 'Connect error', err);
            });
        });
    }
}

module.exports = new DataSource();