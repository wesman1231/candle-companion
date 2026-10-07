import express from 'express';
import candleRoutes from './routes/candleRoutes';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use('/api', candleRoutes);
app.get('/', (req, res) => {
  res.send('server is running.');
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
