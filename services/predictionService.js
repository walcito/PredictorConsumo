export function calculateSMA(records) {
  const lastThree = records.slice(-3);
  const sum = lastThree.reduce((acc, item) => acc + item.consumption, 0);
  const average = sum / 3;
  const lastConsumption = records[records.length - 1].consumption;

  let trend = "Estable";
  let alertClass = "alert-warning";
  let icon = "→";
  let message = "La tendencia del consumo es estable.";

  if (lastConsumption > average) {
    trend = "Alcista";
    alertClass = "alert-danger";
    icon = "↑";
    message = "La tendencia del consumo es alcista.";
  } else if (lastConsumption < average) {
    trend = "Bajista";
    alertClass = "alert-success";
    icon = "↓";
    message = "La tendencia del consumo es bajista.";
  }

  return {
    mode: "sma",
    modeTitle: "Promedio Móvil Simple (SMA)",
    average: average.toFixed(2),
    nextMonthPrediction: average.toFixed(2),
    lastConsumption: lastConsumption.toFixed(2),
    trend,
    alertClass,
    icon,
    message
  };
}

export function calculateLinearRegression(records) {
  const n = records.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  records.forEach((record, index) => {
    const x = index + 1;
    const y = record.consumption;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  });

  const numerator = sumXY - (sumX * sumY) / n;
  const denominator = sumX2 - (sumX * sumX) / n;
  const m = denominator !== 0 ? numerator / denominator : 0;

  const meanX = sumX / n;
  const meanY = sumY / n;
  const b = meanY - m * meanX;

  const nextMonthX = n + 1;
  const predictionMonth13 = m * nextMonthX + b;

  let trend = "Estable";
  let alertClass = "alert-warning";
  let icon = "→";
  let message = "El consumo es estable.";

  if (m > 0) {
    trend = "Alcista";
    alertClass = "alert-danger";
    icon = "↑";
    message = "El consumo es alcista.";
  } else if (m < 0) {
    trend = "Bajista";
    alertClass = "alert-success";
    icon = "↓";
    message = "El consumo es bajista.";
  }

  return {
    mode: "regresion",
    modeTitle: "Regresión Lineal",
    predictionMonth13: predictionMonth13.toFixed(2),
    slope: m.toFixed(4),
    intercept: b.toFixed(4),
    trend,
    alertClass,
    icon,
    message
  };
}

export function calculatePercentageVariation(records) {
  const monthlyVariations = [];
  const validVariations = [];

  records.forEach((record, index) => {
    const monthLabel = `Mes ${index + 1}`;

    if (index === 0) {
      monthlyVariations.push({
        month: monthLabel,
        date: record.date,
        consumption: record.consumption.toFixed(2),
        isFirst: true,
        isZeroPrev: false,
        variationText: "n/a"
      });
      return;
    }

    const previousConsumption = records[index - 1].consumption;
    const currentConsumption = record.consumption;

    if (previousConsumption === 0) {
      monthlyVariations.push({
        month: monthLabel,
        date: record.date,
        consumption: currentConsumption.toFixed(2),
        isFirst: false,
        isZeroPrev: true,
        variationText: "La variación no puede ser calculada para este periodo (consumo anterior = 0)"
      });
      return;
    }

    const variation = ((currentConsumption - previousConsumption) / previousConsumption) * 100;
    validVariations.push(variation);

    monthlyVariations.push({
      month: monthLabel,
      date: record.date,
      consumption: currentConsumption.toFixed(2),
      isFirst: false,
      isZeroPrev: false,
      variationText: `${variation.toFixed(2)}%`
    });
  });

  const averageVariation =
    validVariations.length > 0
      ? validVariations.reduce((acc, val) => acc + val, 0) / validVariations.length
      : 0;

  let trend = "Estable";
  let alertClass = "alert-warning";
  let icon = "→";
  let message = "El consumo general permanece estable.";

  if (averageVariation > 1) {
    trend = "Aumentando";
    alertClass = "alert-danger";
    icon = "↑";
    message = "El consumo general está aumentando.";
  } else if (averageVariation < -1) {
    trend = "Disminuyendo";
    alertClass = "alert-success";
    icon = "↓";
    message = "El consumo general está disminuyendo.";
  }

  return {
    mode: "variacion",
    modeTitle: "Variación Porcentual",
    monthlyVariations,
    averageVariation: averageVariation.toFixed(2),
    trend,
    alertClass,
    icon,
    message
  };
}

export function calculateTrendDetection(records) {
  let increases = 0;
  let decreases = 0;
  let stables = 0;
  const comparisons = [];

  for (let i = 1; i < records.length; i++) {
    const prev = records[i - 1];
    const curr = records[i];
    let status = "estable";

    if (curr.consumption > prev.consumption) {
      increases++;
      status = "sube";
    } else if (curr.consumption < prev.consumption) {
      decreases++;
      status = "baja";
    } else {
      stables++;
      status = "estable";
    }

    comparisons.push({
      period: `Mes ${i} → Mes ${i + 1}`,
      from: prev.consumption.toFixed(2),
      to: curr.consumption.toFixed(2),
      status
    });
  }

  let trend = "Estable";
  let alertClass = "alert-warning";
  let icon = "→";
  let message = "La tendencia general del consumo es estable.";

  if (increases > decreases && increases > stables) {
    trend = "Alcista";
    alertClass = "alert-danger";
    icon = "↑";
    message = "La tendencia general del consumo es alcista.";
  } else if (decreases > increases && decreases > stables) {
    trend = "Bajista";
    alertClass = "alert-success";
    icon = "↓";
    message = "La tendencia general del consumo es bajista.";
  } else if (stables > increases && stables > decreases) {
    trend = "Estable";
    alertClass = "alert-warning";
    icon = "→";
    message = "La tendencia general del consumo es estable.";
  }

  return {
    mode: "tendencia",
    modeTitle: "Detección de Tendencia",
    increases,
    decreases,
    stables,
    comparisons,
    trend,
    alertClass,
    icon,
    message
  };
}

export function runPrediction(mode, records) {
  switch (mode) {
    case "regresion":
      return calculateLinearRegression(records);
    case "variacion":
      return calculatePercentageVariation(records);
    case "tendencia":
      return calculateTrendDetection(records);
    case "sma":
    default:
      return calculateSMA(records);
  }
}
