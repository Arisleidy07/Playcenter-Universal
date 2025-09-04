import express from "express";
import cors from "cors";
import cardnetRoutes from "./cardnetRoutes.js";

const app = express();

// Permitir llamadas desde frontend
app.use(cors({ origin: "*" }));
app.use(express.json());

// Rutas CardNet
app.use("/cardnet", cardnetRoutes);

app.listen(5000, () => {
  console.log("Servidor backend corriendo en puerto 5000 🚀");
});
