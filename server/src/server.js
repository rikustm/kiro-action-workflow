import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import routes from './routes/index.js';
import workflowRoutes from './routes/workflows.js';
import versionRoutes from './routes/versions.js';
import authRoutes from './routes/auth.js';
import { connectDatabase } from './config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../../.env') });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api', routes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/workflows/:id/versions', versionRoutes);
app.use('/api/auth', authRoutes);

connectDatabase();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
