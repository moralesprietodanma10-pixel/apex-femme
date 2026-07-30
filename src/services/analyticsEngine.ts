import { PlayerProfile, SmartwatchData, MatchLog, ScheduleDay } from '../types';

/**
 * APEX FEMME - Core Sports Science & Analytics Engine
 * Pure functional domain logic decoupled from React & UI rendering.
 * Handled according to SOLID and Clean Architecture principles.
 */

export interface ReadinessResult {
  score: number;
  label: 'Óptima' | 'Moderada' | 'Necesitas Descanso';
  color: 'emerald' | 'amber' | 'red';
  recommendation: string;
  evidenceLevel: 'Alta' | 'Moderada' | 'Limitada';
}

export interface AcwrResult {
  ratio: number;
  level: 'Segura' | 'Elevada' | 'Peligro de Lesión';
  recommendation: string;
}

/**
 * Calculates Readiness Score (0-100) based on HRV, streak, and biometric telemetry.
 * Reference: Flatt & Esco (2017) HRV readiness framework for team sports.
 */
export function calculateReadinessScore(
  hrvMs: number,
  streakDays: number,
  sleepScore = 80
): ReadinessResult {
  const safeHrv = Math.max(20, Math.min(120, hrvMs || 68));
  const streakBonus = streakDays > 3 ? 8 : streakDays > 1 ? 4 : 0;
  const sleepBonus = (sleepScore - 70) * 0.2;

  const score = Math.min(99, Math.max(45, Math.round(safeHrv * 1.08 + streakBonus + sleepBonus)));

  if (score >= 85) {
    return {
      score,
      label: 'Óptima',
      color: 'emerald',
      recommendation: 'HRV indica recuperación completa del SNC. Ventana ideal para cargas de alta intensidad.',
      evidenceLevel: 'Moderada'
    };
  }
  if (score >= 68) {
    return {
      score,
      label: 'Moderada',
      color: 'amber',
      recommendation: 'Capacidad de carga media. Sesión técnica o táctica recomendada.',
      evidenceLevel: 'Moderada'
    };
  }
  return {
    score,
    label: 'Necesitas Descanso',
    color: 'red',
    recommendation: 'HRV bajo. Prioriza recuperación activa: movilidad suave, hidratación y sueño ≥8h.',
    evidenceLevel: 'Alta'
  };
}

/**
 * Computes Acute-to-Chronic Workload Ratio (ACWR)
 * Acute (7 days volume) / Chronic (28 days weekly avg volume)
 */
export function calculateAcwrRatio(
  currentWeeklyMinutes: number,
  monthlyAvgMinutes: number
): AcwrResult {
  const safeChronic = Math.max(1, monthlyAvgMinutes || 1);
  const ratio = Math.round((currentWeeklyMinutes / safeChronic) * 100) / 100;

  if (ratio > 1.5) {
    return {
      ratio,
      level: 'Peligro de Lesión',
      recommendation: 'Pico de carga excesivo (ACWR > 1.5). Riesgo elevado de lesión muscular o articular.'
    };
  }
  if (ratio > 1.3) {
    return {
      ratio,
      level: 'Elevada',
      recommendation: 'Carga semanal en límite superior. Se sugiere ajustar intensidad en próximas 48h.'
    };
  }
  return {
    ratio,
    level: 'Segura',
    recommendation: 'Ratio de carga en zona dulce (0.8 - 1.3). Adaptación positiva sostenida.'
  };
}

/**
 * Computes Session RPE Training Load (Arbitrary Units AU = RPE * Duration in minutes)
 */
export function calculateTrainingLoad(rpe: number, durationMin: number): number {
  const safeRpe = Math.max(1, Math.min(10, rpe || 5));
  const safeDuration = Math.max(0, durationMin || 0);
  return safeRpe * safeDuration;
}

/**
 * Computes total weekly tonnage in kg for strength sessions
 */
export function calculateWeeklyTonnage(schedule: ScheduleDay[]): number {
  return schedule.reduce((acc, day) => acc + (day.totalTonnageKg || 0), 0);
}

/**
 * Assesses Anterior Cruciate Ligament (LCA) Injury Risk Factor for female footballers
 * Based on Hewett et al. (2005) & Petersen et al. (2011)
 */
export function calculateLcaRiskFactor(
  position: string,
  streakDays: number,
  recentMatchRpe: number
): { riskLevel: 'Bajo' | 'Moderado' | 'Alto'; advice: string } {
  let riskScore = 0;

  // Female-specific biomechanical risk factors
  if (streakDays >= 5) riskScore += 2;
  if (recentMatchRpe >= 8) riskScore += 2;
  if (position.includes('Contención') || position.includes('Central') || position.includes('Lateral')) {
    riskScore += 1;
  }

  if (riskScore >= 4) {
    return {
      riskLevel: 'Alto',
      advice: 'Fatiga acumulada alta. Incorpora Curl Nórdico 3x5 y movilidad de cadera antes de entrenar.'
    };
  }
  if (riskScore >= 2) {
    return {
      riskLevel: 'Moderado',
      advice: 'Mantén protocolo preventivo de isquiotibiales y saltos unipodales controlados.'
    };
  }
  return {
    riskLevel: 'Bajo',
    advice: 'Mecánica de valgo en rango seguro. Continúa con fortalecimiento de glúteo medio.'
  };
}
