import path from "path";
import express from "express";
import requestID from "express-request-id";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import router from "./routes.js";
import cors from "cors";
import checkEnvVariables from "./utils.js";
dotenv.config();

import { fileURLToPath } from "url";

checkEnvVariables();
const version = "11/17/2023";
const PORT = process.env.PORT || 3000;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(requestID());

app.use("/backend", router);

app.get("/", (req, res) => {
  return res.send(`Server is running... ${version} DD/MM/YYYY alfa5`);
});

if (process.env.NODE_ENV === "production") {
  // Node serves the files for the React app
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  app.use(express.static(path.resolve(__dirname, "../client/build")));

  // All other GET requests not handled before will return our React app
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
  });
}

app.listen(PORT, () => {
  console.info(`Server listening on ${PORT}, version: ${version}`);
});
