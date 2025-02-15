import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import entryRoutes from "./routes/entryRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import path from "path";

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, "..", "public")));
app.use(express.json());

app.use(userRoutes);
app.use(categoryRoutes);
app.use(entryRoutes);
app.use(dashboardRoutes);

export default app;
