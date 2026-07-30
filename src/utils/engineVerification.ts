import {
  calculateReadinessScore,
  calculateAcwrRatio,
  calculateTrainingLoad,
  calculateLcaRiskFactor,
  calculateWeeklyTonnage
} from '../services/analyticsEngine';
import { sanitizeString, sanitizeObject, clampNumber } from './security';
import { ScheduleDay } from '../types';

/**
 * APEX FEMME - Automated Domain Verification & Test Runner
 * Validates mathematical precision of algorithms and data integrity.
 */

export interface TestResult {
  suite: string;
  testName: string;
  passed: boolean;
  message: string;
}

export function runEngineVerificationTests(): TestResult[] {
  const results: TestResult[] = [];

  // 1. Readiness Score test
  const readinessOptima = calculateReadinessScore(75, 4, 85);
  results.push({
    suite: 'AnalyticsEngine',
    testName: 'calculateReadinessScore (High HRV & Streak)',
    passed: readinessOptima.score >= 85 && readinessOptima.label === 'Óptima',
    message: `Expected score >=85 & Óptima, got ${readinessOptima.score} (${readinessOptima.label})`
  });

  const readinessLow = calculateReadinessScore(35, 1, 60);
  results.push({
    suite: 'AnalyticsEngine',
    testName: 'calculateReadinessScore (Low HRV)',
    passed: readinessLow.label === 'Necesitas Descanso',
    message: `Expected Necesitas Descanso, got ${readinessLow.label} (score ${readinessLow.score})`
  });

  // 2. ACWR Ratio test
  const acwrSafe = calculateAcwrRatio(300, 280);
  results.push({
    suite: 'AnalyticsEngine',
    testName: 'calculateAcwrRatio (Safe Range 1.07)',
    passed: acwrSafe.ratio === 1.07 && acwrSafe.level === 'Segura',
    message: `Expected 1.07 & Segura, got ${acwrSafe.ratio} (${acwrSafe.level})`
  });

  const acwrDanger = calculateAcwrRatio(600, 300);
  results.push({
    suite: 'AnalyticsEngine',
    testName: 'calculateAcwrRatio (Overload 2.0)',
    passed: acwrDanger.ratio === 2.0 && acwrDanger.level === 'Peligro de Lesión',
    message: `Expected 2.0 & Peligro de Lesión, got ${acwrDanger.ratio} (${acwrDanger.level})`
  });

  // 3. Training Load test
  const load = calculateTrainingLoad(8, 60);
  results.push({
    suite: 'AnalyticsEngine',
    testName: 'calculateTrainingLoad (sRPE 8 * 60min = 480 AU)',
    passed: load === 480,
    message: `Expected 480 AU, got ${load}`
  });

  // 4. LCA Risk test
  const lcaRisk = calculateLcaRiskFactor('Volante de Contención', 6, 9);
  results.push({
    suite: 'AnalyticsEngine',
    testName: 'calculateLcaRiskFactor (High fatigue & position)',
    passed: lcaRisk.riskLevel === 'Alto',
    message: `Expected Alto risk level, got ${lcaRisk.riskLevel}`
  });

  // 5. Weekly Tonnage test
  const mockSchedule: Partial<ScheduleDay>[] = [
    { totalTonnageKg: 2400 },
    { totalTonnageKg: 3100 },
    { totalTonnageKg: 0 }
  ];
  const tonnage = calculateWeeklyTonnage(mockSchedule as ScheduleDay[]);
  results.push({
    suite: 'AnalyticsEngine',
    testName: 'calculateWeeklyTonnage',
    passed: tonnage === 5500,
    message: `Expected 5500 kg, got ${tonnage}`
  });

  // 6. Security sanitization test
  const rawXss = '<script>alert("xss")</script>';
  const sanitized = sanitizeString(rawXss);
  results.push({
    suite: 'SecurityUtils',
    testName: 'sanitizeString (XSS prevention)',
    passed: !sanitized.includes('<script>'),
    message: `Expected no script tags, got ${sanitized}`
  });

  // 7. Clamp number test
  const clamped = clampNumber(150, 0, 100);
  results.push({
    suite: 'SecurityUtils',
    testName: 'clampNumber (Upper bound)',
    passed: clamped === 100,
    message: `Expected 100, got ${clamped}`
  });

  return results;
}
