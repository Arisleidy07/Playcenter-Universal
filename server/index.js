import express from "express";
import cors from "cors";
import cardnetRoutes from "./cardnetRoutes.js";

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

// LOG global
app.use((req, res, next) => {
  console.log(">> Recibí", req.method, req.url);
  next();
});

// Rutas CardNet
app.use("/cardnet", cardnetRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en puerto ${PORT} 🚀`);
});
