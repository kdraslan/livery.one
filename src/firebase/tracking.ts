import { logEvent } from 'firebase/analytics';
import { getFirebaseAnalytics } from './config';

export function trackPrediction(model: 'linear' | 'mlp' | 'ridge'): void {
  const analytics = getFirebaseAnalytics();
  if (!analytics) return;

  logEvent(analytics, 'prediction_made', { model_type: model });
}

export function trackError(message: string, context?: string): void {
  const analytics = getFirebaseAnalytics();
  if (!analytics) return;

  logEvent(analytics, 'app_error', { error_message: message, context: context ?? 'unknown' });
}
