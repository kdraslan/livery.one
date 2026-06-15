import { logEvent } from 'firebase/analytics';

import type { ModelType } from '@/types';

import { getFirebaseAnalytics } from './config';

export function trackPrediction(model: ModelType): void {
  const analytics = getFirebaseAnalytics();
  if (!analytics) return;

  logEvent(analytics, 'prediction_made', { model_type: model });
}

export function trackError(message: string, context?: string): void {
  const analytics = getFirebaseAnalytics();
  if (!analytics) return;

  logEvent(analytics, 'app_error', { error_message: message, context: context ?? 'unknown' });
}
