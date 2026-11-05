/**
 * Titles for the dashboard hero <h1>. One is picked at random on each page load.
 * `lead` renders as plain text and `accent` as the terracotta italic <em> on the line below.
 */
export interface Headline {
  lead: string;
  accent: string;
}

export const HEADLINES: Headline[] = [
  // Not repeating gifts
  { lead: 'Regalos que aciertan,', accent: 'sin repetirse.' },
  { lead: 'Adiós a los regalos', accent: 'repetidos.' },
  { lead: 'Dos tostadoras', accent: 'nunca más.' },
  { lead: 'Cada regalo,', accent: 'una sola vez.' },
  { lead: 'Ni repetidos', accent: 'ni equivocados.' },
  { lead: 'Que nadie regale', accent: 'lo mismo dos veces.' },
  { lead: 'Un deseo,', accent: 'un regalo.' },
  { lead: 'Se acabaron los', accent: 'regalos duplicados.' },
  { lead: 'Cero repeticiones,', accent: 'cero devoluciones.' },
  { lead: 'Menos tickets regalo,', accent: 'más aciertos.' },
  { lead: 'Lo que ya está reservado,', accent: 'ya no se repite.' },
  { lead: 'Regalos coordinados', accent: 'sin grupos de WhatsApp.' },
  { lead: 'Sin repetidos', accent: 'y sin cambiar nada.' },
  { lead: 'Nada de “yo también', accent: 'te traje esto”.' },
  { lead: 'Un regalo por deseo,', accent: 'y todos contentos.' },

  // Getting it right
  { lead: 'Pide lo que quieres,', accent: 'recibe lo que esperas.' },
  { lead: 'Que acierten contigo', accent: 'a la primera.' },
  { lead: 'El regalo perfecto', accent: 'empieza aquí.' },
  { lead: 'Acertar nunca', accent: 'fue tan fácil.' },
  { lead: 'Regala bien,', accent: 'sin adivinar.' },
  { lead: 'Lo que de verdad', accent: 'te hace ilusión.' },
  { lead: 'Exactamente', accent: 'lo que querías.' },
  { lead: 'Aciertos garantizados,', accent: 'sorpresas incluidas.' },
  { lead: 'Que tu regalo', accent: 'sea el que esperabas.' },
  { lead: 'Regalar bien', accent: 'es cuestión de lista.' },
  { lead: 'Talla correcta,', accent: 'color correcto.' },
  { lead: 'Sin adivinanzas,', accent: 'solo aciertos.' },
  { lead: 'El regalo justo', accent: 'para la persona justa.' },
  { lead: 'Que lo que recibas', accent: 'sea lo que pediste.' },
  { lead: 'Acierta siempre,', accent: 'aunque no sepas qué regalar.' },

  // "What do I get you?"
  { lead: 'Menos “¿qué te regalo?”,', accent: 'más sorpresas buenas.' },
  { lead: '¿Qué le regalo?', accent: 'Mira su lista.' },
  { lead: 'La respuesta a', accent: '“¿qué quieres?”.' },
  { lead: 'Deja de preguntar', accent: 'qué quieren.' },
  { lead: '“No sé qué regalarte”', accent: 'se acabó.' },
  { lead: '¿Sin ideas?', accent: 'Ellos ya te las dan.' },
  { lead: 'Cuando no sabes qué regalar,', accent: 'hay una lista.' },
  { lead: 'Todas las ideas,', accent: 'en un solo sitio.' },
  { lead: 'Que te digan qué quieren,', accent: 'sin decírtelo.' },
  { lead: 'Adiós al', accent: '“lo que tú quieras”.' },
  { lead: 'Una pista', accent: 'mejor que cualquier otra.' },
  { lead: 'Tus deseos,', accent: 'sin indirectas.' },

  // The list itself
  { lead: 'Tu lista de deseos,', accent: 'a un enlace de distancia.' },
  { lead: 'Lo que deseas,', accent: 'en una sola lista.' },
  { lead: 'Todos tus deseos,', accent: 'bien ordenados.' },
  { lead: 'Una lista,', accent: 'mil ocasiones.' },
  { lead: 'Apunta tus deseos,', accent: 'nosotros hacemos el resto.' },
  { lead: 'Lo que quieres,', accent: 'donde todos lo vean.' },
  { lead: 'Tus caprichos,', accent: 'por escrito.' },
  { lead: 'De la cabeza', accent: 'a la lista.' },
  { lead: 'Escribe tus deseos.', accent: 'Cúmplelos con ayuda.' },
  { lead: 'Una lista para', accent: 'cada ilusión.' },
  { lead: 'Lo que sueñas,', accent: 'listo para regalar.' },
  { lead: 'Guarda tus deseos', accent: 'antes de que se olviden.' },
  { lead: 'Lo que te gusta,', accent: 'siempre a mano.' },
  { lead: 'Tu lista,', accent: 'tus reglas.' },

  // Sharing
  { lead: 'Comparte tu lista,', accent: 'ellos ponen la sorpresa.' },
  { lead: 'Un enlace', accent: 'y todos lo saben.' },
  { lead: 'Comparte un enlace,', accent: 'recibe lo que quieres.' },
  { lead: 'Mándalo por WhatsApp', accent: 'y listo.' },
  { lead: 'Un enlace para', accent: 'toda la familia.' },
  { lead: 'Tus deseos,', accent: 'listos para compartir.' },
  { lead: 'Comparte lo que quieres,', accent: 'no lo que tienes.' },
  { lead: 'Tu familia lo sabrá', accent: 'con un clic.' },
  { lead: 'Que todos sepan', accent: 'qué te hace ilusión.' },
  { lead: 'Comparte deseos,', accent: 'no indirectas.' },

  // Occasions
  { lead: 'Cada celebración', accent: 'merece el regalo justo.' },
  { lead: 'Cumpleaños, bodas, Navidad:', accent: 'una lista para cada una.' },
  { lead: 'Tu cumpleaños,', accent: 'sin regalos repetidos.' },
  { lead: 'Una boda', accent: 'sin tres vajillas.' },
  { lead: 'Navidad', accent: 'sin sorpresas raras.' },
  { lead: 'Para el bebé', accent: 'que está por llegar.' },
  { lead: 'Graduarse', accent: 'también merece un buen regalo.' },
  { lead: 'Cada fiesta,', accent: 'su propia lista.' },
  { lead: 'De Reyes', accent: 'a tu cumpleaños.' },
  { lead: 'Para cada momento', accent: 'especial.' },
  { lead: 'La lista que tu próxima fiesta', accent: 'necesita.' },
  { lead: 'Celebra más,', accent: 'organiza menos.' },

  // Guests / reserving
  { lead: 'Ellos reservan,', accent: 'tú te sorprendes.' },
  { lead: 'Reserva el regalo,', accent: 'guarda la sorpresa.' },
  { lead: 'Quien regala reserva,', accent: 'y nadie repite.' },
  { lead: 'Marca, compra', accent: 'y sorprende.' },
  { lead: 'Sin cuentas', accent: 'para tus invitados.' },
  { lead: 'Tus invitados lo tienen', accent: 'más fácil que nunca.' },
  { lead: 'Reservado para ti,', accent: 'con cariño.' },
  { lead: 'La sorpresa', accent: 'sigue siendo sorpresa.' },
  { lead: 'Saben qué regalarte,', accent: 'tú no sabes quién.' },
  { lead: 'Regalar en grupo', accent: 'sin líos.' },

  // Feeling
  { lead: 'Pequeños deseos,', accent: 'grandes sonrisas.' },
  { lead: 'Haz que tus deseos', accent: 'se cumplan.' },
  { lead: 'Pide un deseo.', accent: 'Comparte la lista.' },
  { lead: 'Los deseos se cumplen', accent: 'mejor en lista.' },
  { lead: 'Ilusión compartida,', accent: 'regalo acertado.' },
  { lead: 'Que regalar', accent: 'vuelva a ser divertido.' },
  { lead: 'Menos estrés,', accent: 'más celebración.' },
  { lead: 'Regalos con sentido,', accent: 'no por compromiso.' },
  { lead: 'Lo que quieres,', accent: 'de quien más quieres.' },
  { lead: 'Deséalo.', accent: 'Compártelo. Disfrútalo.' },
  { lead: 'Regalar con cariño', accent: 'y con acierto.' },
];
