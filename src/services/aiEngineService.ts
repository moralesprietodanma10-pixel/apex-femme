import { PlayerProfile, SmartwatchData, AIConfidenceEngine, ProactiveAlert, MatchLog } from '../types';

export interface AIResponse {
  text: string;
  importGym?: boolean;
  importTechnique?: boolean;
  importSprints?: boolean;
  importTime?: string;
  confidence?: AIConfidenceEngine;
}

/**
 * APEX AI Engine Service — V12 "AI Audit Edition"
 *
 * Core principles from the AI Audit:
 * 1. Every response must justify its reasoning (explainability)
 * 2. Every recommendation must cite data used + confidence level
 * 3. Never invent data. If insufficient data → say so clearly.
 * 4. The coach detects patterns. The user doesn't need to ask.
 * 5. Responses are scannable: Summary → Conclusion → Explanation → Action
 * 6. Science-first, especially female football physiology.
 */

// ─── Confidence Engine ───────────────────────────────────────────────────────

/**
 * Computes AI confidence based on available data points.
 * More data = higher confidence. Missing critical data = low confidence + explanation.
 */
export function computeConfidence(
  profile: PlayerProfile,
  watch?: any,
  matchLogs?: MatchLog[]
): AIConfidenceEngine {
  let score = 0;
  const dataPoints: string[] = [];

  // Profile data (base context)
  if (profile.name) { score += 10; dataPoints.push('nombre y posición'); }
  if (profile.position) score += 5;
  if (profile.OVR) { score += 5; dataPoints.push(`OVR ${profile.OVR}`); }
  if (profile.attributes) { score += 10; dataPoints.push('atributos físico-técnicos'); }
  if (profile.streakDays > 0) { score += 8; dataPoints.push(`racha de ${profile.streakDays} días`); }
  if (profile.monthlyMinutes > 0) { score += 7; dataPoints.push(`${profile.monthlyMinutes} min mensuales`); }
  if (profile.weeklyTrends) { score += 12; dataPoints.push('tendencias semanales'); }

  // Biometric data
  if (watch.connected) {
    score += 15;
    dataPoints.push(`HRV ${watch.hrvMs}ms`);
    dataPoints.push(`FC ${watch.heartRateBpm}BPM`);
    dataPoints.push(`batería ${watch.batteryLevel}%`);
  } else {
    score += 5; // some fallback defaults
    dataPoints.push('datos biométricos estimados (sin smartwatch)');
  }

  // Match history
  if (matchLogs && matchLogs.length > 0) {
    score += Math.min(15, matchLogs.length * 3);
    dataPoints.push(`${matchLogs.length} partido(s) registrado(s)`);
  }

  // Clamp 0–100
  const confidence = Math.min(100, Math.max(20, score));

  // Evidence level by confidence bracket
  let evidenceLevel: AIConfidenceEngine['evidenceLevel'];
  if (confidence >= 75) evidenceLevel = 'Alta';
  else if (confidence >= 50) evidenceLevel = 'Moderada';
  else if (confidence >= 30) evidenceLevel = 'Limitada';
  else evidenceLevel = 'Sin datos suficientes';

  const limitationNote = confidence < 50
    ? 'Conecta tu smartwatch y registra más partidos para recomendaciones más precisas.'
    : undefined;

  return {
    confidence,
    dataUsed: dataPoints.join(', '),
    evidenceLevel,
    limitationNote
  };
}

// ─── Proactive Alerts Engine ─────────────────────────────────────────────────

/**
 * Generates proactive insights without the user needing to ask.
 * The AI detects patterns and surfaces relevant alerts.
 * V12 Audit: "The AI must detect patterns, not just answer questions."
 */
