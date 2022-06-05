const router = require('express').Router();
var ObjectID = require('mongodb').ObjectID;
const rofl = require('../../log/file_logger');
const ds = require('../../db/datasource');
const searchpref = require('./searchpref').searchkeys;
const ERROR_RESPONSES = require('../../err/error_repo');

router.get('/gen/:db/:coll/:id?', (req, res) => {
    const execid = Date.now();
    rofl.info(execid, req, 'received in service router');
    rofl.info(execid, req, 'going to invoke service');
    let db = req.params.db;
    let coll = req.params.coll;
    let p, q = {};
    if (req.params.id) {
        p = req.params.id;
        let isJSON = false;
        let jsonP = {};
        try {
            let pF = p.replace(/'/g, '\"');
            jsonP = JSON.parse(pF);
            isJSON = (typeof jsonP == 'object') && true;
        } catch {
            isJSON = false;
        }
        let numP = parseFloat(p);
        if (isJSON) {
            q = jsonP;
        } else if (!isNaN(p) && numP > (new Date(2019, 0, 1)).getTime()) {
            q['execid'] = numP;
        } else {
            try {
                q['_id'] = new ObjectID(p);
            } catch (e) {
                q['$or'] = [];
                for (let i in searchpref[db]) {
                    let key = searchpref[db][i];
                    let orClause = {};
                    orClause[key] = p;
                    q['$or'].push(orClause);
                }
            }
        }
    }

    ds.find(db, coll, q).then((doc) => {
        if (doc.length < 1) {
            rofl.error(execid, req, 'record not found');
            res.json(ERROR_RESPONSES.NO_DOC_FOUND);
        } else {
            rofl.info(execid, req, 'record found', doc.length);
            res.json(doc);
        }
    }).catch((err) => {
        rofl.error(execid, req, 'record not found', err);
        res.json(err);
    });
});

router.get('/colls/:db', (req, res) => {
    const execid = Date.now();
    rofl.info(execid, req, 'received in service router');
    rofl.info(execid, req, 'going to invoke service');
    ds.getcollections(req.params.db).then((colls) => {
        if (colls.length < 1) {
            rofl.error(execid, req, 'collections not found');
            res.json(ERROR_RESPONSES.NO_DOC_FOUND);
        } else {
            rofl.info(execid, req, 'collections found', colls.length);
            let collectionNames = [];
            for (let i in colls) {
                collectionNames.push(colls[i].collectionName);
            }
            res.json(collectionNames);
        }
    }).catch((err) => {
        rofl.error(execid, req, 'collections not found', err);
        res.json(err);
    });
})

module.exports = router;