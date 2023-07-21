import express from 'express';
import filesRouter from './routes/files.js';

import morgan from 'morgan';

const app = express();

app.use(morgan('dev'));

app.use(express.json());

app.use('/api/files', filesRouter);

const port = process.env.PORT || 5000;
const listener = app.listen(port, () => {
  console.log('Listening on port ' + listener.address().port + '...');
});
