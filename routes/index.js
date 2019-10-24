var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Jira Dependency Mapper' });
  //   res.render('home');
});

// router.listen(8000, () => {
//   console.log('Example app listening on port 8000!')
// })

module.exports = router;
