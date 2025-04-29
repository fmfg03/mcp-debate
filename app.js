// backend/src/app.js
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import http from 'http';
import { Server } from 'socket.io';

import { config } from './config/env.js';
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import conversationRoutes from './routes/conversationRoutes.js';
import debateRoutes from './routes/debateRoutes.js';
// En frontend/src/App.jsx, añadir:
import DebateView from './pages/DebateView';

import { initSocket } from './socket/init.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

initSocket(io);

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/debates', debateRoutes);

app.use(errorHandler);

// En las rutas protegidas:
<Route path="/debates/:id" element={<PrivateRoute><DebateView /></PrivateRoute>} />

const PORT = config.port || 4000;

server.listen(PORT, () => {
  console.log(`MCP Backend server running on port ${PORT}`);
});