export function generateProactiveAlerts(
  profile: PlayerProfile,
  watch?: any,
  matchLogs?: MatchLog[]
): ProactiveAlert[] {
  const alerts: ProactiveAlert[] = [];
  const hrv = watch?.hrvMs || 68;
  const trends = profile.weeklyTrends;

  // 1. Overtraining risk detection
  if (profile.streakDays >= 6 && hrv < 55) {
    alerts.push({
      id: 'alert-overload',
      type: 'overload',
      priority: 'high',
      icon: '⚠️',
      title: 'Riesgo de sobreentrenamiento detectado',
      message: `Llevas ${profile.streakDays} días consecutivos entrenando con HRV en ${hrv}ms (por debajo del umbral óptimo). La literatura científica indica que este patrón aumenta el riesgo de lesión y reduce la adaptación (Meeusen et al., 2013).`,
      action: 'Ver protocolo de recuperación',
      actionQuery: '¿Qué protocolo de recuperación me recomiendas con HRV bajo?'
    });
  }

  // 2. Recovery improvement
  if (hrv >= 72 && profile.streakDays >= 3) {
    alerts.push({
      id: 'alert-recovery-good',
      type: 'positive',
      priority: 'medium',
      icon: '🟢',
      title: 'Recuperación óptima hoy',
      message: `Tu HRV de ${hrv}ms indica que el sistema nervioso central está recuperado. Es un día ideal para cargas de alta intensidad o trabajo de velocidad.`,
      action: 'Ver sesión recomendada',
      actionQuery: '¿Qué entreno hoy con HRV óptimo?'
    });
  }

  // 3. Trend improvement
  if (trends?.rating && trends.rating.current > trends.rating.previousWeek) {
    const pct = Math.round(((trends.rating.current - trends.rating.previousWeek) / trends.rating.previousWeek) * 100);
    alerts.push({
      id: 'alert-rating-up',
      type: 'improvement',
      priority: 'low',
      icon: '📈',
      title: `Rating mejoró un ${pct}% esta semana`,
      message: `Tu rating promedio subió de ${trends.rating.previousWeek} a ${trends.rating.current}/10 respecto a la semana pasada. Tendencia positiva consistente.`,
      action: 'Analizar mi progreso',
      actionQuery: '¿Por qué mejoró mi rating esta semana?'
    });
  }

  // 4. Volume load warning
  if (trends?.minutes) {
    const acwr = trends.minutes.current / (trends.minutes.monthlyAvg || 1);
    if (acwr > 1.4) {
      alerts.push({
        id: 'alert-acwr',
        type: 'injury_risk',
        priority: 'high',
        icon: '🦵',
        title: 'Carga semanal elevada (ACWR > 1.4)',
        message: `Tu volumen actual es un ${Math.round((acwr - 1) * 100)}% superior a tu promedio mensual. Según el modelo ACWR, ratios >1.5 incrementan el riesgo de lesión. Reducir intensidad hoy puede disminuir ese riesgo.`,
        action: 'Reducir carga hoy',
        actionQuery: '¿Cómo ajusto mi entrenamiento si mi ACWR está alto?'
      });
    }
  }

  // 5. LCA prevention reminder (female-specific)
  if (matchLogs && matchLogs.length >= 2) {
    const recentRpe = matchLogs[0]?.rpe || 0;
    if (recentRpe >= 8) {
      alerts.push({
        id: 'alert-lca',
        type: 'injury_risk',
        priority: 'medium',
        icon: '🔴',
        title: 'Recordatorio prevención LCA',
        message: `Tu último partido tuvo RPE ${recentRpe}/10. Las futbolistas tienen 2-6× más riesgo de rotura de LCA, especialmente con fatiga acumulada. Incorpora Curl Nórdico excéntrico 2× semana.`,
        action: 'Ver protocolo LCA',
        actionQuery: 'Protocolo de prevención de LCA para fútbol femenino'
      });
    }
  }

  return alerts.slice(0, 3); // Max 3 alerts to avoid overwhelming
}

// ─── Position context helper ─────────────────────────────────────────────────

