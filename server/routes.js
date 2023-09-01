import express from "express";
import { getDroppedAssets } from "./utils/index.js";
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Hello from server!" });
});

router.get("/dropped-assets", getDroppedAssets);

export default router;
