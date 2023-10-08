import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import dalleRoutes from "./routes/dalle.routes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({limit: "50gb"}))
app.use('/api/v1/dalle', dalleRoutes);
app.get('/', (req, res) => {
    return res.status(200).json({message: "Hello from backend"})
});

app.listen(8080, () => console.log("Server is started"))