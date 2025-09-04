import express from "express";
import cors from "cors";
import cardnetRoutes from "./cardnetRoutes.js";

const app = express();

// Permitir llamadas desde frontend
app.use(cors({ origin: "*" }));
app.use(express.json());

// LOG global
app.use((req, res, next) => {
  console.log(">> Recibí", req.method, req.url);
  next();
});

// Rutas CardNet
app.use("/cardnet", cardnetRoutes);

app.listen(5000, () => {
  console.log("Servidor backend corriendo en puerto 5000 🚀");
});
