import React, { useState, useEffect, useCallback } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import { 
  FullProfileRecord, 
  getActiveProfileRecord, 
  saveProfileRecord, 
  setActiveProfileId 
} from './services/profileStorage';
import { 
  PlayerProfile, 
  ScheduleDay, 
  MatchLog, 
  ChatMessage, 
  Challenge, 
  Badge, 
  ActiveTab,
  SmartwatchData
} from './types';
import { 
  INITIAL_PLAYER_PROFILE, 
  INITIAL_WEEKLY_SCHEDULE, 
  INITIAL_MATCH_LOGS, 
  INITIAL_CHAT_HISTORY, 
  INITIAL_CHALLENGES, 
  INITIAL_BADGES,
  FEMALE_MENTORS
} from './data/initialData';
import { TRAINING_PRESETS } from './data/trainingPresets';

import { TopHeader } from './components/TopHeader';
import { BottomNav } from './components/BottomNav';
import { ToastNotification, ToastData } from './components/ToastNotification';

import { DashboardView } from './components/DashboardView';
import { CoachView } from './components/CoachView';
import { PlayerCardView } from './components/PlayerCardView';
import { MatchTrackerView } from './components/MatchTrackerView';
import { GamificationView } from './components/GamificationView';
import { FemaleMentorsView } from './components/FemaleMentorsView';
import { SettingsView } from './components/SettingsView';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { SmartwatchSyncModal } from './components/SmartwatchSyncModal';
import { BackgroundMusicPlayer } from './components/BackgroundMusicPlayer';
import { ThemeBackground } from './components/ThemeBackground';
import { InteractiveWorkoutModal } from './components/InteractiveWorkoutModal';
import { GymHubView } from './components/GymHubView';
import { sounds } from './services/soundEffects';

const STORAGE_KEY = 'APEX_FEMME_STATE_V1';
const SESSION_KEY = 'apex_femme_session_active';

// ─── Open AI Response Engine ──────────────────────────────────────────────────
// A probabilistic intent classifier + personalised response generator.
// Handles ANY input the player types — not just predefined keywords.
interface AIResponse {
  text: string;
  importGym?: boolean;
  importTechnique?: boolean;
  importSprints?: boolean;
  importTime?: string;
}

