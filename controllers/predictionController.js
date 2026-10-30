import {
  validateConsumptionData,
  createEmptyInputRows
} from "../services/validationService.js";
import { runPrediction } from "../services/predictionService.js";

let savedFormState = {
  selectedMode: "sma",
  inputType: "inputs",
  inputRows: createEmptyInputRows(),
  historicalData: ""
};

function buildViewState(selectedMode, inputType) {
  const mode = selectedMode || "sma";
  const type = inputType === "textarea" ? "textarea" : "inputs";
  return {
    selectedMode: mode,
    isSMA: mode === "sma",
    isRegresion: mode === "regresion",
    isVariacion: mode === "variacion",
    isTendencia: mode === "tendencia",
    isInputsMode: type === "inputs",
    isTextareaMode: type === "textarea"
  };
}

export function getHome(req, res) {
  res.status(200).render("home", {
    title: "Inicio - Predictor",
    ...buildViewState(savedFormState.selectedMode, savedFormState.inputType),
    inputRows: savedFormState.inputRows,
    historicalData: savedFormState.historicalData,
    hasErrors: false,
    errors: [],
    hasResult: false,
    result: null
  });
}

export function postClearForm(req, res) {
  savedFormState = {
    selectedMode: "sma",
    inputType: "inputs",
    inputRows: createEmptyInputRows(),
    historicalData: ""
  };
  return res.redirect("/");
}

export function postCalculatePrediction(req, res) {
  const selectedMode = req.body.predictionMode || "sma";
  const validation = validateConsumptionData(req.body);

  savedFormState = {
    selectedMode,
    inputType: validation.inputType,
    inputRows: validation.inputRows,
    historicalData: validation.historicalData
  };

  if (!validation.isValid) {
    return res.status(400).render("home", {
      title: "Inicio - Predictor",
      ...buildViewState(selectedMode, validation.inputType),
      inputRows: validation.inputRows,
      historicalData: validation.historicalData,
      hasErrors: true,
      errors: validation.errors,
      hasResult: false,
      result: null
    });
  }

  const result = runPrediction(selectedMode, validation.records);

  return res.status(200).render("home", {
    title: "Resultado - Predictor",
    ...buildViewState(selectedMode, validation.inputType),
    inputRows: validation.inputRows,
    historicalData: validation.historicalData,
    records: validation.records,
    hasErrors: false,
    errors: [],
    hasResult: true,
    result,
    resultIsSMA: result.mode === "sma",
    resultIsRegresion: result.mode === "regresion",
    resultIsVariacion: result.mode === "variacion",
    resultIsTendencia: result.mode === "tendencia"
  });
}
