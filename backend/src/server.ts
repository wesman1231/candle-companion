import express from 'express';
import cors from 'cors';
import { pool } from '../src/db/db.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = process.env.SERVER_PORT;
app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});