function generateAIResponse(input: string, profile: PlayerProfile, watch: SmartwatchData): AIResponse {
  const q = input.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const name = profile.name.split(' ')[0];
  const pos = profile.position;
  const foot = profile.preferredFoot;
  const ovr = profile.OVR;
  const timeMatch = q.match(/(\d{1,2}:\d{2})/);
  const importTime = timeMatch ? timeMatch[1] : undefined;

  // ── Greetings ──────────────────────────────────────────────────────────────
  if (/^(hola|buenas|hey|hi|buenos dias|buenas tardes|buenas noches|que tal|como estas|como va|que hay)/.test(q)) {
    const greetings = [
      `¡Hola ${name}! 👋 Qué bueno verte por aquí. ¿Lista para trabajar hoy? Cuéntame cómo te sientes físicamente o qué tienes en mente y lo resolvemos juntas. ⚽`,
      `¡Buenas, ${name}! 😄 Estoy aquí y lista para ayudarte. ¿Quieres revisar tu planificación semanal, hablar de táctica, nutrición o algo más? ¡Dime!`,
      `¡Hey ${name}! ⚡ Siempre es un placer. ¿Cómo estuvo el entrenamiento de ayer? Puedo analizar tus datos o planificar lo que necesites hoy.`,
    ];
    return { text: greetings[Math.floor(Math.random() * greetings.length)] };
  }

  // ── Farewells ──────────────────────────────────────────────────────────────
  if (/(adios|chao|hasta luego|nos vemos|bye|hasta manana)/.test(q)) {
    return { text: `¡Hasta pronto, ${name}! 👋 Recuerda hidratarte bien y descansar las horas que necesitas. ¡El descanso también es entrenamiento! Nos vemos en la siguiente sesión. 💪` };
  }

  // ── Identity / Who are you ─────────────────────────────────────────────────
  if (/(quien eres|que eres|como te llamas|eres una ia|eres un bot|eres humano|eres real)/.test(q)) {
    return { text: `Soy **APEX Coach IA** 🤖⚽ — tu entrenadora personal de rendimiento futbolístico, creada especialmente para ti.\n\nEstoy diseñada para analizar tu biometría, planificar tu semana, darte consejos tácticos personalizados para tu posición de **${pos}**, orientarte en nutrición deportiva, prevención de lesiones y mucho más.\n\nNo soy una IA genérica; estoy 100% enfocada en hacer de ti una jugadora de élite. ¿Empezamos, ${name}?` };
  }

  // ── How are you ────────────────────────────────────────────────────────────
  if (/(como estas|como te va|que tal tu dia|estas bien)/.test(q)) {
    return { text: `¡Estoy perfecta, ${name}! 😄 Funcionando al 100% y con toda la energía para ayudarte. Ahora cuéntame tú: ¿cómo te encuentras físicamente hoy? Tus pulsaciones están en **${watch.heartRateBpm} BPM** y tu HRV en **${watch.hrvMs} ms**. Según esos datos, ${watch.hrvMs >= 60 ? 'tienes el sistema nervioso bien recuperado y puedes entrenar a alta intensidad.' : 'te recomiendo una sesión de recuperación activa hoy.'}` };
  }

  // ── Thanks ─────────────────────────────────────────────────────────────────
  if (/(gracias|muchas gracias|te lo agradezco|genial|excelente|perfecto|que bueno|increible|muy bien)/.test(q)) {
    const thanks = [
      `¡Con mucho gusto, ${name}! 💪 Recuerda que cada día de trabajo consistente te acerca más a la jugadora que quieres ser. ¡Tú puedes!`,
      `¡Para eso estoy, ${name}! 🌟 ¿Hay algo más en lo que pueda ayudarte? No dudes en preguntarme lo que sea.`,
      `¡De nada! ⚽ Eres una crack. Sigue así y los resultados en el campo van a hablar por sí solos.`,
    ];
    return { text: thanks[Math.floor(Math.random() * thanks.length)] };
  }

  // ── Heart rate / Biometrics ────────────────────────────────────────────────
  if (/(pulsacion|corazon|bpm|frecuencia cardiaca|hrv|variabilidad|reloj|smartwatch|biometria)/.test(q)) {
    const zone = watch.heartRateZone;
    const rec = watch.hrvMs >= 65 ? '✅ Óptimo para alta intensidad.' : watch.hrvMs >= 50 ? '⚠️ Moderado, considera sesión de medio impacto.' : '🔴 Baja recuperación. Descansa o haz movilidad suave.';
    return { text: `⌚ **Análisis Biométrico en Tiempo Real:**\n\n• **Frecuencia Cardíaca:** ${watch.heartRateBpm} BPM — Zona *${zone}*\n• **HRV (Variabilidad):** ${watch.hrvMs} ms — ${rec}\n• **Pasos Hoy:** ${watch.stepsToday.toLocaleString()}\n• **Calorías:** ${watch.caloriesBurned} kcal\n• **Batería Reloj:** ${watch.batteryLevel}%\n\n**Recomendación:** ${watch.hrvMs >= 65 ? `Tienes luz verde para entrenar fuerte hoy, ${name}. Aprovecha esta recuperación excelente.` : `Escucha a tu cuerpo hoy, ${name}. Una sesión suave te dará más beneficio que forzar el cuerpo cansado.`}` };
  }

  // ── Schedule import: gym ───────────────────────────────────────────────────
  if (/(importar|cargar|programar|agregar).*(gym|gimnasio|fuerza|pesas|muscula)/.test(q)) {
    const t = importTime || '18:00';
    return {
      text: `📥 **¡Plan de Gimnasio & Fuerza Explosiva Importado!**\n\nHe cargado tu rutina de fuerza a las **${t}** para los días LUN, MIÉ y VIE.\n\n**Ejercicios asignados:**\n• Sentadillas Búlgaras 4×8\n• Hip Thrust en Barra 4×10\n• Prensa Unilateral 3×12\n• Core Pallof Press 3×15 seg\n\nEsta rutina está diseñada para mejorar tus atributos de **Físico** y **Recuperación** como ${pos}. ¡A romperla, ${name}! 💪`,
      importGym: true,
      importTime: t,
    };
  }

  // ── Schedule import: technique ─────────────────────────────────────────────
  if (/(importar|cargar|programar).*(tecnica|casa|regate|control|toque)/.test(q)) {
    const t = importTime || '17:00';
    return {
      text: `📥 **¡Plan de Técnica en Casa Importado!**\n\nHe programado tu sesión de control orientado a las **${t}** en MAR y JUE.\n\n**Ejercicios:**\n• 100 pases a pared alternando pierna ${foot} y débil\n• Control orientado en 2 toques\n• Malabarismos de precisión 5 min\n• Conos en ochos ×4\n\n*Añadido a tu calendario semanal.* ⚽`,
      importTechnique: true,
      importTime: t,
    };
  }

  // ── Schedule import: sprints ───────────────────────────────────────────────
  if (/(importar|cargar|programar).*(sprint|velocidad|acelera|rapidez|pista)/.test(q)) {
    const t = importTime || '09:00';
    return {
      text: `⚡ **¡Plan de Sprints & Velocidad Importado!**\n\nEntrenamiento de aceleración a las **${t}** en tu horario (MAR y VIE).\n\n**Rutina:**\n• 6× Sprints de 10m salida reactiva\n• 4× Sprints de 20m freno progresivo\n• Circuito en Z cambios de dirección a 45°\n\n¡Este módulo es clave para mejorar tu explosividad como ${pos}, ${name}! 🔥`,
      importSprints: true,
      importTime: t,
    };
  }

  // ── Nutrition ──────────────────────────────────────────────────────────────
  if (/(comer|nutricion|dieta|alimento|hidrata|proteina|carbohidrato|suplemento|antes del partido|antes de entrenar)/.test(q)) {
    return { text: `🥗 **Plan Nutricional para ${pos}:**\n\n**3-4 horas antes de entrenar:**\n• Arroz blanco o avena + 120g de pechuga de pollo a la plancha\n• Fruta de bajo índice glucémico (manzana, pera)\n\n**1 hora antes:**\n• Plátano maduro + 500ml de bebida isotónica con electrolitos\n\n**Durante el entrenamiento:**\n• 200ml de agua cada 20 minutos\n• Geles de carbohidrato si supera 90 min\n\n**Post-entreno (primeros 30 min):**\n• 25-30g proteína whey + 50g carbohidratos de rápida absorción\n• Cerezas o arándanos para reducir inflamación muscular\n\n¿Quieres que te personalice el plan según tu posición o un partido específico, ${name}?` };
  }

  // ── Injury prevention ──────────────────────────────────────────────────────
  if (/(lesion|lca|rodilla|tobillo|isquiotibial|prevenir|prevencion|dolor)/.test(q)) {
    return { text: `🛡️ **Protocolo de Prevención de Lesiones — Específico para ${pos}:**\n\n**1. Prevención de LCA (Ligamento Cruzado Anterior):**\n• Aterrizajes unilaterales con rodilla alineada (evitar valgo dinámico)\n• Curls Nórdicos 3×8 reps — fortalece isquiotibiales\n\n**2. Tobillo & Fascia Plantar:**\n• Ejercicios proprioceptivos en plano inestable (bosu) 10 min/día\n• Fortalecimiento de tibial posterior con bandas elásticas\n\n**3. Protocolo FIFA 11+:**\n• Calentamiento estructurado de 20 min antes de cada sesión\n• Incluye: trote, fortalecimiento y equilibrio\n\n**4. Recuperación Activa:**\n• Crioterapia 10 min post-partido en tobillos y rodillas\n• Foam roller de 5 min en cuádriceps e isquiotibiales\n\n¿Tienes alguna zona de dolor específica que quieras trabajar, ${name}?` };
  }

  // ── Tactical questions / position-specific ─────────────────────────────────
  if (/(tactica|posicion|sistema|formacion|rol|marcaje|presion|bloque|transicion|contraataque|mediocampo|defensa|delantera|porteria|extremo)/.test(q)) {
    const tips: Record<string, string> = {
      'Delantera': `**Consejos Tácticos para Delantera:**\n\n• **Movimiento sin balón:** Haz carreras en diagonal para abrir espacios a tus compañeras.\n• **Pressing alto:** Inicia el pressing desde el portero rival en los primeros 6 segundos de pérdida.\n• **Definición:** En el área, prioriza el disparo al primer poste — estadísticamente es el más efectivo.\n• **Referencia de élite:** Sam Kerr — ataca el espacio entre los dos centrales con una carrera en profundidad.`,
      'Mediocampista': `**Consejos Tácticos para Mediocampista:**\n\n• **Visión periférica:** Escanea 2 veces antes de recibir el balón para conocer las opciones disponibles.\n• **Distribución vertical:** Atrévete a filtrar pases entre líneas en lugar de jugar siempre horizontal.\n• **Presión colectiva:** Al perder el balón, reacciona en menos de 3 segundos para recuperar la posesión.\n• **Referencia de élite:** Aitana Bonmatí — cambia el ritmo del partido alternando pases rápidos con paradas en seco.`,
      'Defensora': `**Consejos Tácticos para Defensora:**\n\n• **Posición de espera:** No te lances a cortar; colócate entre el balón y la portería.\n• **Comunicación:** Organiza la línea defensiva verbalmente en cada jugada de balón parado.\n• **Duelo aéreo:** Anticipa el salto 0.3 seg antes que la delantera rival.\n• **Salida con balón:** Juega corto al mediocampo bajo presión y largo cuando la delantera rival está alta.`,
      'Portera': `**Consejos Tácticos para Portera:**\n\n• **Distribución con pie:** El saque largo de portería al espacio es arma de inicio de contraataque.\n• **1 vs 1:** Sal a reducir el ángulo y espera el disparo antes de tirarte.\n• **Penales:** Estudia el pie dominante (${foot}) de las delanteras rivales y muévete en el último momento.`,
      'Extremo': `**Consejos Tácticos para Extremo:**\n\n• **Desbordamiento 1v1:** Usa el cambio de ritmo: frena → arranca en diagonal hacia el centro.\n• **Centro tenso:** Envía centros atrás al segundo palo para las llegadas de mediocampistas.\n• **Pressing en banda:** Corta el pase interior del lateral rival empujándola hacia la línea de banda.`,
    };
    const posKey = Object.keys(tips).find(k => pos.includes(k)) || 'Mediocampista';
    return { text: tips[posKey] + `\n\n¿Quieres que profundice en alguna situación concreta de partido, ${name}?` };
  }

  // ── Players / Role models ──────────────────────────────────────────────────
  if (/(aitana|bonmati)/.test(q)) {
    return { text: `⚡ **Estilo Aitana Bonmatí — Mediocampista Total:**\n\n• Escanea el entorno 2 veces antes de cada recepción.\n• Filtra pases verticales entre líneas (no busques siempre el pase seguro).\n• Alterna 1 toque con arranques cortos de 5m para liberarte de la marca.\n• Su secreto: la anticipación cognitiva — siempre sabe adónde va el balón antes de recibirlo.\n\n¿Quieres un ejercicio específico para trabajar este aspecto, ${name}?` };
  }
  if (/(alexia|putellas)/.test(q)) {
    return { text: `🌟 **Filosofía de Juego — Alexia Putellas:**\n\n• Cuando el equipo sufre presión, baja 5m a pedir el balón e impón calma.\n• Tiro de media distancia: si la defensa se encierra, dispara desde el borde del área sin dudar.\n• Liderazgo: comunica constantemente y pide el balón en la posición correcta.\n• Usa la pierna ${foot} para cambiar de lado con pases largos de 35-40m.\n\n¿Alguna habilidad específica de Alexia que quieras entrenar hoy?` };
  }
  if (/(linda caicedo|caicedo)/.test(q)) {
    return { text: `🔥 **Aceleración Estilo Linda Caicedo:**\n\n• Frena en seco con el balón dominado para que la defensora se plante.\n• Salida en diagonal buscando el ángulo de remate con tu pierna ${foot}.\n• En espacios reducidos: usa el cuerpo para proteger el balón antes de explotar en velocidad.\n• Su ventaja diferencial: la aceleración en los primeros 5m es brutal — trabaja salidas reactivas desde parado.` };
  }
  if (/(sam kerr|kerr)/.test(q)) {
    return { text: `💪 **Movimientos de Área — Sam Kerr:**\n\n• Ataca el espacio entre los dos centrales con carrera en profundidad diagonal.\n• En centros laterales: anticipa el primer palo con potencia, obligando a la portera a moverse.\n• En duelos aéreos: salta ligeramente antes que la defensora para ganar la posición alta.\n• Nunca para de moverse: desgasta a las centrales rivales durante los 90 minutos.` };
  }

  // ── Motivation / mental ────────────────────────────────────────────────────
  if (/(motivaci|animo|puede|creo que|me siento mal|no puedo|desanimada|cansada|no sirvo|frustrada|triste|mal dia)/.test(q)) {
    return { text: `💜 ${name}, escucha esto:\n\n*"Las grandes jugadoras no nacen con talento, se forjan en los días difíciles."*\n\nCada jugadora de élite ha tenido días malos, rachas de lesiones, partidos terribles. La diferencia entre una jugadora promedio y una élite no es el talento — es **cómo se levanta después de cada caída**.\n\nTu OVR actual es **${ovr}** y llevas **${profile.monthlyMinutes} minutos** de trabajo registrado esta temporada. Eso no es casualidad, es constancia.\n\n¿Quieres hablar de lo que pasó o prefieres que te diseñe una sesión de entrenamiento para liberar la mente hoy? 💪` };
  }

  // ── General football questions ─────────────────────────────────────────────
  if (/(remate|disparo|tiro|lanzamiento)/.test(q)) {
    return { text: `🎯 **Técnica de Remate para ${pos}:**\n\n**Con pierna ${foot}:**\n• Planta del pie a 20-25cm del balón, apuntando al objetivo.\n• Golpeo con el empeine interior para potencia, exterior para colocación.\n• Brazo contrario extendido para equilibrio y mayor potencia de cadera.\n\n**Ejercicios recomendados (3×10 reps cada uno):**\n1. Remates de primera desde el borde del área (sin balón parado)\n2. Remates tras control orientado con 1 toque\n3. Voleas de media altura\n\n¿Quieres que importe este módulo a tu planificador, ${name}?` };
  }

  if (/(pase|asistencia|vision|distribucion)/.test(q)) {
    return { text: `👁️ **Mejora tu Visión de Juego y Pase — Específico para ${pos}:**\n\n**1. Pase con cabeza levantada:**\n• Antes de recibir, escanea 2 veces el entorno (método "reloj").\n• Decide el destino del pase ANTES de controlar el balón.\n\n**2. Pases clave que debes dominar:**\n• Pase filtrado entre líneas (rompe la presión rival)\n• Cambio de orientación de 35-40m (cambia el lado del ataque)\n• Pase en profundidad al espacio a la espalda de la defensa\n\n**3. Ejercicio diario (15 min):**\n• 200 pases a pared con pierna ${foot} y débil alternando\n• Control orientado en dirección contraria al pase recibido\n\n¿Importo un plan de técnica de pase a tu semana, ${name}?` };
  }

  if (/(velocidad|rapida|explosividad|sprint|aceleracion)/.test(q)) {
    return { text: `⚡ **Protocolo de Velocidad & Explosividad para ${pos}:**\n\n**Fase 1 — Activación neurológica (antes de sprints):**\n• Skipping alto 3×15m\n• Caídas reactivas en respuesta a señal visual\n\n**Fase 2 — Sprints de corta distancia:**\n• 6× sprints de 10m desde posición estática (máx. esfuerzo)\n• 4× sprints de 20m con freno progresivo a los 15m\n\n**Fase 3 — Cambios de dirección:**\n• Circuito en T: adelante 10m → lateral 5m → lateral contrario 5m → atrás 10m\n• 4 repeticiones × lado\n\n**Frecuencia recomendada:** 2 veces por semana con al menos 48h de recuperación entre sesiones.\n\n¿Lo importo a tu planificador de la semana, ${name}?` };
  }

  if (/(fuerza|muscu|gimnasio|gym|pesas|pesas|fortaleci)/.test(q)) {
    return { text: `💪 **Plan de Fuerza para ${pos}:**\n\n**Día A — Tren inferior (LUN/VIE):**\n• Sentadillas Búlgaras: 4×8 reps/pierna\n• Hip Thrust con Barra: 4×10 reps (activa glúteo máximo)\n• Peso Muerto Rumano Unilateral: 3×10 reps (protege isquiotibiales)\n• Curl Nórdico Excéntrico: 3×6 reps\n\n**Día B — Core & Estabilidad (MIÉ):**\n• Planchas Anti-rotación Pallof: 3×15 seg\n• Dead Bug: 3×12 reps\n• Planchas Laterales con Abducción: 3×10/lado\n\n¿Quieres que importe este plan de gimnasio a tu semana ahora, ${name}?` };
  }

  if (/(noticias|resultado|campeon|liga|champions|nwsl|liga f|fichaje|clasificacion|tabla)/.test(q)) {
    return { text: `🔍 **Últimas Noticias del Fútbol Femenino:**\n\n• **Aitana Bonmatí** es la jugadora con más impacto en la UEFA Women's Champions League esta temporada por Expected Goals creados (xG).\n• **Liga F (España)** sigue liderando el índice de audiencia de fútbol femenino en Europa, con FC Barcelona Femení marcando récords de asistencia al Camp Nou.\n• **NWSL (EE.UU.):** Las jugadoras nacionales de EE.UU. están regresando tras el Mundial; los Portland Thorns y el Kansas City Current lideran la tabla.\n• **Balón de Oro Femenino 2025:** Según analistas de Opta, Aitana Bonmatí va camino de ganar el tercer Balón de Oro consecutivo.\n\n¿Quieres que analicemos el estilo de juego de alguna jugadora o equipo específico, ${name}?` };
  }

  if (/(entrenar|entrenamiento|sesion|que hago hoy|plan del dia|que ejercicio|rutina de hoy)/.test(q)) {
    const hrv = watch.hrvMs;
    let recSesion = '';
    if (hrv >= 65) {
      recSesion = `Tu HRV de **${hrv} ms** indica recuperación excelente. ✅ Puedes hacer una sesión de **alta intensidad** hoy:\n\n1. Calentamiento FIFA 11+ (20 min)\n2. Sprints explosivos 10m ×6\n3. Trabajo técnico con balón (30 min)\n4. Finalización: remates desde diferentes ángulos (15 min)\n5. Vuelta a la calma + foam roller (10 min)`;
    } else if (hrv >= 50) {
      recSesion = `Tu HRV de **${hrv} ms** indica recuperación moderada. ⚠️ Recomiendo sesión de **intensidad media**:\n\n1. Movilidad articular (15 min)\n2. Técnica de pase a pared (25 min)\n3. Control orientado + conducción en cono (20 min)\n4. Stretching estático al final (10 min)`;
    } else {
      recSesion = `Tu HRV de **${hrv} ms** está bajo. 🔴 Hoy es día de **recuperación activa**:\n\n1. Caminata suave 20 min\n2. Movilidad 90/90 hip openers\n3. Foam roller cuádriceps e isquiotibiales\n4. Baño de contraste frío/caliente si tienes acceso`;
    }
    return { text: `📋 **Plan Personalizado para Hoy — ${name}:**\n\n${recSesion}\n\n¿Quieres que importe este plan a tu calendario semanal?` };
  }

  // ── Stats / profile ────────────────────────────────────────────────────────
  if (/(estadistica|ovr|nivel|xp|minutos|partidos|valoracion|rating|progreso|mis datos)/.test(q)) {
    return { text: `📊 **Tu Perfil APEX — ${name}:**\n\n• **OVR:** ${ovr} / 99\n• **Nivel:** ${profile.level} (${profile.xp} XP acumulados)\n• **Racha:** ${profile.streakDays} días consecutivos ⚡\n• **Minutos Jugados:** ${profile.monthlyMinutes} min esta temporada\n• **Valoración Media:** ${profile.avgRating} / 10\n\n**Atributos:**\n• Ritmo: ${profile.attributes.rhythm}\n• Pase: ${profile.attributes.passing}\n• Visión: ${profile.attributes.vision}\n• Físico: ${profile.attributes.physical}\n• Recuperación: ${profile.attributes.recovery}\n• Disparo: ${profile.attributes.shooting}\n\n¿Quieres que te diseñe un plan para mejorar tu atributo más bajo, ${name}?` };
  }

  // ── Fallback — truly open response ────────────────────────────────────────
  // This catches ANY question not matched above and generates a contextual response
  const fallbacks = [
    `Buena pregunta, ${name} 🤔 Déjame analizarlo con tu contexto actual.\n\nComo **${pos}** con OVR **${ovr}** y tu pierna dominante **${foot}**, lo más importante en este momento de tu progreso es la consistencia. La ciencia del deporte dice que las ganancias de rendimiento más grandes vienen de practicar las mismas habilidades fundamentales con pequeñas variaciones de dificultad semana tras semana.\n\n¿Hay algo más específico sobre esto que te gustaría explorar?`,
    `Interesante, ${name} ⚽ Eso que me preguntas está directamente relacionado con tu desarrollo como **${pos}**. En el fútbol femenino de alto rendimiento, las jugadoras que más rápido progresan son las que hacen preguntas exactamente como esta — cuestionan, buscan y adaptan.\n\nSi me das más contexto o detalle, puedo darte una respuesta mucho más personalizada. ¿Qué específicamente te genera esa duda?`,
    `${name}, eso que preguntas me parece muy relevante para una **${pos}** de tu nivel (OVR ${ovr}). 🎯\n\nTe recomiendo que lo trabajemos desde el punto de vista de la sesión de hoy. Según tus datos biométricos, tu HRV está en **${watch.hrvMs} ms** y tu FC en **${watch.heartRateBpm} BPM**. Con eso en mente, ¿quieres que diseñemos algo específico para responder a tu pregunta en el campo hoy?`,
  ];
  return { text: fallbacks[Math.floor(Math.random() * fallbacks.length)] };
}


