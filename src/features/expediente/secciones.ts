/** Estructura de la historia clínica psicológica: secciones, campos y preguntas guía. */

export type CampoExpediente =
  | "motivoConsulta"
  | "padecimientoActual"
  | "antecedentesPersonales"
  | "antecedentesFamiliares"
  | "antecedentesMedicos"
  | "medicacionActual"
  | "historiaDesarrollo"
  | "dinamicaFamiliar"
  | "evaluacionInicial"
  | "impresionDiagnostica"
  | "objetivosTerapeuticos"
  | "planTratamiento";

export type SeccionExpediente = {
  id: string;
  titulo: string;
  descripcion: string;
  campos: { campo: CampoExpediente; label: string; guia: string }[];
};

export const SECCIONES_EXPEDIENTE = [
  {
    id: "motivo",
    titulo: "Motivo de consulta",
    descripcion: "Qué trae al consultante y cómo lo vive hoy.",
    campos: [
      {
        campo: "motivoConsulta",
        label: "Motivo de consulta",
        guia: "En palabras del consultante: ¿qué le hizo buscar ayuda y qué espera del proceso?",
      },
      {
        campo: "padecimientoActual",
        label: "Padecimiento actual",
        guia: "Inicio, duración, frecuencia e intensidad; factores que lo agravan o alivian; impacto en su vida diaria.",
      },
    ],
  },
  {
    id: "antecedentes",
    titulo: "Antecedentes",
    descripcion: "Historia personal, familiar y médica relevante.",
    campos: [
      {
        campo: "antecedentesPersonales",
        label: "Antecedentes personales",
        guia: "Procesos terapéuticos previos, eventos significativos, consumo de sustancias, hospitalizaciones.",
      },
      {
        campo: "antecedentesFamiliares",
        label: "Antecedentes familiares",
        guia: "Salud mental en la familia, enfermedades relevantes, pérdidas.",
      },
      {
        campo: "antecedentesMedicos",
        label: "Antecedentes médicos",
        guia: "Enfermedades, cirugías, alergias, condiciones crónicas, sueño y alimentación.",
      },
      {
        campo: "medicacionActual",
        label: "Medicación actual",
        guia: "Medicamento, dosis, quién lo prescribe y desde cuándo.",
      },
    ],
  },
  {
    id: "historia",
    titulo: "Historia y contexto",
    descripcion: "Desarrollo y entorno del consultante.",
    campos: [
      {
        campo: "historiaDesarrollo",
        label: "Historia del desarrollo",
        guia: "Infancia, adolescencia, escolaridad, vida laboral y relaciones significativas.",
      },
      {
        campo: "dinamicaFamiliar",
        label: "Dinámica familiar y red de apoyo",
        guia: "Con quién vive, calidad de los vínculos, red de apoyo disponible.",
      },
    ],
  },
  {
    id: "evaluacion",
    titulo: "Evaluación",
    descripcion: "Observaciones iniciales e impresión diagnóstica.",
    campos: [
      {
        campo: "evaluacionInicial",
        label: "Evaluación inicial / examen mental",
        guia: "Apariencia, actitud, afecto, pensamiento, percepción, orientación, juicio. Pruebas aplicadas y resultados.",
      },
      {
        campo: "impresionDiagnostica",
        label: "Impresión diagnóstica",
        guia: "Hipótesis diagnóstica (CIE-11 / DSM-5-TR) y diagnóstico diferencial.",
      },
    ],
  },
  {
    id: "tratamiento",
    titulo: "Plan de tratamiento",
    descripcion: "Hacia dónde va el proceso terapéutico.",
    campos: [
      {
        campo: "objetivosTerapeuticos",
        label: "Objetivos terapéuticos",
        guia: "Objetivos acordados con el consultante, concretos y medibles.",
      },
      {
        campo: "planTratamiento",
        label: "Plan de tratamiento",
        guia: "Enfoque, técnicas, frecuencia de sesiones, duración estimada, criterios de alta y derivaciones.",
      },
    ],
  },
] as const satisfies readonly SeccionExpediente[];

export type SeccionId = (typeof SECCIONES_EXPEDIENTE)[number]["id"];

export function seccionPorId(id: string) {
  return SECCIONES_EXPEDIENTE.find((s) => s.id === id);
}
