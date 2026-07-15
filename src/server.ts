import express from "express";
import { createApplicationDependencies } from "./composition-root.js";

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(express.json());

const { userController } = createApplicationDependencies();

app.get("/health", (_request, response) => {
  response.status(200).json({ status: "ok" });
});

app.post("/users", userController.register);
app.get("/users/:id", userController.getById);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
