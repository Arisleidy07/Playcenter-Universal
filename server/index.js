import express from "express";
import cors from "cors";
import cardnetRoutes from "./cardnetRoutes.js";

const app = express();

// Permitir llamadas desde frontend
app.use(cors({ origin: "*" }));
app.use(express.json());

// LOG global para depuración
app.use((req, res, next) => {
  console.log(">> Recibí", req.method, req.url);
  next();
});

// Rutas CardNet
app.use("/cardnet", cardnetRoutes);

// Render usa process.env.PORT, en local usamos 5000
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en puerto ${PORT} 🚀`);
});
