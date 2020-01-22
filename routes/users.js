var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', (req, res) => {
    return res.send('GET HTTP method on user resource');
});
router.post('/', (req, res) => {
    return res.send('POST HTTP method on user resource');
});
router.put('/:userId', (req, res) => {
    return res.send(
        `PUT HTTP method on user/${req.params.userId} resource`,
    );
});
router.delete('/:userId', (req, res) => {
    return res.send(
        `DELETE HTTP method on user/${req.params.userId} resource`,
    );
});
module.exports = router;
