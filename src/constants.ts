/**Application-wide constants for prediction models and UI configuration.*/

// Model accuracy (R² CV) hints for different feature combinations.
export const MODEL_ACCURACY = {
  BASELINE: 0.716, // Volume + Gender only.
  BODY_MODE: 0.86, // + Height + Weight.
  BODY_AND_VCI: 0.85, // + Body + VCI Suprarenal.
  FULL_VCI: 0.80, // + Age + VCI Venoatrial.
  VCI_ONLY: 0.74, // + VCI Suprarenal only.
};

// Display labels for accuracy percentages.
export const ACCURACY_LABELS = {
  BODY_AND_VCI: '85%',
  BODY_MODE: '86%',
  FULL_VCI: '80%',
  VCI_ONLY: '74%',
};

// Validation thresholds for numeric inputs.
export const VALIDATION = {
  MIN_VOLUME: 0,
  MIN_HEIGHT: 0,
  MIN_WEIGHT: 0,
  MIN_AGE: 0,
  MIN_VCI: 0,
};

// UI animation and style timing.
export const UI = {
  BLUR_AMOUNT: 'blur(12px)',
  TRANSITION_DURATION: '300ms',
};

// Form field labels and units.
export const FORM_FIELDS = {
  VOLUME: { label: 'Preoperation Volume', unit: 'CC', hint: 'Liver volume estimated from CT scan' },
  GENDER: { label: 'Gender', hint: 'Biological sex of the patient' },
  HEIGHT: { label: 'Height', unit: 'cm', hint: 'Patient height' },
  WEIGHT: { label: 'Weight', unit: 'kg', hint: 'Patient body weight' },
  AGE: { label: 'Age', unit: 'years', hint: 'Patient age' },
  VCI_SUPRA: { label: 'VCI Area Suprarenal', unit: 'cm²', hint: 'IVC cross-section at suprarenal level' },
  VCI_VENO: { label: 'VCI Area Venoatrial', unit: 'cm²', hint: 'IVC cross-section at venoatrial level' },
};

// Gender options for select dropdown.
export const GENDER_OPTIONS = [
  { value: '0', label: 'Female' },
  { value: '1', label: 'Male' },
];