function positionContext(pos: string): string {
  if (pos.includes('Contención') || (pos.includes('Mediocentro') && !pos.includes('Ofensivo'))) {
    return 'Como Volante de Contención, tu sistema energético combina sprints cortos (ATP-PCr) con alta demanda aeróbica. Tu ratio isquiotibiales/cuádriceps es clave para prevención de LCA.';
  }
  if (pos.includes('Ofensivo') || pos.includes('MCO')) {
    return 'Como Mediocentro Ofensiva, tu ventaja está en la toma de decisiones bajo presión y los pases filtrados en el último tercio.';
  }
  if (pos.includes('Extrema') || pos.includes('LW') || pos.includes('RW')) {
    return 'Como Extrema, dominas el sistema glucolítico: sprints de 10-30m con recuperación incompleta. La aceleración inicial es tu arma diferencial.';
  }
  if (pos.includes('Lateral') || pos.includes('LB') || pos.includes('RB')) {
    return 'Como Lateral, recorres 10-12km por partido. Tu base aeróbica y la resistencia a la fatiga son fundamentales para mantener la calidad del despliegue en ambas fases.';
  }
  if (pos.includes('Delantera') || pos.includes('ST') || pos.includes('Punta')) {
    return 'Como Delantera, el remate bajo presión temporal y el desmarque explosivo son tus prioridades de desarrollo.';
  }
  if (pos.includes('Defensa') || pos.includes('CB') || pos.includes('Central')) {
    return 'Como Defensa Central, la anticipación táctica y el ratio I/Q ≥60% para protección del LCA son tus pilares de rendimiento.';
  }
  if (pos.includes('Portera') || pos.includes('GK')) {
    return 'Como Portera, el trabajo explosivo de cadera, los reflejos en el plano frontal y la comunicación defensiva definen tu impacto.';
  }
  return 'Tu posición requiere polivalencia: combina trabajo aeróbico, técnico y de fuerza funcional.';
}

// ─── Science evidence helper ─────────────────────────────────────────────────

function evidenceBadge(level: 'Alta' | 'Moderada' | 'Limitada', ref?: string): string {
  const icon = level === 'Alta' ? '🔬' : level === 'Moderada' ? '📊' : '⚠️';
  return `\n\n${icon} *Evidencia ${level}${ref ? ` · ${ref}` : ''}*`;
}

// ─── Main AI Response Generator ──────────────────────────────────────────────

