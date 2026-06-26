<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset=".github/logo-dark.svg">
    <img alt="Livery.one" src=".github/logo-light.svg" height="44">
  </picture>
</p>

<p align="center">
  Predict liver weight from preoperative clinical measurements, right in the browser.
</p>

<p align="center">
  <a href="https://livery.one">livery.one</a>
</p>

---

## Overview

Livery.one estimates intraoperative liver weight from a handful of preoperative measurements. Every prediction runs client-side with TensorFlow.js, nothing is sent to a server, and the app automatically selects the most accurate model it can from the fields you provide:

| Fields provided | Model selected | R² | MAE |
|---|---|---|---|
| Volume + Gender only | Linear Regression | 0.77 | 32.2g |
| + VCI Suprarenal | Ridge Poly2 (partial) | 0.74 | 35.2g |
| + VCI Suprarenal + Venoatrial + Age | Ridge Poly2 (full VCI) | 0.80 | 32.3g |
| + Height + Weight | Ridge Poly2 (body) | **0.86** | 30.3g |
| + Height + Weight + VCI Suprarenal + Venoatrial + Age | Ridge Poly2 (all) | 0.85 | 30.7g |

Height and Weight (used to derive BMI) are the single biggest optional improvement, roughly +9 R² points over the baseline.

> **Note:** these R² values are on the held-out test set (n≈20). Cross-validation R² is lower (0.67–0.74) and is the more reliable estimate for a dataset of this size.

## Tech stack

- **Frontend**: Vue 3 + TypeScript + Vite
- **ML inference**: TensorFlow.js (client-side)
- **Hosting**: Firebase Hosting
- **CI/CD**: GitHub Actions

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deployment

Deployments happen automatically via GitHub Actions on push to `main`. To deploy manually:

```bash
npm run build && firebase deploy
```

## Model export

The models are trained in the companion **livery-estimator** repository. To re-export them into `public/models/`:

```bash
cd ../livery-estimator

# Poly2 + Ridge variants (auto-selected by the frontend)
python3 analyseAndExport.py
cp tfjs_model/poly2_ridge_params.json ../livery-one/public/models/

# MLP / neural network
python3 exportMLPModel.py
cp tfjs_model/tfjs/* ../livery-one/public/models/
cp tfjs_model/scaler_params.json ../livery-one/public/models/
```

## Related repositories

This is the web app in a three-part project:

- **[livery-estimator](https://github.com/kdraslan/livery.estimator)** — the machine learning pipeline that trains and exports the models loaded here.
- **[livery-article](https://github.com/kdraslan/livery.article)** — the research paper behind the method.
