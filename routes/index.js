var express = require('express');
var router = express.Router();
const { Pool, Client } = require('pg')


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/test', function(req, res, next) {
  const pool = new Pool({
    user: 'dbuser',
    host: 'database.server.com',
    database: 'mydb',
    password: 'secretpassword',
    port: 3211,
  })
// pool.query('SELECT NOW()', (err, res) => {
//   console.log(err, res)
//   pool.end()
// })
  const client = new Client({
    user: 'chenghzi',
    host: '47.100.38.198',
    database: 'db4f9ee9229f1349049ff9c92c73b2332alolm',
    password: 'E623dfsgW',
    port: 5433,
  })
  client.connect()
  let sql = `SELECT * FROM employees limit 10;`
  client.query(sql, (err, dbRes) => {
    client.end()
    // console.log(clientres.rows)
    let data = [...dbRes.rows];
    res.json(data)
  })
});


module.exports = router;
