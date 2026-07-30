import { PlayerProfile, SmartwatchData } from '../types';

export interface AIResponse {
  text: string;
  importGym?: boolean;
  importTechnique?: boolean;
  importSprints?: boolean;
  importTime?: string;
}

/**
 * Open-ended AI Engine Service
 * Analyzes player intent and generates context-aware, position-tailored responses.
 */
export function generateAIResponse(
  input: string, 
  profile: PlayerProfile, 
  watch: SmartwatchData
): AIResponse {
  const q = input.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const name = profile.name.split(' ')[0];
  const pos = profile.position;
  const foot = profile.preferredFoot;
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
    return { 
      text: `¡Hasta pronto, ${name}! 👋 Recuerda hidratarte bien y descansar las horas que necesitas. ¡El descanso también es entrenamiento! Nos vemos en la siguiente sesión. 💪` 
    };
  }

  // ── Identity / Who are you ─────────────────────────────────────────────────
  if (/(quien eres|que eres|como te llamas|eres una ia|eres un bot|eres humano|eres real)/.test(q)) {
    return { 
      text: `Soy **APEX Coach IA** 🤖⚽ — tu entrenadora personal de rendimiento futbolístico, creada especialmente para ti.\n\nEstoy diseñada para analizar tu biometría, planificar tu semana, darte consejos tácticos personalizados para tu posición de **${pos}**, orientarte en nutrición deportiva, prevención de lesiones y mucho más.\n\nNo soy una IA genérica; estoy 100% enfocada en hacer de ti una jugadora de élite. ¿Empezamos, ${name}?` 
    };
  }

  // ── How are you ────────────────────────────────────────────────────────────
  if (/(como estas|como te va|que tal tu dia|estas bien)/.test(q)) {
    return { 
      text: `¡Estoy perfecta, ${name}! 😄 Funcionando al 100% y con toda la energía para ayudarte. Ahora cuéntame tú: ¿cómo te encuentras físicamente hoy? Tus pulsaciones están en **${watch.heartRateBpm} BPM** y tu HRV en **${watch.hrvMs} ms**. Según esos datos, ${watch.hrvMs >= 60 ? 'tienes el sistema nervioso bien recuperado y puedes entrenar a alta intensidad.' : 'te recomiendo una sesión de recuperación activa hoy.'}` 
    };
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
    const rec = watch.hrvMs >= 65 
      ? '✅ Óptimo para alta intensidad.' 
      : watch.hrvMs >= 50 
        ? '⚠️ Moderado, considera sesión de medio impacto.' 
        : '🔴 Baja recuperación. Descansa o haz movilidad suave.';

    return { 
      text: `⌚ **Análisis Biométrico en Tiempo Real:**\n\n• **Frecuencia Cardíaca:** ${watch.heartRateBpm} BPM — Zona *${zone}*\n• **HRV (Variabilidad):** ${watch.hrvMs} ms — ${rec}\n• **Pasos Hoy:** ${watch.stepsToday.toLocaleString()}\n• **Calorías:** ${watch.caloriesBurned} kcal\n• **Batería Reloj:** ${watch.batteryLevel}%\n\n**Recomendación:** ${watch.hrvMs >= 65 ? `Tienes luz verde para entrenar fuerte hoy, ${name}. Aprovecha esta recuperación excelente.` : `Escucha a tu cuerpo hoy, ${name}. Una sesión suave te dará más beneficio que forzar el cuerpo cansado.`}` 
    };
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
    return { 
      text: `🥗 **Plan Nutricional para ${pos}:**\n\n**3-4 horas antes de entrenar:**\n• Arroz blanco o avena + 120g de pechuga de pollo a la plancha\n• Fruta de bajo índice glucémico (manzana, pera)\n\n**1 hora antes:**\n• Plátano maduro + 500ml de bebida isotónica con electrolitos\n\n**Durante el entrenamiento:**\n• 200ml de agua cada 20 minutos\n• Geles de carbohidrato si supera 90 min\n\n**Post-entreno (primeros 30 min):**\n• 25-30g proteína whey + 50g carbohidratos de rápida absorción\n• Cerezas o arándanos para reducir inflamación muscular\n\n¿Quieres que te personalice el plan según tu posición o un partido específico, ${name}?` 
    };
  }

  // ── Injury prevention ──────────────────────────────────────────────────────
  if (/(dolor|lesion|molestia|sobrecarga|tiron|isquios|cuadriceps|rodilla|tobillo|fisio)/.test(q)) {
    return { 
      text: `🚑 **Protocolo de Prevención & Cuidados — APEX:**\n\n⚠️ *Nota:* Si el dolor es agudo o punzante (≥6/10 en escala RPE), interrumpe la actividad y consulta al cuerpo médico del club.\n\n**Para molestias por sobrecarga leve:**\n1. **Crioterapia local:** 15 min de hielo en la zona afectada (3 veces/día).\n2. **Movilidad articular suave:** Sin carga ni rebotes.\n3. **Foam roller:** Pasadas lentas en musculatura adyacente (evita la zona dolorosa directamente).\n4. **Sueño:** Mínimo 8-9 horas para regeneración de tejido.\n\n¿En qué zona sientes la molestia concretamente, ${name}?` 
    };
  }

  // ── Tactical advice by position ───────────────────────────────────────────
  if (/(tactica|tactico|posicion|desmarque|presion|cobertura|perfilamiento|pase|orientado)/.test(q)) {
    const posTips: Record<string, string> = {
      'Mediocentro Creativa': `🧠 **Pautas Tácticas para Mediocentro Creativa:**\n\n1. **Perfilamiento pre-recepción:** Antes de pedir el balón, haz 2 escaneos de hombro. Debes saber a quién jugar ANTES de tocar el balón.\n2. **Tercer hombre:** Busca siempre la pared con la delantera para romper la primera línea de presión rival.\n3. **Pase entre líneas:** Arriesga en último tercio, pero asegura el pase de seguridad si la línea defensiva está hundida.`,
      'Extrema Derecha': `⚡ **Pautas Tácticas para Extrema:**\n\n1. **Aislamiento 1v1:** Recibe bien abierta en banda para encarar a la lateral rival en velocidad.\n2. **Centros al área:** Si vas a línea de fondo, busca centro raso atrasado a la llegada de la mediocentro.`,
      'Extrema Izquierda': `⚡ **Pautas Tácticas para Extrema:**\n\n1. **Diagonal hacia dentro:** Conduce con pierna cambiada para habilitar el disparo o el pase filtrado.\n2. **Desmarque de ruptura:** Ataca el espacio entre lateral y central rival cuando tu mediocentro oriente el cuerpo.`,
      'Delantera Centro': `🎯 **Pautas Tácticas para Delantera:**\n\n1. **Movimiento en tijera:** Fija a las centrales y ataca el primer palo en centros laterales.\n2. **Juego de espaldas:** Protege con el cuerpo a 2 toques y descarga de cara para la llegada de segunda línea.`,
      'Lateral Derecha': `🛡️ **Pautas Tácticas para Lateral:**\n\n1. **Desdoblamiento (Overlap/Underlap):** Elige el momento exacto para dar amplitud cuando la extrema se mete por dentro.\n2. **Cierre defensivo:** No pierdas de vista la espalda en basculaciones defensivas.`
    };

    const tip = posTips[pos] || `🎯 **Consejo Táctico General para ${pos}:**\nMantén la concentración defensiva en la pérdida del balón (presión tras pérdida de 5 segundos) y busca siempre el control orientado al espacio libre.`;

    return { text: `${tip}\n\n¿Quieres trabajar un aspecto específico en tu próxima sesión, ${name}?` };
  }

  // ── Default / Open-ended Intelligent Fallback ──────────────────────────────
  return { 
    text: `Entendido perfectamente, ${name}. Como tu **${pos}** (OVR **${profile.OVR}**), cada detalle cuenta.\n\nHe analizado tu mensaje ("*${input}*") y lo tomo en cuenta para tu ficha. Tu frecuencia cardíaca está en **${watch.heartRateBpm} BPM** y tu recuperación en **${watch.hrvMs} ms**.\n\n¿Quieres que ajustemos tu entrenamiento semanal, agreguemos un ejercicio táctico específico o prefieres revisar tus estadísticas post-partido? ¡Dime cómo avanzamos!` 
  };
}
