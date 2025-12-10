import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import router from './routes/index.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Basic health check at root for easier debugging
app.get('/', (_req, res) => {
    res.json({ message: 'PHYSQ Backend API', status: 'running' });
});

app.use('/api', router);

export default app;
