# livery.one

Web application for predicting liver weight from preoperative clinical measurements.

## Overview

Livery.one automatically selects the best model based on the fields provided:

| Fields provided | Model selected | R² | MAE |
|---|---|---|---|
| Volume + Gender only | Linear Regression | 0.77 | 32.2g |
| + VCI Suprarenal | Ridge Poly2 (partial) | 0.74 | 35.2g |
| + VCI Suprarenal + Venoatrial + Age | Ridge Poly2 (full VCI) | 0.80 | 32.3g |
| + Height + Weight | Ridge Poly2 (body) | **0.86** | 30.3g |
| + Height + Weight + VCI Suprarenal + Venoatrial + Age | Ridge Poly2 (all) | 0.85 | 30.7g |

Height and Weight (used to derive BMI) are the single biggest optional improvement (+9 R² points over baseline).

> **Note:** R² values are on the held-out test set (n≈20). Cross-validation R² is lower (0.67–0.74) and is the more reliable estimate for a dataset of this size.

## Tech Stack

- **Frontend**: Vue 3 + TypeScript + Vite
- **ML Inference**: TensorFlow.js (client-side)
- **Hosting**: Firebase Hosting
- **Analytics**: Firebase Analytics
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

Deployments happen automatically via GitHub Actions on push to `main`. For manual deployment:

```bash
npm run build
firebase deploy
```

## Model Export

Models are trained in the companion `livery-estimator` repository. To re-export:

```bash
cd ../livery-estimator

# Poly2+Ridge variants (auto-selected by the frontend)
python3 analyseAndExport.py
cp tfjs_model/poly2_ridge_params.json ../livery-one/public/models/

# MLP / Neural Network
python3 exportMLPModel.py
cp tfjs_model/tfjs/* ../livery-one/public/models/
cp tfjs_model/scaler_params.json ../livery-one/public/models/
```
