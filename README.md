# livery.one

Web application for predicting liver weight from preoperative clinical measurements.

## Overview

Livery.one provides two prediction modes:

- **Standard Mode**: Linear regression using Preoperation Volume and Gender (R² = 0.75, MAE = 32.15g)
- **Enhanced Mode**: MLP neural network using Volume, Gender, and VCI Area Suprarenal — runs entirely in the browser via TensorFlow.js

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

The MLP model is trained in the companion `livery-estimator` repository. To re-export:

```bash
cd ../livery-estimator
python3 export_mlp_model.py
cp tfjs_model/tfjs/* ../livery-one/public/models/
cp tfjs_model/scaler_params.json ../livery-one/public/models/
```