export default function App() {
  const [activeProfileId, setActiveProfileIdState] = useState<string | null>(() => {
    const rec = getActiveProfileRecord();
    return rec ? rec.id : null;
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return activeProfileId !== null;
  });

  const initialRecord = getActiveProfileRecord();

  // Load state from active profile record or use defaults
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile>(() => {
    return initialRecord ? initialRecord.profile : INITIAL_PLAYER_PROFILE;
  });

  const [weeklySchedule, setWeeklySchedule] = useState<ScheduleDay[]>(() => {
    return initialRecord?.weeklySchedule && initialRecord.weeklySchedule.length > 0
      ? initialRecord.weeklySchedule
      : INITIAL_WEEKLY_SCHEDULE;
  });

  const [matchLogs, setMatchLogs] = useState<MatchLog[]>(() => {
    return initialRecord?.matchLogs || [];
  });

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => {
    return initialRecord?.chatHistory && initialRecord.chatHistory.length > 0
      ? initialRecord.chatHistory
      : INITIAL_CHAT_HISTORY;
  });

  const [challenges, setChallenges] = useState<Challenge[]>(() => {
    return initialRecord?.challenges && initialRecord.challenges.length > 0
      ? initialRecord.challenges
      : INITIAL_CHALLENGES;
  });

  const [badges, setBadges] = useState<Badge[]>(() => {
    return initialRecord?.badges && initialRecord.badges.length > 0
      ? initialRecord.badges
      : INITIAL_BADGES;
  });

  const handleSelectProfile = (record: FullProfileRecord) => {
    document.documentElement.style.removeProperty('--accent-color');
    document.documentElement.style.removeProperty('--accent-hover');
    document.documentElement.style.removeProperty('--accent-glow');

    setActiveProfileId(record.id);
    setActiveProfileIdState(record.id);

    setPlayerProfile(record.profile);
    setWeeklySchedule(record.weeklySchedule || INITIAL_WEEKLY_SCHEDULE);
    setMatchLogs(record.matchLogs || []);
    setChatHistory(record.chatHistory || INITIAL_CHAT_HISTORY);
    setChallenges(record.challenges || INITIAL_CHALLENGES);
    setBadges(record.badges || INITIAL_BADGES);

    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setActiveProfileId(null);
    setActiveProfileIdState(null);
    setIsLoggedIn(false);
  };

  // Smartwatch BLE Telemetry State - Defaults to DISCONNECTED (Real BLE mode)
  const [smartwatchData, setSmartwatchData] = useState<SmartwatchData>({
    connected: false,
    deviceName: 'Sin dispositivo enlazado',
    batteryLevel: 0,
    heartRateBpm: 0,
    hrvMs: 0,
    stepsToday: 0,
    caloriesBurned: 0,
    distanceKm: 0,
    avgPaceMinKm: '0:00 /km',
    stressScore: 0,
    sleepRecoveryScore: 0,
    heartRateZone: 'Reposo',
    lastSyncTime: 'No sincronizado'
  });
  const [isSmartwatchModalOpen, setIsSmartwatchModalOpen] = useState(false);

  const handleUpdateSmartwatchData = (data: Partial<SmartwatchData>) => {
    setSmartwatchData(prev => ({ ...prev, ...data }));
  };

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [toast, setToast] = useState<ToastData | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);
  const [activeWorkoutDay, setActiveWorkoutDay] = useState<ScheduleDay | null>(null);
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState<boolean>(false);

  const handleStartInteractiveWorkout = (day: ScheduleDay) => {
    sounds.playClick();
    setActiveWorkoutDay(day);
    setIsWorkoutModalOpen(true);
  };

  const handleCompleteInteractiveWorkout = (tonnageKg: number, xpGained: number) => {
    if (activeWorkoutDay) {
      setWeeklySchedule((prev) =>
        prev.map((d) =>
          d.id === activeWorkoutDay.id
            ? { ...d, status: 'completed' as const, totalTonnageKg: (d.totalTonnageKg || 0) + tonnageKg }
            : d
        )
      );
    }
    addXp(xpGained, 'Entrenamiento Interactivo en Vivo');
    setPlayerProfile((prev) => {
      const attr = { ...prev.attributes };
      attr.physical = Math.min(99, attr.physical + 1);
      attr.recovery = Math.min(99, attr.recovery + 1);
      const sum = attr.rhythm + attr.passing + attr.vision + attr.physical + attr.recovery + attr.shooting;
      return {
        ...prev,
        attributes: attr,
        OVR: Math.round(sum / 6),
        streakDays: prev.streakDays + 1
      };
    });
  };

  // Sync state to LocalStorage (Profile Record & Document Theme)
  useEffect(() => {
    if (!isLoggedIn || !activeProfileId) return;

    try {
      document.documentElement.setAttribute('data-theme', playerProfile.themeColor || 'flash');
      document.documentElement.setAttribute('data-mode', playerProfile.themeMode || 'dark');
      document.documentElement.style.removeProperty('--accent-color');
      document.documentElement.style.removeProperty('--accent-hover');
      document.documentElement.style.removeProperty('--accent-glow');

      saveProfileRecord({
        id: activeProfileId,
        lastActive: new Date().toISOString(),
        profile: playerProfile,
        weeklySchedule,
        matchLogs,
        chatHistory,
        challenges,
        badges
      });
    } catch (e) {
      console.warn("Error saving active profile state to localStorage", e);
    }
  }, [isLoggedIn, activeProfileId, playerProfile, weeklySchedule, matchLogs, chatHistory, challenges, badges]);

  // Helper for adding XP and handling level ups
  const addXp = (amount: number, reason: string) => {
    setPlayerProfile((prev) => {
      const newXp = prev.xp + amount;
      const newLevel = Math.floor(newXp / 1000) + 1; // Level calculation from 1
      const leveledUp = newLevel > prev.level;

      if (leveledUp) {
        sounds.playLevelUp();
        setToast({
          id: Date.now().toString(),
          title: `¡NIVEL ALCANZADO! LEVEL ${newLevel}`,
          message: `Has desbloqueado el rango Playmaker Avanzada. +${amount} XP ganado por ${reason}.`,
          type: 'level',
          xpGained: amount
        });
      } else {
        sounds.playSuccess();
        setToast({
          id: Date.now().toString(),
          title: `¡PROGRESO REGISTRADO!`,
          message: `+${amount} XP ganado (${reason}).`,
          type: 'xp',
          xpGained: amount
        });
      }

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        xpToNextLevel: newLevel * 1000
      };
    });
  };

  // 1. Confirm Day Activity (From Dashboard)
  const handleConfirmDayActivity = () => {
    setWeeklySchedule((prev) => {
      let updated = false;
      const nextSchedule = prev.map((item) => {
        if (!updated && (item.status === 'today' || item.status === 'pending')) {
          updated = true;
          return { ...item, status: 'completed' as const };
        }
        return item;
      });
      return nextSchedule;
    });

    // Award +100 XP
    addXp(100, 'Confirmar Actividad Diaria');

    // Update streak
    setPlayerProfile((prev) => ({
      ...prev,
      streakDays: prev.streakDays + 1
    }));
  };

  // Select day in schedule
  const handleSelectDay = (dayId: string) => {
    setWeeklySchedule((prev) =>
      prev.map((d) => {
        if (d.id === dayId) {
          const nextStatus = d.status === 'completed' ? 'pending' : 'completed';
          return { ...d, status: nextStatus };
        }
        return d;
      })
    );
  };

  // 2. AI Coach Chat Interaction
  const handleUpdateWeeklySchedule = (newSchedule: ScheduleDay[]) => {
    setWeeklySchedule(newSchedule);
    setToast({
      id: Date.now().toString(),
      title: "¡PLANIFICACIÓN IMPORTADA!",
      message: "Tus entrenamientos en gimnasio, casa o sprints han sido cargados en tu horario.",
      type: "success"
    });
  };

  // ─── Open-ended AI Engine ─────────────────────────────────────────────────
  // Simulates a true conversational AI by classifying intent from the full
  // message and generating deeply contextualised, personalised responses.
  const handleSendMessage = useCallback((userText: string) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatHistory((prev) => [...prev, userMsg]);

    // Small typing delay for realism
    const delay = 800 + Math.random() * 700;

    setTimeout(() => {
      const response = generateAIResponse(userText, playerProfile, smartwatchData);

      const currentTone = playerProfile.aiTone || 'gemini';
      const headers: Record<string, string> = {
        gemini: '🤖 **APEX Coach IA:**',
        demanding: '🔥 **Entrenadora Exigente:**',
        scientific: '🔬 **Análisis Científico:**',
        tactical: '⚡ **Analista Táctica Élite:**',
      };
      const header = headers[currentTone] || headers.gemini;

      // Handle schedule import side-effects
      if (response.importGym) {
        const t = response.importTime || '18:00';
        setWeeklySchedule(prev => prev.map(item =>
          ['LUN','MIE','VIE'].includes(item.dayShort)
            ? { ...item, activityType: 'gimnasio', title: 'Gimnasio: Fuerza Explosiva & Core', scheduledTime: t, location: 'gym', focusArea: 'fuerza', exercises: ['Sentadillas Búlgaras 4x8','Hip Thrust 4x10','Prensa Unilateral 3x12','Pallof Press Core 3x15s'], isImported: true }
            : item
        ));
      }
      if (response.importTechnique) {
        const t = response.importTime || '17:00';
        setWeeklySchedule(prev => prev.map(item =>
          ['MAR','JUE'].includes(item.dayShort)
            ? { ...item, activityType: 'entrenamiento', title: 'Técnica & Control Orientado', scheduledTime: t, location: 'casa', focusArea: 'tecnica', exercises: ['100 Pases a pared alternos','Control orientado 2 toques','Malabarismos 5 min','Conos en 8 x4'], isImported: true }
            : item
        ));
      }
      if (response.importSprints) {
        const t = response.importTime || '09:00';
        setWeeklySchedule(prev => prev.map(item =>
          ['MAR','VIE'].includes(item.dayShort)
            ? { ...item, activityType: 'entrenamiento', title: 'Sprints & Aceleración', scheduledTime: t, location: 'pista', focusArea: 'sprints', exercises: ['Salida reactiva 10m x6','Sprints 20m freno x4','Circuito Z cambios x5'], isImported: true }
            : item
        ));
      }

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: `${header}\n\n${response.text}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatHistory((prev) => [...prev, aiMsg]);
    }, delay);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerProfile, smartwatchData]);

  // Recalculate Week with AI
  const handleRecalculateWeek = () => {
    setWeeklySchedule((prev) =>
      prev.map((item) => {
        if (item.dayShort === 'JUE') {
          return {
            ...item,
            activityType: 'recuperacion',
            title: 'Recuperación Activa y Crioterapia (Ajustado por IA)',
            intensity: 'baja',
            durationMin: 30
          };
        }
        if (item.dayShort === 'VIE') {
          return {
            ...item,
            activityType: 'descanso',
            title: 'Descanso Absoluto / Estrategia',
            intensity: 'baja',
            durationMin: 0
          };
        }
        return item;
      })
    );

    const aiNotice: ChatMessage = {
      id: Date.now().toString(),
      sender: 'ai',
      text: "⚡ **Plan Semanal Re-calculado por la IA:** He reducido la carga del Jueves a Recuperación Activa (30 min) y asignado Descanso Absoluto el Viernes para garantizar que llegues al 100% de frescura muscular al partido del Sábado.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRecalculatedPlan: true
    };

    setChatHistory((prev) => [...prev, aiNotice]);

    setToast({
      id: Date.now().toString(),
      title: "¡SEMANA RE-CALCULADA CON IA!",
      message: "Carga de trabajo redistribuida para optimizar frescura física.",
      type: "success"
    });
  };

  // 3. Save Match Registration
  const handleSaveMatch = (newMatch: Partial<MatchLog>) => {
    const createdLog: MatchLog = {
      id: `match-${Date.now()}`,
      date: newMatch.date || new Date().toISOString().split('T')[0],
      opponent: newMatch.opponent || 'Rival Directo',
      type: newMatch.type || 'PARTIDO',
      result: newMatch.result || 'Registrado',
      goals: newMatch.goals || 0,
      assists: newMatch.assists || 0,
      keyPasses: newMatch.keyPasses || 0,
      recoveries: newMatch.recoveries || 0,
      minutesPlayed: newMatch.minutesPlayed || 60,
      rpe: newMatch.rpe || 7,
      rating: newMatch.rating || 8.0,
      tacticalNotes: newMatch.tacticalNotes || '',
      verified: true
    };

    setMatchLogs((prev) => [createdLog, ...prev]);

    setPlayerProfile((prev) => {
      const attr = { ...prev.attributes };

      if (createdLog.assists > 0 || createdLog.keyPasses >= 3) {
        attr.passing = Math.min(99, attr.passing + 1);
        attr.vision = Math.min(99, attr.vision + 1);
      }
      if (createdLog.recoveries >= 5) {
        attr.recovery = Math.min(99, attr.recovery + 1);
      }
      if (createdLog.minutesPlayed >= 75) {
        attr.physical = Math.min(99, attr.physical + 1);
      }

      const sum = attr.rhythm + attr.passing + attr.vision + attr.physical + attr.recovery + attr.shooting;
      const newOvr = Math.round(sum / 6);

      return {
        ...prev,
        attributes: attr,
        OVR: newOvr,
        monthlyMinutes: prev.monthlyMinutes + createdLog.minutesPlayed
      };
    });

    addXp(250, 'Registro Post-Partido');
    setActiveTab('dashboard');
  };

  // Delete Match Log
  const handleDeleteMatch = (matchId: string) => {
    const deletedMatch = matchLogs.find(m => m.id === matchId);
    setMatchLogs((prev) => prev.filter(m => m.id !== matchId));

    if (deletedMatch) {
      setPlayerProfile((prev) => ({
        ...prev,
        monthlyMinutes: Math.max(0, prev.monthlyMinutes - deletedMatch.minutesPlayed)
      }));
    }

    setToast({
      id: Date.now().toString(),
      title: "REGISTRO ELIMINADO",
      message: "El partido ha sido eliminado correctamente del historial.",
      type: "success"
    });
  };

  // Select Mentor
  const handleSelectMentor = (mentorId: string) => {
    const mentor = FEMALE_MENTORS.find(m => m.id === mentorId);
    setPlayerProfile((prev) => ({ ...prev, mentorId }));

    if (mentor) {
      setToast({
        id: Date.now().toString(),
        title: "¡REFERENTE SELECCIONADA!",
        message: `${mentor.name} es ahora tu inspiradora en el campo.`,
        type: "success"
      });
    }
  };

  // Ask mentor question via AI Chat
  const handleAskMentorQuestion = (mentorName: string, mentorRole: string) => {
    setActiveTab('coach');
    handleSendMessage(`¿Cuál es el mejor consejo táctico de ${mentorName} para una ${playerProfile.position}?`);
  };

  // 4. Claim Challenge Reward
  const handleClaimChallenge = (challengeId: string) => {
    const target = challenges.find((c) => c.id === challengeId);
    if (!target || target.claimed) return;

    setChallenges((prev) =>
      prev.map((c) => (c.id === challengeId ? { ...c, claimed: true } : c))
    );

    if (target.badgeId) {
      setBadges((prev) =>
        prev.map((b) => (b.id === target.badgeId ? { ...b, unlocked: true } : b))
      );
    }

    addXp(target.rewardXp, `Desafío: ${target.title}`);
  };

  // Update Profile Settings
  const handleUpdateProfile = (updated: Partial<PlayerProfile>) => {
    setPlayerProfile((prev) => ({ ...prev, ...updated }));
    setToast({
      id: Date.now().toString(),
      title: "PERFIL ACTUALIZADO",
      message: "Tus datos de jugadora han sido guardados correctamente.",
      type: "success"
    });
  };


  // Confirm Full Reset to 0
  const handleConfirmReset = (newProfileData: Partial<PlayerProfile>) => {
    const freshProfile: PlayerProfile = {
      name: newProfileData.name || "Jugadora Pro",
      email: newProfileData.email || "jugadora@gmail.com",
      position: newProfileData.position || "Volante de Contención / MC",
      level: 1,
      OVR: 60,
      xp: 0,
      xpToNextLevel: 1000,
      attributes: {
        rhythm: 60,
        passing: 60,
        vision: 60,
        physical: 60,
        recovery: 60,
        shooting: 60
      },
      streakDays: 0,
      monthlyMinutes: 0,
      avgRating: 6.0,
      preferredFoot: newProfileData.preferredFoot || "Derecha",
      jerseyNumber: newProfileData.jerseyNumber || "#10",
      country: newProfileData.country || "ESP",
      avatarUrl: newProfileData.avatarUrl || INITIAL_PLAYER_PROFILE.avatarUrl,
      playerCardPhotoUrl: newProfileData.playerCardPhotoUrl || INITIAL_PLAYER_PROFILE.playerCardPhotoUrl,
      themeColor: 'flash',
      mentorId: 'mentor-1'
    };

    setPlayerProfile(freshProfile);
    setMatchLogs([]);
    setChatHistory([
      {
        id: "msg-welcome-new",
        sender: "ai",
        text: `¡Bienvenida ${freshProfile.name}! Tu cuenta ha sido reiniciada con éxito desde cero. Tus estadísticas están listas para registrar tu primera sesión o partido.`,
        timestamp: "Ahora"
      }
    ]);
    setWeeklySchedule(INITIAL_WEEKLY_SCHEDULE.map(s => ({ ...s, status: 'pending' as const })));
    setChallenges(INITIAL_CHALLENGES.map(c => ({ ...c, progress: 0, completed: false, claimed: false })));
    setBadges(INITIAL_BADGES.map(b => ({ ...b, unlocked: false })));

    localStorage.clear();

    setToast({
      id: Date.now().toString(),
      title: "¡ESTADO REINICIADO A 0!",
      message: `Hola ${freshProfile.name}, tu nueva cuenta ha sido configurada desde cero.`,
      type: "success"
    });

    setActiveTab('dashboard');
  };

  // Show welcome screen if not logged in
  if (!isLoggedIn || !activeProfileId) {
    return <WelcomeScreen onSelectProfile={handleSelectProfile} />;
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#dae2fd] font-sans relative selection:bg-amber-500/30 overflow-x-hidden">
      {/* Superhero Theme Background Animation */}
      <ThemeBackground theme={playerProfile.themeColor || 'flash'} />

      {/* Toast Notification Banner */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />

      {/* Top App Bar */}
      <TopHeader
        playerProfile={playerProfile}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onUpdateProfile={handleUpdateProfile}
        smartwatchData={smartwatchData}
        onOpenSmartwatchModal={() => setIsSmartwatchModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="pt-20 px-4 sm:px-6 md:px-8 max-w-5xl mx-auto min-h-[calc(100vh-160px)]">
        {activeTab === 'dashboard' && (
          <DashboardView
            playerProfile={playerProfile}
            weeklySchedule={weeklySchedule}
            onConfirmDayActivity={handleConfirmDayActivity}
            onSelectDay={handleSelectDay}
            onNavigateTab={setActiveTab}
            smartwatchData={smartwatchData}
            onOpenSmartwatchModal={() => setIsSmartwatchModalOpen(true)}
            onStartInteractiveWorkout={handleStartInteractiveWorkout}
          />
        )}

        {activeTab === 'gym' && (
          <GymHubView
            playerProfile={playerProfile}
            onUpdateProfile={handleUpdateProfile}
          />
        )}

        {activeTab === 'coach' && (
          <CoachView
            playerProfile={playerProfile}
            weeklySchedule={weeklySchedule}
            chatHistory={chatHistory}
            onSendMessage={handleSendMessage}
            onRecalculateWeek={handleRecalculateWeek}
            onUpdateWeeklySchedule={handleUpdateWeeklySchedule}
            smartwatchData={smartwatchData}
          />
        )}

        {activeTab === 'mentors' && (
          <FemaleMentorsView
            playerProfile={playerProfile}
            onSelectMentor={handleSelectMentor}
            onAskMentorQuestion={handleAskMentorQuestion}
          />
        )}

        {activeTab === 'tracker' && (
          <MatchTrackerView
            onSaveMatch={handleSaveMatch}
            onCancel={() => setActiveTab('dashboard')}
            smartwatchData={smartwatchData}
          />
        )}

        {activeTab === 'card' && (
          <PlayerCardView
            playerProfile={playerProfile}
            matchLogs={matchLogs}
            onDeleteMatch={handleDeleteMatch}
          />
        )}

        {activeTab === 'gamification' && (
          <GamificationView
            playerProfile={playerProfile}
            challenges={challenges}
            badges={badges}
            onClaimChallenge={handleClaimChallenge}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            playerProfile={playerProfile}
            onUpdateProfile={handleUpdateProfile}
            onOpenResetModal={() => setIsResetModalOpen(true)}
            onLogout={handleLogout}
          />
        )}
      </main>

      {/* Reset Confirmation Modal */}
      <ResetConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirmReset={handleConfirmReset}
      />

      {/* Smartwatch Bluetooth Sync Modal */}
      <SmartwatchSyncModal
        isOpen={isSmartwatchModalOpen}
        onClose={() => setIsSmartwatchModalOpen(false)}
        smartwatchData={smartwatchData}
        onUpdateSmartwatchData={handleUpdateSmartwatchData}
      />

      {/* Interactive Live Workout Modal */}
      {activeWorkoutDay && (
        <InteractiveWorkoutModal
          isOpen={isWorkoutModalOpen}
          onClose={() => setIsWorkoutModalOpen(false)}
          dayActivity={activeWorkoutDay}
          onCompleteWorkout={handleCompleteInteractiveWorkout}
        />
      )}

      {/* Floating Glassmorphism Bottom Navigation */}
      <BottomNav activeTab={activeTab} setActiveTab={(tab) => { sounds.playClick(); setActiveTab(tab); }} />

      {/* Floating Background Music Player */}
      <BackgroundMusicPlayer />
    </div>
  );
}

