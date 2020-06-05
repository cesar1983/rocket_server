import express from "express";
import cors from "cors";
import path from "path";
import routes from "./routes";

const app = express();

app.use(cors()); // desta forma permite todas urls acessarem

// Define que o express vai usar json
app.use(express.json());

// importa as rotas definidas em ./routes.ts
app.use(routes);

console.log(path.resolve(__dirname, "..", "uploads"));

app.use("/uploads", express.static(path.resolve(__dirname, "..", "uploads")));

app.listen(3333);
