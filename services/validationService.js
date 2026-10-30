export function createEmptyInputRows() {
  const rows = [];
  for (let i = 0; i < 12; i++) {
    rows.push({
      monthNumber: i + 1,
      date: "",
      consumption: ""
    });
  }
  return rows;
}

function isValidCalendarDate(dateStr) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (month < 1 || month > 12 || day < 1 || day > 31) return false;

  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function validateConsumptionData(body) {
  const errors = [];
  const records = [];
  const inputType = body?.tipoIngreso === "textarea" ? "textarea" : "inputs";
  const validModes = ["sma", "regresion", "variacion", "tendencia"];
  const selectedMode = body?.predictionMode || "sma";

  if (!validModes.includes(selectedMode)) {
    errors.push("El modo de predicción seleccionado no es válido.");
  }

  if (inputType === "textarea") {
    const rawText = typeof body?.historicalData === "string" ? body.historicalData : "";
    const lines = rawText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line !== "");

    if (lines.length !== 12) {
      errors.push(
        `Debe ingresar exactamente 12 series (filas) de fecha y consumo (mínimo 12 y máximo 12). Actualmente ingresó ${lines.length}.`
      );
      return {
        isValid: false,
        errors,
        records: [],
        inputRows: createEmptyInputRows(),
        historicalData: rawText,
        inputType
      };
    }

    lines.forEach((line, index) => {
      const rowNumber = index + 1;
      const parts = line.split(",");

      if (parts.length !== 2) {
        errors.push(
          `Fila ${rowNumber}: Formato inválido ("${line}"). Use exactamente: YYYY-MM-DD, consumo.`
        );
        return;
      }

      const dateStr = parts[0].trim();
      const consumptionStr = parts[1].trim();

      if (!isValidCalendarDate(dateStr)) {
        errors.push(
          `Fila ${rowNumber}: La fecha "${dateStr}" no es válida. Use el formato YYYY-MM-DD.`
        );
      }

      const consumption = Number(consumptionStr);
      if (consumptionStr === "" || isNaN(consumption) || !Number.isFinite(consumption)) {
        errors.push(`Fila ${rowNumber}: El consumo "${consumptionStr}" no es un número válido.`);
      } else if (consumption < 0) {
        errors.push(`Fila ${rowNumber}: El consumo no puede ser negativo.`);
      }

      records.push({
        monthNumber: rowNumber,
        date: dateStr,
        consumption: isNaN(consumption) ? 0 : consumption
      });
    });

    if (errors.length === 0 && records.length === 12) {
      for (let i = 1; i < records.length; i++) {
        if (records[i].date < records[i - 1].date) {
          errors.push(
            `Fila ${i + 1}: Las fechas deben estar organizadas desde el mes más antiguo hasta el más reciente (${records[i].date} es anterior a ${records[i - 1].date}).`
          );
        }
      }
    }

    const inputRows =
      records.length === 12
        ? records.map((r) => ({
            monthNumber: r.monthNumber,
            date: r.date,
            consumption: r.consumption
          }))
        : createEmptyInputRows();

    return {
      isValid: errors.length === 0,
      errors,
      records: errors.length === 0 ? records : [],
      inputRows,
      historicalData: rawText,
      inputType
    };
  }

  const dates = Array.isArray(body?.dates) ? body.dates : [];
  const consumptions = Array.isArray(body?.consumptions) ? body.consumptions : [];
  const inputRows = [];

  for (let i = 0; i < 12; i++) {
    const rowNumber = i + 1;
    const dateStr = String(dates[i] ?? "").trim();
    const consumptionStr = String(consumptions[i] ?? "").trim();

    inputRows.push({
      monthNumber: rowNumber,
      date: dateStr,
      consumption: consumptionStr
    });

    if (!dateStr) {
      errors.push(`Mes ${rowNumber}: La fecha es requerida.`);
    } else if (!isValidCalendarDate(dateStr)) {
      errors.push(`Mes ${rowNumber}: La fecha "${dateStr}" no es válida. Use formato YYYY-MM-DD.`);
    }

    const consumption = Number(consumptionStr);
    if (consumptionStr === "") {
      errors.push(`Mes ${rowNumber}: El consumo en kWh es requerido.`);
    } else if (isNaN(consumption) || !Number.isFinite(consumption)) {
      errors.push(`Mes ${rowNumber}: El consumo debe ser un número válido.`);
    } else if (consumption < 0) {
      errors.push(`Mes ${rowNumber}: El consumo no puede ser negativo.`);
    }

    records.push({
      monthNumber: rowNumber,
      date: dateStr,
      consumption: isNaN(consumption) ? 0 : consumption
    });
  }

  if (errors.length === 0 && records.length === 12) {
    for (let i = 1; i < records.length; i++) {
      if (records[i].date < records[i - 1].date) {
        errors.push(
          `Mes ${i + 1}: Los registros deben estar organizados desde el mes más antiguo al más reciente (${records[i].date} es anterior a ${records[i - 1].date}).`
        );
      }
    }
  }

  const historicalData =
    errors.length === 0
      ? records.map((r) => `${r.date}, ${r.consumption}`).join("\n")
      : typeof body?.historicalData === "string"
      ? body.historicalData
      : "";

  return {
    isValid: errors.length === 0,
    errors,
    records: errors.length === 0 ? records : [],
    inputRows,
    historicalData,
    inputType
  };
}
