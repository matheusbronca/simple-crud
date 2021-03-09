const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const { json } = require('express');
const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  user: 'root',
  password: '',
  host: '127.0.0.1',
  database: 'crud_db',
});

app.post('/api/create', (req, res) => {
  const { name, age, gender, position, wage } = req.body;

  const query =
    'INSERT INTO employees (name, age, gender, position, wage) VALUES (?,?,?,?,?);';

  db.query(query, [name, age, gender, position, wage], (err, result) => {
    if (err) return console.log(err);
    return res.send('Insert Succeeded');
  });
});

app.get('/api/employees', (req, res) => {
  const query = 'SELECT * FROM employees;';

  db.query(query, (err, result) => {
    if (err) {
      throw new Error(err);
    }

    return res.send(result);
  });
});

app.put('/api/update', (req, res) => {
  const { id, name, age, gender, position, wage } = req.body;

  const query =
    'UPDATE employees SET name = ?, age = ?, gender = ?, position = ?, wage = ?  WHERE id = ?;';

  db.query(query, [name, age, gender, position, wage, id], (err, result) => {
    if (err) throw new Error(err);

    return res.send(result);
  });
});

app.delete('/api/delete/:id', (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM employees WHERE id = ?';
  db.query(query, id, (err, result) => {
    if (err) throw new Error();

    return res.send(result);
  });
});

app.listen(3001, () => {
  console.log('Yey, your server is running on port 3001 =)');
});
