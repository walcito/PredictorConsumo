import express from "express";
import {
  getHome,
  postCalculatePrediction,
  postClearForm
} from "../controllers/predictionController.js";

const router = express.Router();

router.get("/", getHome);
router.post("/predict", postCalculatePrediction);
router.post("/clear", postClearForm);
router.post("/", postCalculatePrediction);

export default router;
