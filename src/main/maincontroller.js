let router = require('express').Router();
const path = require('path');
const rofl = require('../log/file_logger');
const ERROR_RESPONSES = require('../err/error_repo');
const serviceregistry = require('../controllers/controller_registry');
const uiregistry = require('../view/ui_registry');

if (serviceregistry.entries && serviceregistry.entries.length > 0) {
    for (let s in serviceregistry.entries) {
        if (serviceregistry.entries[s].path) {
            rofl.info('', {}, 'registered service in main router', serviceregistry.entries[s].name);
            router.use('/service/i/' + serviceregistry.entries[s].name, require(serviceregistry.entries[s].path));
        }
    }
}

if (uiregistry.entries && uiregistry.entries.length > 0) {
    for (let s in uiregistry.entries) {
        if (uiregistry.entries[s].path) {
            rofl.info('', {}, 'registered ui in main router', uiregistry.entries[s].file);
            router.get('/ui/' + uiregistry.entries[s].name, (req, res) => {
                const execid = Date.now();
                rofl.info(execid, req, 'received in ui router');
                rofl.info(execid, req, 'going to render page', uiregistry.entries[s].file);
                res.sendFile(uiregistry.entries[s].path, {
                    root: path.join(__dirname,  '../view')
                });
            });
        }
    }
}

router.get('/services', (req, res) => {
    let execid = Date.now();
    rofl.info(execid, req, 'received in main');
    rofl.info(execid, req, 'going to find services');
    if (serviceregistry.entries && serviceregistry.entries.length > 0) {
        rofl.info(execid, req, 'service found', serviceregistry.entries.length);
        res.json(serviceregistry.entries);
    } else {
        rofl.error(execid, req, 'no service found');
        res.json(ERROR_RESPONSES.EXCEPTION_RESPONSE);
    }
    res.end();
});

router.get('/pages', (req, res) => {
    let execid = Date.now();
    rofl.info(execid, req, 'received in main');
    rofl.info(execid, req, 'going to find pages');
    if (uiregistry.entries && uiregistry.entries.length > 0) {
        rofl.info(execid, req, 'page found', uiregistry.entries.length);
        res.json(uiregistry.entries);
    } else {
        rofl.error(execid, req, 'no page found');
        res.json(ERROR_RESPONSES.EXCEPTION_RESPONSE);
    }
    res.end();
});

module.exports = router;