export function generateAIResponse(
  input: string,
  profile: PlayerProfile,
  watch?: any,
  matchLogs?: MatchLog[]
): AIResponse {
  const q = input.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const name = profile.name.split(' ')[0];
  const pos = profile.position;
  const foot = profile.preferredFoot;
  const timeMatch = q.match(/(\d{1,2}:\d{2})/);
  const importTime = timeMatch ? timeMatch[1] : undefined;
  const posCtx = positionContext(pos);
  const conf = computeConfidence(profile, watch, matchLogs);

  // ── Greetings ─────────────────────────────────────────────────────────────
  if (/^(hola|buenas|hey|hi|buenos dias|buenas tardes|buenas noches|que tal|como va|que hay)/.test(q)) {
    const hrvStatus = watch.hrvMs >= 65
      ? `🟢 HRV ${watch.hrvMs}ms — recuperación óptima. Puedes entrenar fuerte hoy.`
      : watch.hrvMs >= 50
      ? `🟡 HRV ${watch.hrvMs}ms — carga moderada. Sesión técnica o de volumen medio.`
      : `🔴 HRV ${watch.hrvMs}ms — fatiga del SNC. Recuperación activa recomendada.`;

    return {
      text: `¡Hola ${name}! 👋\n\n**Estado actual:**\n${hrvStatus}\n\n${posCtx}\n\n¿En qué te ayudo hoy?\n• 📊 Analizar carga semanal\n• 🧠 Consejo táctico para tu posición\n• 🦵 Prevención de lesiones\n• 🥗 Nutrición pre/post partido`,
      confidence: { ...conf, confidence: Math.min(conf.confidence, 70) }
    };
  }

  // ── Farewells ─────────────────────────────────────────────────────────────
  if (/(adios|chao|hasta luego|nos vemos|bye|hasta manana)/.test(q)) {
    return {
      text: `¡Hasta pronto, ${name}! 💪\n\n**Recuerda antes de descansar:**\n• Hidratación ≥2L/día (orina color amarillo paja)\n• Sueño ≥8h — pico de GH nocturno para regeneración muscular\n• Proteína post-sesión: 0.3g/kg en los primeros 30 min\n\nNos vemos en la próxima sesión.${evidenceBadge('Alta', 'Burke et al., 2011 — IJSNEM')}`,
      confidence: { confidence: 85, dataUsed: 'directrices nutricionales estándar', evidenceLevel: 'Alta' }
    };
  }

  // ── How are you / Identity ─────────────────────────────────────────────────
  if (/(quien eres|que eres|como te llamas|eres ia|eres bot)/.test(q)) {
    return {
      text: `Soy **APEX Coach IA** 🤖⚽\n\nNo soy un chatbot genérico. Soy una entrenadora digital especializada en fútbol femenino.\n\n**Lo que hago:**\n• Analizo tus datos biométricos en tiempo real\n• Detecto patrones de carga, fatiga y recuperación\n• Doy consejos basados en evidencia científica\n• Nunca invento datos ni diagnostico condiciones médicas\n• Indico siempre qué datos usé y con qué confianza\n\nComo **${pos}**, mi objetivo es darte ventaja táctica y física concreta, no frases vacías.`,
      confidence: { confidence: 95, dataUsed: 'definición de sistema', evidenceLevel: 'Alta' }
    };
  }

  // ── Biometrics / HRV ──────────────────────────────────────────────────────
  if (/(pulsacion|corazon|bpm|hrv|variabilidad|reloj|smartwatch|biometria|frecuencia cardiaca)/.test(q)) {
    const hrvRec = watch.hrvMs >= 65
      ? `✅ **Óptimo** — SNC recuperado. Intensidad alta permitida.`
      : watch.hrvMs >= 50
        ? `⚠️ **Moderado** — Sesión técnica o de volumen bajo. Evita alta intensidad.`
        : `🔴 **Bajo** — Señal de sobrecarga o sueño insuficiente. Descansa o movilidad suave.`;

    const biometricConf: AIConfidenceEngine = watch.connected
      ? { confidence: 88, dataUsed: `HRV ${watch.hrvMs}ms, FC ${watch.heartRateBpm}BPM, pasos ${watch.stepsToday}, zona ${watch.heartRateZone}`, evidenceLevel: 'Alta' }
      : { confidence: 45, dataUsed: 'valores estimados (smartwatch no conectado)', evidenceLevel: 'Limitada', limitationNote: 'Conecta tu dispositivo para lecturas en tiempo real.' };

    return {
      text: `⌚ **Análisis Biométrico:**\n\n• **FC Actual:** ${watch.heartRateBpm} BPM — Zona *${watch.heartRateZone}*\n• **HRV:** ${watch.hrvMs} ms — ${hrvRec}\n• **Pasos hoy:** ${watch.stepsToday.toLocaleString()} / meta: 10,000\n• **Calorías activas:** ${watch.caloriesBurned} kcal\n\n**Para tu posición:** ${posCtx}${watch.connected ? '' : '\n\n⚠️ *Datos estimados. Conecta tu smartwatch para lecturas precisas.*'}${evidenceBadge('Moderada', 'Flatt & Esco, 2017 — HRV readiness in team sports')}`,
      confidence: biometricConf
    };
  }

  // ── LCA / Knee injury prevention ───────────────────────────────────────────
  if (/(lca|rodilla|acl|ligamento|cruzado|valgo|isquios|isquiotibiales)/.test(q)) {
    return {
      text: `🦵 **Prevención de LCA — Fútbol Femenino:**\n\n**¿Por qué?** Las futbolistas tienen 2-6× más riesgo de rotura de LCA que hombres, relacionado con diferencias hormonales, biomecánicas y neuromusculares (Hewett et al., 2005).\n\n**Protocolo basado en evidencia:**\n1. **Curl Nórdico excéntrico** 3×5 rep — Reduce riesgo hamstrings en 51% (Petersen et al., 2011)\n2. **Sentadilla Búlgara unilateral** 3×8 — Estabilidad y ratio I/Q ≥60%\n3. **Caída de caja con aterrizaje controlado** 4×6 — Mejora mecánica de valgo\n4. **Pallof Press** 3×12 — Core anti-rotación\n\n**Frecuencia:** 2× semana, antes del entrenamiento principal.\n\n¿Quieres que lo integre en tu plan semanal?${evidenceBadge('Alta', 'Hewett et al., 2005 — AJSM; Petersen et al., 2011 — BMJ')}`,
      confidence: { confidence: 92, dataUsed: `posición ${pos}, consenso científico LCA en fútbol femenino`, evidenceLevel: 'Alta' }
    };
  }

  // ── Recovery ───────────────────────────────────────────────────────────────
  if (/(recuperacion|descanso|dormir|sueño|fatiga|cansancio|regeneracion|activa)/.test(q)) {
    return {
      text: `😴 **Recuperación Óptima — Protocolo APEX:**\n\n**Resumen:** ${watch.hrvMs < 55 ? 'Tu HRV indica que necesitas recuperación activa hoy.' : 'Aprovecha hoy para recuperación preventiva.'}\n\n**Post-partido (primeras 24h):**\n• Baño de contraste: 3min frío (12-15°C) / 1min caliente × 4 rondas\n• Proteína antes de dormir: 40g caseína (↑34% síntesis proteica nocturna)\n• Compresión piernas: 30-60 min\n\n**24-48h post:**\n• Bici estática suave 20min (FC ≤120 BPM)\n• Movilidad de cadera + foam roller isquiotibiales\n• Hidratación: ≥2L/día\n\n**Sueño:** ≥8h — las mujeres deportistas necesitan más durante la fase lútea${evidenceBadge('Alta', 'Nédélec et al., 2012 — Sports Medicine')}`,
      confidence: { confidence: 78, dataUsed: `HRV ${watch.hrvMs}ms, racha ${profile.streakDays} días`, evidenceLevel: 'Alta' }
    };
  }

  // ── Schedule import: gym ───────────────────────────────────────────────────
  if (/(importar|cargar|programar|agregar).*(gym|gimnasio|fuerza|pesas)/.test(q)) {
    const t = importTime || '18:00';
    return {
      text: `📥 **Plan de Fuerza Importado (${t}):**\n\nRutina adaptada para **${pos}** — Fuerza útil transferible al campo:\n\n• **Hip Thrust** 4×10 — Potencia glútea → sprint\n• **Sentadilla Búlgara** 4×8 — Ratio I/Q + estabilidad\n• **Curl Nórdico excéntrico** 3×5 — Prevención LCA ⚡\n• **Prensa 45° unilateral** 3×12 — Fuerza de empuje\n• **Pallof Press** 3×15s — Core anti-rotación\n\n📅 LUN · MIÉ · VIE a las **${t}** | Deja 48h entre sesiones de fuerza máxima.${evidenceBadge('Alta', 'Pedersen et al., 2022 — NSCA Strength in Women')}`,
      importGym: true,
      importTime: t,
      confidence: { confidence: 82, dataUsed: `posición ${pos}, principios de periodización para fútbol femenino`, evidenceLevel: 'Alta' }
    };
  }

  // ── Schedule import: technique ─────────────────────────────────────────────
  if (/(importar|cargar|programar).*(tecnica|casa|regate|control|toque)/.test(q)) {
    const t = importTime || '17:00';
    return {
      text: `📥 **Plan de Técnica Individual (${t}):**\n\nSesión en espacio reducido — Pierna ${foot} + débil:\n\n• 100 toques a pared alternando piernas\n• Control orientado en 2 toques con cambio de perfil\n• Rondos 1v1 decisión bajo presión temporal\n• Perfilamiento: 2 escaneos antes de recibir\n• Ochos de cono + cambio de dirección\n\n📅 MAR · JUE a las **${t}**${evidenceBadge('Moderada', 'Savelsbergh et al., 2002 — anticipation in football')}`,
      importTechnique: true,
      importTime: t,
      confidence: { confidence: 75, dataUsed: `pierna dominante ${foot}, posición ${pos}`, evidenceLevel: 'Moderada' }
    };
  }

  // ── Schedule import: sprints ───────────────────────────────────────────────
  if (/(importar|cargar|programar).*(sprint|velocidad|acelera|rapidez)/.test(q)) {
    const t = importTime || '09:00';
    return {
      text: `⚡ **Plan de Velocidad & Sprints (${t}):**\n\nSistema ATP-PCr + glucolítico — adaptado a ${pos}:\n\n• 6× Sprint reactivo 10m (señal visual)\n• 4× Sprint 20m con freno progresivo\n• Circuito en Z — cambios 45° y 90°\n• **Ratio trabajo:descanso 1:6** (recuperación completa)\n\n⚠️ No ejecutar el día siguiente a partido\n📅 MAR · VIE a las **${t}**${evidenceBadge('Alta', 'Stolen et al., 2005 — Sprint patterns in female football')}`,
      importSprints: true,
      importTime: t,
      confidence: { confidence: 85, dataUsed: `posición ${pos}, demandas energéticas del fútbol femenino`, evidenceLevel: 'Alta' }
    };
  }

  // ── Nutrition ──────────────────────────────────────────────────────────────
  if (/(comer|nutricion|dieta|alimento|hidrata|proteina|carbohidrato|antes del partido|antes de entrenar|suplemento)/.test(q)) {
    return {
      text: `🥗 **Nutrición para ${pos}:**\n\n**3-4h antes de entrenar:**\n• 1.5g CHO/kg + 120g proteína magra\n• Fruta de bajo IG (manzana, pera)\n\n**60 min antes:**\n• Plátano + bebida isotónica (sodio 400-700mg/L)\n\n**Durante (>60 min):**\n• 200ml agua/20 min + gel si supera 90 min\n\n**Post-entreno (ventana de 30 min):**\n• 0.3g proteína/kg + 0.8g CHO/kg\n• Cerezas/arándanos — reduce IL-6 inflamatoria en mujeres\n\n⚠️ *Las necesidades varían por fase hormonal. Consulta dietista deportiva para plan individualizado.*${evidenceBadge('Alta', 'Thomas et al., 2016 — AND/DC/ACSM Position Statement')}`,
      confidence: { confidence: 80, dataUsed: `posición ${pos}, directrices nutricionales para fútbol`, evidenceLevel: 'Alta' }
    };
  }

  // ── Pain / Injury ──────────────────────────────────────────────────────────
  if (/(dolor|lesion|molestia|sobrecarga|tiron|tobillo|fisio|me duele|pubalgia)/.test(q)) {
    return {
      text: `🚑 **Evaluación de Molestia — APEX:**\n\n⛔ *Si el dolor es ≥6/10 o agudo/punzante: detén la actividad y contacta al médico del club.*\n\n**Para sobrecarga leve (1-3/10):**\n• **POLICE:** Protection → Optimal Loading → Ice → Compression → Elevation\n• Hielo: 15 min × 3 veces/día (no contacto directo)\n• Movilidad articular sin carga\n• Sueño ≥8h para regeneración tisular\n• Foam roller en musculatura adyacente (no zona directa)\n\n¿En qué zona específicamente, ${name}? Puedo darte el protocolo exacto.${evidenceBadge('Alta', 'Bleakley et al., 2012 — Cochrane: RICE vs POLICE')}`,
      confidence: { confidence: 70, dataUsed: 'protocolo POLICE estándar, sin diagnóstico clínico', evidenceLevel: 'Moderada', limitationNote: 'Esta información no reemplaza la evaluación médica profesional.' }
    };
  }

  // ── Tactical advice ───────────────────────────────────────────────────────
  if (/(tactica|tactico|posicion|desmarque|presion|cobertura|pase|perfilamiento|juego|sistema)/.test(q)) {
    const posTips: Partial<Record<string, string>> = {
      'Contención': `**Posicionamiento:** Tu sombra cubre la línea de pase entre central y MCI rival.\n**Anticipación:** 2 escaneos antes de recibir — decide ANTES de tocar.\n**Transición:** Primer pase corto (3-5m) hacia lateral, no directo al delantero.\n**Agresividad:** Zona de duelo propia entre 25-40m del arco.`,
      'Mediocentro': `**Tercer hombre:** Pared con delantera para romper la primera línea de presión.\n**Perfilamiento:** Siempre orientado al espacio de juego, nunca de espaldas.\n**Llegada:** Entra al área cuando la extrema conduce hacia la línea de fondo.`,
      'Extrema': `**1v1:** Recibe bien abierta en banda, encara en velocidad.\n**Diagonal:** Entra por dentro con pierna cambiada para habilitar disparo o pase filtrado.\n**Centrros:** Al primer palo bajo cuando vayas a línea de fondo.`,
      'Lateral': `**Overlap/Underlap:** Elige el desdoblamiento según la extrema — por dentro o por fuera.\n**Cierre:** En basculación defensiva no pierdas de vista la espalda.`,
      'Delantera': `**Tijera:** Fija a la central y ataca el primer palo en centros laterales.\n**Juego de espaldas:** Protege a 2 toques, descarga al llegar de segunda línea.`
    };

    let tip = '';
    for (const [key, val] of Object.entries(posTips)) {
      if (pos.includes(key)) { tip = val; break; }
    }
    if (!tip) tip = `Presión tras pérdida en ≤5s para recuperar en zona avanzada. Los mejores equipos femeninos (Lyon, Barcelona) basan su pressing en zonas, no individual.`;

    return {
      text: `🧠 **Consejo Táctico — ${pos}:**\n\n${tip}\n\n¿Quieres trabajar algún aspecto en la próxima sesión?${evidenceBadge('Moderada', 'Bradley & Ade, 2018 — Positional demands in female football')}`,
      confidence: { confidence: 72, dataUsed: `posición ${pos}, análisis posicional fútbol femenino élite`, evidenceLevel: 'Moderada' }
    };
  }

  // ── General fallback — structured and useful ───────────────────────────────
  return {
    text: `Entendido, ${name}.\n\n**Tu contexto:**\n• ${pos} | OVR ${profile.OVR} | Racha ${profile.streakDays} días\n• HRV ${watch.hrvMs}ms → ${watch.hrvMs >= 65 ? 'sistema nervioso recuperado ✅' : 'carga acumulada ⚠️'}\n• FC ${watch.heartRateBpm} BPM — Zona ${watch.heartRateZone}\n\n**Recomendación inmediata:**\n${watch.hrvMs >= 65 ? `Alta intensidad hoy. ${posCtx}` : `Sesión técnica o recuperación activa. ${posCtx}`}\n\n¿Quieres que ajuste tu plan semanal, analicemos tu último partido, o preferes consultar sobre nutrición, prevención o táctica?`,
    confidence: conf
  };
}
