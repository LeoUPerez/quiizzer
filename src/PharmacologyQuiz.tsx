import React, { useCallback, useEffect, useMemo, useState } from "react";

/* =========================================================================
 * TIPOS Y DATOS
 * ========================================================================= */

export interface Option {
  id: string;
  text: string;
}

export interface Question {
  id: number;
  type: "multiple_choice" | "true_false" | "fill_in_the_blank";
  statement: string; // Para 'fill_in_the_blank', usa '___' para el espacio a completar
  options: Option[];
  correctAnswer: string; // ID de la opción correcta o "True"/"False"
  explanation: string;
}

export interface Exam {
  id: string;
  title: string;
  topic: string;
  questions: Question[];
}


export const EXAMS_DATA: Exam[] = [
  {
    id: "exam-1",
    title: "Examen 1: Conceptos Fundamentales y Dosificación",
    topic: "Definiciones de Farmacología, Fármaco, Medicamento Esencial y Dosis",
    questions: [
      {
        id: 1,
        type: "multiple_choice",
        statement: "¿Cómo se define formalmente la Farmacología?",
        options: [
          { id: "a", text: "La ciencia que estudia exclusivamente la elaboración química de fármacos sintéticos" },
          { id: "b", text: "La ciencia que estudia las propiedades, efectos y mecanismos de acción de las sustancias químicas en los seres vivos" },
          { id: "c", text: "El estudio de la prescripción de medicamentos en el área hospitalaria" },
          { id: "d", text: "La rama de la medicina que produce vacunas y antibióticos" },
        ],
        correctAnswer: "b",
        explanation:
          "La Farmacología es la ciencia que estudia el origen, las propiedades físicas y químicas, la bioquímica, los efectos fisiológicos y los mecanismos de acción de las sustancias químicas en los organismos vivos.",
      },
      {
        id: 2,
        type: "fill_in_the_blank",
        statement:
          "Un ___ es cualquier sustancia química pura capaz de interactuar con un organismo vivo para modificar una función biológica.",
        options: [
          { id: "a", text: "fármaco" },
          { id: "b", text: "excipiente" },
          { id: "c", text: "placebo" },
          { id: "d", text: "vehículo" },
        ],
        correctAnswer: "a",
        explanation:
          "Un fármaco (o principio activo) es toda sustancia química pura capaz de producir una respuesta o modificación biológica en el organismo.",
      },
      {
        id: 3,
        type: "true_false",
        statement:
          "Según la OMS, los medicamentos esenciales son aquellos que satisfacen las necesidades prioritarias de salud de la población.",
        options: [
          { id: "True", text: "Verdadero" },
          { id: "False", text: "Falso" },
        ],
        correctAnswer: "True",
        explanation:
          "Los medicamentos esenciales se seleccionan atendiendo a la prevalencia de las enfermedades, seguridad, eficacia y coste-efectividad para la comunidad.",
      },
      {
        id: 4,
        type: "multiple_choice",
        statement: "¿Qué es la 'dosis' en farmacología?",
        options: [
          { id: "a", text: "La cantidad total de medicamento presente en un frasco o ampolla" },
          { id: "b", text: "La cantidad estimada de fármaco que se elimina por vía renal cada hora" },
          { id: "c", text: "La cantidad exacta de una sustancia que se administra para lograr un efecto determinado" },
          { id: "d", text: "El porcentaje de fármaco que llega a la circulación plasmática" },
        ],
        correctAnswer: "c",
        explanation:
          "La dosis es la cantidad de fármaco expresada en peso, volumen o unidades que se administra a un individuo para producir una respuesta biológica esperada.",
      },
      {
        id: 5,
        type: "fill_in_the_blank",
        statement:
          "La dosis de ___ es una dosis inicial más elevada que se administra al inicio del tratamiento para alcanzar rápidamente la concentración plasmática terapéutica deseada.",
        options: [
          { id: "a", text: "mantenimiento" },
          { id: "b", text: "carga" },
          { id: "c", text: "letal" },
          { id: "d", text: "mínima" },
        ],
        correctAnswer: "b",
        explanation:
          "La dosis de carga (o dosis de ataque) llena los depósitos del organismo rápidamente para alcanzar en menor tiempo los niveles terapéuticos del fármaco.",
      },
      {
        id: 6,
        type: "true_false",
        statement:
          "La dosis de mantenimiento se administra de manera continua o periódica para reemplazar el fármaco que el organismo ha metabolizado o excretado.",
        options: [
          { id: "True", text: "Verdadero" },
          { id: "False", text: "Falso" },
        ],
        correctAnswer: "True",
        explanation:
          "El objetivo de la dosis de mantenimiento es reponer la cantidad de fármaco eliminada en un intervalo de dosis para mantener estable su concentración plasmática.",
      },
      {
        id: 7,
        type: "multiple_choice",
        statement: "¿Qué define a la Dosis Letal (DL50)?",
        options: [
          { id: "a", text: "La dosis mínima que causa mareos en el 50% de los pacientes" },
          { id: "b", text: "La dosis calculada para producir la muerte en el 50% de la población de ensayo" },
          { id: "c", text: "La cantidad máxima de fármaco tolerable sin causar efectos secundarios toxicidad" },
          { id: "d", text: "La dosis que inactiva el 50% de las enzimas hepáticas" },
        ],
        correctAnswer: "b",
        explanation:
          "La Dosis Letal 50 (DL50) es la dosis calculada estadísticamente que produce la muerte del 50% de los animales de laboratorio sometidos a experimentación.",
      },
      {
        id: 8,
        type: "fill_in_the_blank",
        statement:
          "Durante el periodo de ___, se debe tener precaución al administrar fármacos a la madre debido al riesgo de excreción en la leche materna y exposición del neonato.",
        options: [
          { id: "a", text: "embarazo" },
          { id: "b", text: "lactancia" },
          { id: "c", text: "gestación" },
          { id: "d", text: "parto" },
        ],
        correctAnswer: "b",
        explanation:
          "En la lactancia, muchos fármacos consumidos por la madre atraviesan hacia la leche materna por difusión pasiva, pudiendo afectar al lactante.",
      },
      {
        id: 9,
        type: "true_false",
        statement:
          "Todos los fármacos consumidos por la madre están estrictamente prohibidos durante la lactancia materna.",
        options: [
          { id: "True", text: "Verdadero" },
          { id: "False", text: "Falso" },
        ],
        correctAnswer: "False",
        explanation:
          "No todos están prohibidos; existen muchos fármacos seguros con bajo pasaje a la leche materna, aunque siempre se debe evaluar la relación beneficio/riesgo.",
      },
      {
        id: 10,
        type: "multiple_choice",
        statement: "¿Cuál es la principal diferencia funcional entre un 'fármaco' y un 'medicamento'?",
        options: [
          { id: "a", text: "El fármaco es la sustancia pura (principio activo), mientras que el medicamento incluye excipientes y una forma farmacéutica acondicionada" },
          { id: "b", text: "El fármaco requiere receta médica y el medicamento es de venta libre" },
          { id: "c", text: "El fármaco siempre es sintético y el medicamento es de origen biológico" },
          { id: "d", text: "No existe ninguna diferencia, ambos términos significan exactamente lo mismo" },
        ],
        correctAnswer: "a",
        explanation:
          "El fármaco es el principio activo químico puro. El medicamento es la combinación del principio activo con excipientes presentado en una forma farmacéutica para uso clínico.",
      },
    ],
  },
  {
    id: "exam-2",
    title: "Examen 2: Farmacocinética, Farmacodinamia y Membranas",
    topic: "Procesos LADME, Mecanismos de Acción y Membranas Biológicas",
    questions: [
      {
        id: 1,
        type: "multiple_choice",
        statement: "¿Qué estudia específicamente la Farmacocinética?",
        options: [
          { id: "a", text: "Los efectos bioquímicos del fármaco sobre el organismo" },
          { id: "b", text: "Lo que el organismo le hace al fármaco (LADME: Liberación, Absorción, Distribución, Metabolismo, Excreción)" },
          { id: "c", text: "La interacción del fármaco con receptores específicos" },
          { id: "d", text: "Los efectos adversos causados por una sobredosis de medicamentos" },
        ],
        correctAnswer: "b",
        explanation:
          "La Farmacocinética estudia el movimiento del fármaco dentro del cuerpo a lo largo del tiempo, abarcando los procesos del acrónimo LADME.",
      },
      {
        id: 2,
        type: "fill_in_the_blank",
        statement:
          "La Farmacodinamia se enfoca en estudiar lo que el fármaco le hace al ___, incluyendo sus mecanismos de acción y efectos moleculares.",
        options: [
          { id: "a", text: "organismo" },
          { id: "b", text: "hígado" },
          { id: "c", text: "riñón" },
          { id: "d", text: "excipiente" },
        ],
        correctAnswer: "a",
        explanation:
          "La Farmacodinamia estudia las acciones fisiológicas, bioquímicas y los mecanismos moleculares que ejerce el fármaco sobre el organismo.",
      },
      {
        id: 3,
        type: "true_false",
        statement:
          "Las siglas del proceso farmacocinético LADME corresponden a: Liberación, Absorción, Distribución, Metabolismo y Excreción.",
        options: [
          { id: "True", text: "Verdadero" },
          { id: "False", text: "Falso" },
        ],
        correctAnswer: "True",
        explanation:
          "LADME es el acrónimo clásico que describe los 5 procesos principales del tránsito de un fármaco en el cuerpo.",
      },
      {
        id: 4,
        type: "multiple_choice",
        statement: "¿Cuáles son las partes principales en las que se divide el estudio de la Farmacodinamia?",
        options: [
          { id: "a", text: "Absorción, filtrado renal y aclaramiento plasma" },
          { id: "b", text: "Receptores farmacológicos, mecanismos de acción, efectos terapéuticos y curva dosis-respuesta" },
          { id: "c", text: "Excreción biliar, metabolismo de fase I y fase II" },
          { id: "d", text: "Vía enteral, parenteral y tópica" },
        ],
        correctAnswer: "b",
        explanation:
          "La Farmacodinamia se divide fundamentalmente en el estudio de receptores, transducción de señales, mecanismos de acción y la relación entre dosis y respuesta.",
      },
      {
        id: 5,
        type: "fill_in_the_blank",
        statement:
          "Las membranas biológicas están compuestas principalmente por una doble capa de ___ que actúa como barrera selectiva para los fármacos.",
        options: [
          { id: "a", text: "carbohidratos" },
          { id: "b", text: "lipoproteínas" },
          { id: "c", text: "fosfolípidos" },
          { id: "d", text: "ácidos nucleicos" },
        ],
        correctAnswer: "c",
        explanation:
          "La estructura básica de la membrana biológica es una bicapa lipídica de fosfolípidos que permite el paso diferencial de sustancias según su liposolubilidad.",
      },
      {
        id: 6,
        type: "true_false",
        statement:
          "Los fármacos liposolubles y no ionizados atraviesan las membranas biológicas con mayor facilidad por difusión pasiva.",
        options: [
          { id: "True", text: "Verdadero" },
          { id: "False", text: "Falso" },
        ],
        correctAnswer: "True",
        explanation:
          "La difusión pasiva a través de membranas lipídicas favorece a las moléculas que son altamente liposolubles y que no poseen carga eléctrica (no ionizadas).",
      },
      {
        id: 7,
        type: "multiple_choice",
        statement:
          "¿Qué proceso del LADME se refiere a la biotransformación química de un fármaco en metabolitos activos o inactivos, realizada principalmente en el hígado?",
        options: [
          { id: "a", text: "Distribución" },
          { id: "b", text: "Absorción" },
          { id: "c", text: "Metabolismo" },
          { id: "d", text: "Excreción" },
        ],
        correctAnswer: "c",
        explanation:
          "El metabolismo (o biotransformación) altera químicamente la estructura del fármaco facilitando su eliminación o inactivándolo.",
      },
      {
        id: 8,
        type: "fill_in_the_blank",
        statement:
          "El transporte activo de fármacos a través de la membrana biológica se diferencia de la difusión pasiva porque requiere gasto de ___ y se realiza contra un gradiente de concentración.",
        options: [
          { id: "a", text: "energía (ATP)" },
          { id: "b", text: "agua" },
          { id: "c", text: "sodio" },
          { id: "d", text: "oxígeno molecular" },
        ],
        correctAnswer: "a",
        explanation:
          "El transporte activo requiere consumo energético (usualmente ATP) para mover el fármaco en contra de su gradiente de concentración utilizando un transportador.",
      },
      {
        id: 9,
        type: "true_false",
        statement:
          "La 'Liberación' es la primera etapa del proceso LADME donde el principio activo se separa del excipiente y se disuelve en el sitio de administración.",
        options: [
          { id: "True", text: "Verdadero" },
          { id: "False", text: "Falso" },
        ],
        correctAnswer: "True",
        explanation:
          "Para que un fármaco sólido pueda absorberse, primero debe liberarse de su forma farmacéutica (disgregación y disolución).",
      },
      {
        id: 10,
        type: "multiple_choice",
        statement: "¿Cuál es la principal vía de Excreción de los fármacos en el organismo?",
        options: [
          { id: "a", text: "Vía cutánea (sudor)" },
          { id: "b", text: "Vía renal (orina)" },
          { id: "c", text: "Vía pulmonar (exhalación)" },
          { id: "d", text: "Vía salival" },
        ],
        correctAnswer: "b",
        explanation:
          "El riñón es el órgano excretor más importante, encargado de eliminar la gran mayoría de fármacos y sus metabolitos solubles en agua.",
      },
    ],
  },
  {
    id: "exam-3",
    title: "Examen 3: Vías de Administración y Clasificación",
    topic: "Clasificación, Ventajas y Desventajas de las Vías de Administración",
    questions: [
      {
        id: 1,
        type: "multiple_choice",
        statement:
          "¿Cómo se clasifican comúnmente las vías de administración sistémicas según el uso del tubo digestivo?",
        options: [
          { id: "a", text: "Vías Rápidas y Vías Lentas" },
          { id: "b", text: "Vías Enterales y Vías Parenterales" },
          { id: "c", text: "Vías Químicas y Vías Físicas" },
          { id: "d", text: "Vías Directas y Vías Indirectas" },
        ],
        correctAnswer: "b",
        explanation:
          "Las vías enterales (oral, sublingual, rectal) utilizan el tracto digestivo; las vías parenterales (IV, IM, SC, etc.) atraviesan barreras directamente sin usar la vía digestiva.",
      },
      {
        id: 2,
        type: "fill_in_the_blank",
        statement:
          "La vía de administración ___ consiste en colocar el fármaco debajo de la lengua para una rápida absorción a través del lecho vascular, evitando el primer paso hepático.",
        options: [
          { id: "a", text: "oral" },
          { id: "b", text: "sublingual" },
          { id: "c", text: "rectal" },
          { id: "d", text: "tópica" },
        ],
        correctAnswer: "b",
        explanation:
          "La vía sublingual permite la absorción directa por la mucosa sublingual hacia la vena cava superior, eludiendo el hígado.",
      },
      {
        id: 3,
        type: "true_false",
        statement:
          "La principal ventaja de la vía oral es que es una vía cómoda, económica, segura y no invasiva.",
        options: [
          { id: "True", text: "Verdadero" },
          { id: "False", text: "Falso" },
        ],
        correctAnswer: "True",
        explanation:
          "La vía oral es la más aceptada por los pacientes por ser autoadministrable, económica y sin dolor.",
      },
      {
        id: 4,
        type: "multiple_choice",
        statement: "¿Cuál es una DESVENTAJA importante de la vía de administración oral?",
        options: [
          { id: "a", text: "Es una vía dolorosa y requiere técnica estéril" },
          { id: "b", text: "Sufre el efecto de primer paso hepático y puede generar irritación gástrica" },
          { id: "c", text: "Produce una respuesta biológica inmediata instantánea" },
          { id: "d", text: "No permite administrar volúmenes superiores a 2 mL" },
        ],
        correctAnswer: "b",
        explanation:
          "Los fármacos orales atraviesan la circulación portal sufriendo el efecto de primer paso hepático y pueden destruir o irritar la mucosa digestiva.",
      },
      {
        id: 5,
        type: "fill_in_the_blank",
        statement:
          "La vía ___ deposita el fármaco directamente en el torrente sanguíneo, ofreciendo una biodisponibilidad del 100% y una respuesta inmediata.",
        options: [
          { id: "a", text: "intramuscular" },
          { id: "b", text: "intravenosa" },
          { id: "c", text: "subcutánea" },
          { id: "d", text: "intradérmica" },
        ],
        correctAnswer: "b",
        explanation:
          "La vía intravenosa (IV) no requiere absorción previa, por lo que su biodisponibilidad es completa e inmediata.",
      },
      {
        id: 6,
        type: "true_false",
        statement:
          "La vía de administración intramuscular (IM) permite la inyección de soluciones oleosas y preparados de depósito de liberación lenta.",
        options: [
          { id: "True", text: "Verdadero" },
          { id: "False", text: "Falso" },
        ],
        correctAnswer: "True",
        explanation:
          "El tejido muscular está altamente vascularizado y permite la administración de preparados oleosos o de depósito que liberan el medicamento gradualmente.",
      },
      {
        id: 7,
        type: "multiple_choice",
        statement: "¿Cuál representa una desventaja de las vías parenterales (como la vía IV o IM)?",
        options: [
          { id: "a", text: "Requiere técnica aséptica, genera dolor y presenta mayor riesgo de infección o sobredosis difícil de revertir" },
          { id: "b", text: "Tienen una absorción muy errática y dependiente del alimento" },
          { id: "c", text: "Sufren una degradación masiva en el estómago por ácido clorhídrico" },
          { id: "d", text: "Impiden su uso en pacientes inconscientes o que sufren vómitos" },
        ],
        correctAnswer: "a",
        explanation:
          "Las vías parenterales son invasivas, requieren personal entrenado, material estéril y conllevan riesgo de dolor, infección y rápida toxicidad por errores de dosis.",
      },
      {
        id: 8,
        type: "fill_in_the_blank",
        statement:
          "La vía ___ se utiliza principalmente cuando se busca un efecto local sobre la piel o mucosas sin buscar una absorción sistémica significativa.",
        options: [
          { id: "a", text: "tópica" },
          { id: "b", text: "intracardíaca" },
          { id: "c", text: "intratecal" },
          { id: "d", text: "intraperitoneal" },
        ],
        correctAnswer: "a",
        explanation:
          "La vía tópica aplica el fármaco directamente en la superficie (piel, ojos, oídos) con fines de acción local sobre el tejido afectado.",
      },
      {
        id: 9,
        type: "true_false",
        statement:
          "La vía rectal se considera una vía enteral que resulta útil en pacientes con vómitos incontrolables o en niños pequeños.",
        options: [
          { id: "True", text: "Verdadero" },
          { id: "False", text: "Falso" },
        ],
        correctAnswer: "True",
        explanation:
          "La vía rectal permite la administración de fármacos cuando la vía oral no es factible por emesis (vómitos) o inconsciencia.",
      },
      {
        id: 10,
        type: "multiple_choice",
        statement:
          "¿Qué ventaja principal ofrece la vía inhalatoria en el tratamiento de afecciones respiratorias como el asma?",
        options: [
          { id: "a", text: "Garantiza que el 100% del fármaco pase a la circulación sistémica" },
          { id: "b", text: "Permite una acción directa y rápida del fármaco sobre los bronquios con menores efectos adversos sistémicos" },
          { id: "c", text: "Evita por completo la necesidad de dosificación o dispositivos especiales" },
          { id: "d", text: "Es completamente indolora y no requiere coordinación del paciente" },
        ],
        correctAnswer: "b",
        explanation:
          "La vía inhalatoria deposita el principio activo directamente en el tejido diana (pulmones/bronquios), acelerando el alivio y reduciendo la toxicidad sistémica.",
      },
    ],
  },
  {
    id: "exam-4",
    title: "Examen 4: Dinámica Celular y Paso por Membranas",
    topic: "Mecanismos de Transporte, Farmacodinamia y Dosificación Avanzada",
    questions: [
      {
        id: 1,
        type: "multiple_choice",
        statement: "¿Cuál es la forma principal en que la mayoría de los fármacos no ionizados y liposolubles atraviesan la membrana biológica?",
        options: [
          { id: "a", text: "Transporte activo primario dependiente de ATP" },
          { id: "b", text: "Difusión pasiva a favor del gradiente de concentración" },
          { id: "c", text: "Endocitosis mediada por receptores de superficie" },
          { id: "d", text: "Filtración a través de poros proteicos cerrados" },
        ],
        correctAnswer: "b",
        explanation:
          "La difusión pasiva es el mecanismo más frecuente de paso transmembrana para fármacos neutros y liposolubles, no requiere energía y va a favor de gradiente.",
      },
      {
        id: 2,
        type: "fill_in_the_blank",
        statement:
          "La interacción entre un fármaco y su ___ específico en la célula desencadena la cascada de señales de la respuesta farmacodinámica.",
        options: [
          { id: "a", text: "receptor" },
          { id: "b", text: "excipiente" },
          { id: "c", text: "fosfolípido" },
          { id: "d", text: "solvente" },
        ],
        correctAnswer: "a",
        explanation:
          "Los receptores son macromoléculas celulares a las que se une selectivamente un fármaco para iniciar su efecto farmacológico (mecanismo de acción).",
      },
      {
        id: 3,
        type: "true_false",
        statement:
          "La dosis de carga se calcula en función del volumen de distribución para alcanzar rápidamente concentraciones terapéuticas en plasma.",
        options: [
          { id: "True", text: "Verdadero" },
          { id: "False", text: "Falso" },
        ],
        correctAnswer: "True",
        explanation:
          "La dosis de carga permite saturar rápidamente los compartimentos corporales para llegar sin demora a la ventana terapéutica.",
      },
      {
        id: 4,
        type: "multiple_choice",
        statement: "¿Por qué es crítica la evaluación de medicamentos durante el periodo de lactancia materna?",
        options: [
          { id: "a", text: "Porque destruye inmediatamente los nutrientes esenciales de la leche materna" },
          { id: "b", text: "Porque el fármaco ingerido por la madre puede difundir a la leche y ser absorbido por el lactante" },
          { id: "c", text: "Porque invalida por completo el efecto terapéutico en la madre" },
          { id: "d", text: "Porque altera de forma permanente el pH estomacal del recién nacido" },
        ],
        correctAnswer: "b",
        explanation:
          "Los fármacos en el torrente sanguíneo materno pueden pasar a la leche por difusión pasiva según su liposolubilidad y unión a proteínas, pudiendo afectar al lactante.",
      },
      {
        id: 5,
        type: "fill_in_the_blank",
        statement:
          "Los medicamentos ___ son aquellos seleccionados prioritariamente para atender las necesidades de salud de la población y deben estar disponibles en todo momento.",
        options: [
          { id: "a", text: "esenciales" },
          { id: "b", text: "placebos" },
          { id: "c", text: "experimentales" },
          { id: "d", text: "sintéticos" },
        ],
        correctAnswer: "a",
        explanation:
          "El concepto de 'medicamento esencial' promovido por la OMS busca asegurar el acceso universal a fármacos eficaces, seguros y de costo accesible.",
      },
      {
        id: 6,
        type: "true_false",
        statement:
          "El efecto de primer paso hepático incrementa la biodisponibilidad de los fármacos administrados por vía oral.",
        options: [
          { id: "True", text: "Verdadero" },
          { id: "False", text: "Falso" },
        ],
        correctAnswer: "False",
        explanation:
          "El efecto de primer paso hepático REDUCE la biodisponibilidad del fármaco porque se metaboliza parte de la dosis antes de llegar a la circulación sistémica.",
      },
      {
        id: 7,
        type: "multiple_choice",
        statement:
          "¿Qué parámetro de dosificación determina la cantidad de fármaco necesaria para reponer el medicamento eliminado y mantener el estado de equilibrio?",
        options: [
          { id: "a", text: "Dosis letal (DL50)" },
          { id: "b", text: "Dosis de mantenimiento" },
          { id: "c", text: "Dosis de carga" },
          { id: "d", text: "Dosis tóxica mínima" },
        ],
        correctAnswer: "b",
        explanation:
          "La dosis de mantenimiento administra de forma periódica la cantidad exacta que el cuerpo elimina en cada intervalo para conservar el nivel plasmático estable.",
      },
      {
        id: 8,
        type: "fill_in_the_blank",
        statement:
          "La vía ___ es una vía parenteral indirecta que inyecta el fármaco en el tejido adiposo bajo la piel, ofreciendo una absorción lenta y sostenida.",
        options: [
          { id: "a", text: "subcutánea" },
          { id: "b", text: "intravenosa" },
          { id: "c", text: "oral" },
          { id: "d", text: "sublingual" },
        ],
        correctAnswer: "a",
        explanation:
          "La vía subcutánea coloca el fármaco en la capa adiposa bajo la dermis, desde donde se absorbe lentamente a los capilares (útil para insulinas y heparinas).",
      },
      {
        id: 9,
        type: "true_false",
        statement:
          "La Dosis Letal 50 (DL50) es un indicador de seguridad que se determina mediante estudios clínicos de fase III en humanos.",
        options: [
          { id: "True", text: "Verdadero" },
          { id: "False", text: "Falso" },
        ],
        correctAnswer: "False",
        explanation:
          "La DL50 se determina únicamente en estudios preclínicos con animales de laboratorio por razones éticas y de bioseguridad.",
      },
      {
        id: 10,
        type: "multiple_choice",
        statement: "¿Cuál es el componente estructural lipídico dominante en la arquitectura de las membranas biológicas?",
        options: [
          { id: "a", text: "Triglicéridos insaturados" },
          { id: "b", text: "Bicapa de fosfolípidos" },
          { id: "c", text: "Cera de ésteres de ácidos grasos" },
          { id: "d", text: "Cadenas de polisacáridos puros" },
        ],
        correctAnswer: "b",
        explanation:
          "Las membranas biológicas se organizan en una bicapa de fosfolípidos con cabezas hidrofílicas hacia el exterior y colas hidrofóbicas hacia el interior.",
      },
    ],
  },
  {
    id: "exam-5",
    title: "Examen 5: Vías de Administración y Destino del Fármaco",
    topic: "Comparativa de Vías, Etapas LADME y Seguridad en Dosificación",
    questions: [
      {
        id: 1,
        type: "multiple_choice",
        statement: "¿Cuál de las siguientes es una ventaja destacada de la vía sublingual sobre la vía oral convencional?",
        options: [
          { id: "a", text: "Permite la administración de volúmenes superiores a 500 mL" },
          { id: "b", text: "Evita la destrucción gástrica y el metabolismo de primer paso hepático" },
          { id: "c", text: "Es la vía ideal para fármacos en suspensión insolubles y amargos" },
          { id: "d", text: "Permite una absorción prolongada durante varios días" },
        ],
        correctAnswer: "b",
        explanation:
          "La mucosa sublingual drena directamente hacia las venas yugulares y la vena cava superior, saltándose el paso gástrico y el tránsito hepático inmediato.",
      },
      {
        id: 2,
        type: "fill_in_the_blank",
        statement: "En el acrónimo LADME, la letra M corresponde al proceso de ___ o biotransformación química del fármaco.",
        options: [
          { id: "a", text: "metabolismo" },
          { id: "b", text: "mantenimiento" },
          { id: "c", text: "membrana" },
          { id: "d", text: "moco" },
        ],
        correctAnswer: "a",
        explanation:
          "La M en LADME significa Metabolismo, el proceso de modificación química que sufre el fármaco (principalmente en el hígado).",
      },
      {
        id: 3,
        type: "true_false",
        statement:
          "Un fármaco es la sustancia química pura (principio activo), mientras que el medicamento es el producto final acondicionado para su administración.",
        options: [
          { id: "True", text: "Verdadero" },
          { id: "False", text: "Falso" },
        ],
        correctAnswer: "True",
        explanation:
          "El fármaco es la molécula activa pura. El medicamento combina ese fármaco con excipientes bajo una forma farmacéutica específica (ej. comprimido, jarabe).",
      },
      {
        id: 4,
        type: "multiple_choice",
        statement: "¿Qué ocurre si se administra una dosis excesiva que supera ampliamente la dosis de mantenimiento requerida?",
        options: [
          { id: "a", text: "Se acelera proporcionalmente la velocidad de absorción cutánea" },
          { id: "b", text: "Se incrementa el riesgo de alcanzar niveles tóxicos en el organismo" },
          { id: "c", text: "El exceso de fármaco se convierte automáticamente en excipiente inerte" },
          { id: "d", text: "Se reduce inmediatamente el volumen de distribución a cero" },
        ],
        correctAnswer: "b",
        explanation:
          "Superar la dosis de mantenimiento recomendada eleva las concentraciones en sangre por encima de la ventana terapéutica, provocando toxicidad.",
      },
      {
        id: 5,
        type: "fill_in_the_blank",
        statement:
          "La vía de administración ___ es la más rápida e invasiva, ya que no requiere absorción e introduce el fármaco directamente en la vena.",
        options: [
          { id: "a", text: "intravenosa" },
          { id: "b", text: "oral" },
          { id: "c", text: "rectal" },
          { id: "d", text: "tópica" },
        ],
        correctAnswer: "a",
        explanation:
          "La vía intravenosa (IV) inyecta directamente el fármaco en la circulación venosa, logrando acción inmediata y 100% de biodisponibilidad.",
      },
      {
        id: 6,
        type: "true_false",
        statement:
          "Las vías parenterales son aquellas que utilizan obligatoriamente el tubo digestivo para la absorción del fármaco.",
        options: [
          { id: "True", text: "Verdadero" },
          { id: "False", text: "Falso" },
        ],
        correctAnswer: "False",
        explanation:
          "Falso. Las vías que utilizan el tubo digestivo son las ENTERALES (oral, sublingual, rectal). Las parenterales atraviesan las barreras corporales por inyección.",
      },
      {
        id: 7,
        type: "multiple_choice",
        statement: "¿Cuál es una desventaja notable de la vía intramuscular en comparación con la vía oral?",
        options: [
          { id: "a", text: "Requiere técnica aséptica, genera dolor local y puede causar hematomas o lesión nerviosa" },
          { id: "b", text: "Tiene una biodisponibilidad del 0%" },
          { id: "c", text: "Sufre un efecto de primer paso hepático masivo" },
          { id: "d", text: "Imposibilita la administración de preparados de liberación lenta" },
        ],
        correctAnswer: "a",
        explanation:
          "La vía intramuscular es invasiva, requiere personal capacitado, causa molestias al paciente y conlleva riesgos de infección o lesión hística.",
      },
      {
        id: 8,
        type: "fill_in_the_blank",
        statement:
          "La Farmacocinética estudia el trayecto del fármaco en el cuerpo, mientras que la ___ estudia los mecanismos de acción y respuesta bioquímica en el organismo.",
        options: [
          { id: "a", text: "Farmacodinamia" },
          { id: "b", text: "Posología" },
          { id: "c", text: "Toxicología" },
          { id: "d", text: "Farmacotecnia" },
        ],
        correctAnswer: "a",
        explanation:
          "La Farmacodinamia analiza lo que el fármaco le hace al organismo (efectos biomoleculares, fisiológicos y mecánicos).",
      },
      {
        id: 9,
        type: "true_false",
        statement:
          "Durante el periodo de lactancia, los fármacos de carácter básico se concentran en mayor proporción en la leche materna debido al pH ligeramente más ácido de la leche.",
        options: [
          { id: "True", text: "Verdadero" },
          { id: "False", text: "Falso" },
        ],
        correctAnswer: "True",
        explanation:
          "La leche materna es ligeramente más ácida (pH ~7.2) que el plasma (pH ~7.4), lo que provoca el atrapamiento iónico de fármacos de carácter básico débil.",
      },
      {
        id: 10,
        type: "multiple_choice",
        statement: "¿Qué distingue a la vía tópica de las vías de administración sistémicas?",
        options: [
          { id: "a", text: "Busca aplicar el fármaco sobre la piel o mucosas para un efecto predominantemente local" },
          { id: "b", text: "Proporciona siempre concentraciones elevadas en el tejido renal" },
          { id: "c", text: "Requiere obligatoriamente un dispositivo de infusión continua" },
          { id: "d", text: "Es la única vía que no presenta limitaciones de uso" },
        ],
        correctAnswer: "a",
        explanation:
          "La vía tópica busca actuar en la zona de aplicación (piel, ojos, oídos) minimizando la absorción sistémica y sus efectos adversos generales.",
      },
    ],
  },
];

/* =========================================================================
 * PERSISTENCIA (localStorage)
 * ========================================================================= */

const STORAGE_KEY = "pharma-quiz-state-v2";

export type ExamStatus = "not_started" | "in_progress" | "completed";

export interface ExamProgress {
  answers: Record<number, string>; // questionId -> optionId
  currentIndex: number;
  completed: boolean;
  score: number | null;
  total: number;
  completedAt: string | null;
}

type AppState = Record<string, ExamProgress>;

const emptyProgress = (total: number): ExamProgress => ({
  answers: {},
  currentIndex: 0,
  completed: false,
  score: null,
  total,
  completedAt: null,
});

const loadState = (): AppState => {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as AppState) : {};
  } catch {
    return {};
  }
};

const saveState = (state: AppState): void => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* almacenamiento no disponible: la app sigue funcionando en memoria */
  }
};

const getStatus = (p: ExamProgress | undefined): ExamStatus => {
  if (!p) return "not_started";
  if (p.completed) return "completed";
  if (Object.keys(p.answers).length > 0 || p.currentIndex > 0) return "in_progress";
  return "not_started";
};

const computeScore = (exam: Exam, answers: Record<number, string>): number =>
  exam.questions.reduce(
    (acc, q) => (answers[q.id] === q.correctAnswer ? acc + 1 : acc),
    0,
  );

/* =========================================================================
 * UTILIDADES UI
 * ========================================================================= */

const cx = (...classes: Array<string | false | null | undefined>): string =>
  classes.filter(Boolean).join(" ");

const TYPE_LABEL: Record<Question["type"], string> = {
  multiple_choice: "Selección múltiple",
  true_false: "Verdadero / Falso",
  fill_in_the_blank: "Completar",
};

const STATUS_META: Record<ExamStatus, { label: string; badge: string }> = {
  not_started: {
    label: "Sin empezar",
    badge: "bg-slate-100 text-slate-700 ring-slate-200",
  },
  in_progress: {
    label: "En progreso",
    badge: "bg-amber-50 text-amber-800 ring-amber-200",
  },
  completed: {
    label: "Completado",
    badge: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  },
};

/* =========================================================================
 * COMPONENTES: DASHBOARD
 * ========================================================================= */

interface DashboardProps {
  exams: Exam[];
  state: AppState;
  onStart: (examId: string) => void;
  onReview: (examId: string) => void;
  onRetake: (examId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  exams,
  state,
  onStart,
  onReview,
  onRetake,
}) => {
  const completedCount = exams.filter(
    (e) => getStatus(state[e.id]) === "completed",
  ).length;

  return (
    <div className="mx-auto px-4 sm:px-6 py-10 max-w-5xl">
      <header className="mb-10">
        <p className="font-medium text-indigo-600 text-sm uppercase tracking-wider">
          Farmacología
        </p>
        <h1 className="mt-1 font-bold text-slate-900 text-3xl sm:text-4xl tracking-tight">
          Banco de exámenes
        </h1>
        <p className="mt-2 text-slate-600">
          {completedCount} de {exams.length} exámenes completados. Tu progreso
          se guarda automáticamente en este navegador.
        </p>
      </header>

      <div className="gap-6 grid sm:grid-cols-2 lg:grid-cols-3">
        {exams.map((exam) => {
          const progress = state[exam.id];
          const status = getStatus(progress);
          const meta = STATUS_META[status];
          const answered = progress ? Object.keys(progress.answers).length : 0;
          const total = exam.questions.length;
          const pct =
            progress?.score != null
              ? Math.round((progress.score / total) * 100)
              : null;

          return (
            <article
              key={exam.id}
              className="flex flex-col bg-white shadow-sm hover:shadow-md p-6 border border-slate-200 rounded-2xl transition"
            >
              <div className="flex justify-between items-start gap-3">
                <span
                  className={cx(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
                    meta.badge,
                  )}
                >
                  {meta.label}
                </span>
                <span className="text-slate-500 text-xs">
                  {total} preguntas
                </span>
              </div>

              <h2 className="mt-4 font-semibold text-slate-900 text-lg leading-snug">
                {exam.title}
              </h2>
              <p className="mt-1 text-slate-600 text-sm">{exam.topic}</p>

              <div className="flex-1 mt-5">
                {status === "completed" && progress?.score != null && (
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="font-medium text-slate-500 text-xs uppercase tracking-wide">
                      Calificación final
                    </p>
                    <p className="mt-1 font-bold text-slate-900 text-2xl">
                      {progress.score}/{total}{" "}
                      <span
                        className={cx(
                          "text-base font-semibold",
                          (pct ?? 0) >= 70 ? "text-emerald-600" : "text-rose-600",
                        )}
                      >
                        ({pct}%)
                      </span>
                    </p>
                  </div>
                )}
                {status === "in_progress" && (
                  <div>
                    <div className="flex justify-between text-slate-600 text-xs">
                      <span>Respondidas</span>
                      <span>
                        {answered}/{total}
                      </span>
                    </div>
                    <div className="bg-slate-100 mt-1.5 rounded-full w-full h-2 overflow-hidden">
                      <div
                        className="bg-amber-400 rounded-full h-full transition-all"
                        style={{ width: `${(answered / total) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
                {status === "not_started" && (
                  <p className="text-slate-500 text-sm">
                    Aún no has respondido ninguna pregunta.
                  </p>
                )}
              </div>

              <div className="flex gap-2 mt-6">
                {status === "not_started" && (
                  <button
                    type="button"
                    onClick={() => onStart(exam.id)}
                    className="bg-indigo-600 hover:bg-indigo-700 shadow-sm px-4 py-2.5 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 w-full font-semibold text-white text-sm transition"
                  >
                    Iniciar
                  </button>
                )}
                {status === "in_progress" && (
                  <button
                    type="button"
                    onClick={() => onStart(exam.id)}
                    className="bg-amber-500 hover:bg-amber-600 shadow-sm px-4 py-2.5 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 w-full font-semibold text-white text-sm transition"
                  >
                    Continuar
                  </button>
                )}
                {status === "completed" && (
                  <>
                    <button
                      type="button"
                      onClick={() => onReview(exam.id)}
                      className="flex-1 bg-white hover:bg-slate-50 shadow-sm px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 font-semibold text-slate-700 text-sm transition"
                    >
                      Revisar
                    </button>
                    <button
                      type="button"
                      onClick={() => onRetake(exam.id)}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 shadow-sm px-4 py-2.5 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 font-semibold text-white text-sm transition"
                    >
                      Repetir
                    </button>
                  </>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

/* =========================================================================
 * COMPONENTES: PREGUNTAS
 * ========================================================================= */

interface QuestionRendererProps {
  question: Question;
  value: string | undefined;
  onChange: (optionId: string) => void;
}

const MultipleChoiceQuestion: React.FC<QuestionRendererProps> = ({
  question,
  value,
  onChange,
}) => (
  <fieldset className="space-y-3">
    <legend className="sr-only">Opciones</legend>
    {question.options.map((opt) => {
      const selected = value === opt.id;
      return (
        <label
          key={opt.id}
          className={cx(
            "flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition",
            selected
              ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500"
              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
          )}
        >
          <input
            type="radio"
            name={`q-${question.id}`}
            value={opt.id}
            checked={selected}
            onChange={() => onChange(opt.id)}
            className="w-4 h-4 accent-indigo-600"
          />
          <span className="flex justify-center items-center bg-slate-100 rounded-full w-7 h-7 font-bold text-slate-600 text-xs uppercase shrink-0">
            {opt.id}
          </span>
          <span className="text-slate-800 text-sm sm:text-base">{opt.text}</span>
        </label>
      );
    })}
  </fieldset>
);

const TrueFalseQuestion: React.FC<QuestionRendererProps> = ({
  question,
  value,
  onChange,
}) => (
  <div className="gap-4 grid grid-cols-2">
    {question.options.map((opt) => {
      const selected = value === opt.id;
      const isTrue = opt.id === "True";
      return (
        <button
          key={opt.id}
          type="button"
          aria-pressed={selected}
          onClick={() => onChange(opt.id)}
          className={cx(
            "flex flex-col items-center justify-center gap-2 rounded-2xl border-2 px-4 py-8 text-lg font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
            selected && isTrue &&
              "border-emerald-500 bg-emerald-50 text-emerald-800 focus-visible:ring-emerald-500",
            selected && !isTrue &&
              "border-rose-500 bg-rose-50 text-rose-800 focus-visible:ring-rose-500",
            !selected &&
              "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-indigo-500",
          )}
        >
          <span className="text-3xl" aria-hidden="true">
            {isTrue ? "✓" : "✗"}
          </span>
          {opt.text}
        </button>
      );
    })}
  </div>
);

const FillInTheBlankQuestion: React.FC<QuestionRendererProps> = ({
  question,
  value,
  onChange,
}) => {
  const [before, after] = question.statement.split("___");
  const selectedText = question.options.find((o) => o.id === value)?.text;

  return (
    <div className="space-y-6">
      <p className="bg-slate-50 p-5 border border-slate-300 border-dashed rounded-xl text-slate-800 text-base sm:text-lg leading-relaxed">
        {before}
        <span
          className={cx(
            "mx-1 inline-block min-w-[9rem] rounded-md border-b-2 px-2 text-center font-semibold",
            selectedText
              ? "border-indigo-500 bg-indigo-50 text-indigo-800"
              : "border-slate-400 text-slate-400",
          )}
        >
          {selectedText ?? "________"}
        </span>
        {after}
      </p>

      <div>
        <label
          htmlFor={`select-q-${question.id}`}
          className="block mb-2 font-medium text-slate-700 text-sm"
        >
          Selecciona la opción que completa el enunciado:
        </label>
        <select
          id={`select-q-${question.id}`}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="bg-white shadow-sm px-3 py-2.5 border border-slate-300 focus:border-indigo-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full text-slate-800 text-sm"
        >
          <option value="" disabled>
            — Elige una opción —
          </option>
          {question.options.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.text}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        {question.options.map((opt) => {
          const selected = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(opt.id)}
              className={cx(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
                selected
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
              )}
            >
              {opt.text}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const QuestionRenderer: React.FC<QuestionRendererProps> = (props) => {
  switch (props.question.type) {
    case "multiple_choice":
      return <MultipleChoiceQuestion {...props} />;
    case "true_false":
      return <TrueFalseQuestion {...props} />;
    case "fill_in_the_blank":
      return <FillInTheBlankQuestion {...props} />;
    default:
      return null;
  }
};

/* =========================================================================
 * COMPONENTES: VISTA DE EXAMEN
 * ========================================================================= */

interface ExamViewProps {
  exam: Exam;
  progress: ExamProgress;
  onAnswer: (questionId: number, optionId: string) => void;
  onNavigate: (index: number) => void;
  onFinish: () => void;
  onExit: () => void;
}

const ExamView: React.FC<ExamViewProps> = ({
  exam,
  progress,
  onAnswer,
  onNavigate,
  onFinish,
  onExit,
}) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const total = exam.questions.length;
  const index = Math.min(Math.max(progress.currentIndex, 0), total - 1);
  const question: Question | undefined = exam.questions[index];
  const answeredCount = Object.keys(progress.answers).length;
  const unanswered = exam.questions.filter(
    (q) => progress.answers[q.id] === undefined,
  );

  const handleFinishClick = () => {
    if (unanswered.length > 0) {
      setConfirmOpen(true);
    } else {
      onFinish();
    }
  };

  // Navegación con teclado (flechas)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (confirmOpen) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "SELECT" || tag === "INPUT") return;
      if (e.key === "ArrowRight" && index < total - 1) onNavigate(index + 1);
      if (e.key === "ArrowLeft" && index > 0) onNavigate(index - 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [index, total, onNavigate, confirmOpen]);

  if (!question) return null;

  return (
    <div className="mx-auto px-4 sm:px-6 py-8 max-w-3xl">
      {/* Cabecera */}
      <div className="flex justify-between items-start gap-4 mb-6">
        <div>
          <button
            type="button"
            onClick={onExit}
            className="font-medium text-indigo-600 hover:text-indigo-800 text-sm"
          >
            ← Volver al listado
          </button>
          <h1 className="mt-2 font-bold text-slate-900 text-xl sm:text-2xl">
            {exam.title}
          </h1>
          <p className="text-slate-600 text-sm">{exam.topic}</p>
        </div>
        <div className="bg-white shadow-sm px-4 py-2 rounded-xl ring-1 ring-slate-200 text-right shrink-0">
          <p className="text-slate-500 text-xs uppercase tracking-wide">
            Pregunta
          </p>
          <p className="font-bold text-slate-900 text-lg">
            {index + 1}{" "}
            <span className="font-medium text-slate-500 text-sm">de {total}</span>
          </p>
        </div>
      </div>

      {/* Barra de progreso + saltos por pregunta */}
      <div className="mb-8">
        <div className="bg-slate-200 rounded-full w-full h-2 overflow-hidden">
          <div
            className="bg-indigo-600 rounded-full h-full transition-all duration-300"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-3">
          {exam.questions.map((q, i) => {
            const answered = progress.answers[q.id] !== undefined;
            const active = i === index;
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => onNavigate(i)}
                aria-label={`Ir a la pregunta ${i + 1}`}
                aria-current={active ? "step" : undefined}
                className={cx(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
                  active && "bg-indigo-600 text-white ring-2 ring-indigo-300",
                  !active && answered && "bg-emerald-100 text-emerald-800",
                  !active && !answered && "bg-slate-100 text-slate-600 hover:bg-slate-200",
                )}
              >
                {i + 1}
              </button>
            );
          })}
          <span className="ml-auto text-slate-500 text-xs">
            {answeredCount}/{total} respondidas
          </span>
        </div>
      </div>

      {/* Tarjeta de pregunta */}
      <section className="bg-white shadow-sm p-6 sm:p-8 border border-slate-200 rounded-2xl">
        <span className="inline-flex items-center bg-indigo-50 px-2.5 py-0.5 rounded-full ring-1 ring-indigo-200 ring-inset font-semibold text-indigo-700 text-xs">
          {TYPE_LABEL[question.type]}
        </span>
        {question.type !== "fill_in_the_blank" && (
          <h2 className="mt-4 font-semibold text-slate-900 text-lg sm:text-xl leading-relaxed">
            {question.statement}
          </h2>
        )}
        <div className="mt-6">
          <QuestionRenderer
            key={question.id}
            question={question}
            value={progress.answers[question.id]}
            onChange={(optionId) => onAnswer(question.id, optionId)}
          />
        </div>
      </section>

      {/* Navegación */}
      <div className="flex sm:flex-row flex-col-reverse sm:justify-between sm:items-center gap-3 mt-6">
        <button
          type="button"
          onClick={() => onNavigate(index - 1)}
          disabled={index === 0}
          className="bg-white hover:bg-slate-50 disabled:opacity-40 shadow-sm px-5 py-2.5 border border-slate-300 rounded-lg font-semibold text-slate-700 text-sm transition disabled:cursor-not-allowed"
        >
          ← Atrás
        </button>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleFinishClick}
            className="bg-emerald-600 hover:bg-emerald-700 shadow-sm px-5 py-2.5 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 font-semibold text-white text-sm transition"
          >
            Finalizar examen
          </button>
          <button
            type="button"
            onClick={() => onNavigate(index + 1)}
            disabled={index === total - 1}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 shadow-sm px-5 py-2.5 rounded-lg font-semibold text-white text-sm transition disabled:cursor-not-allowed"
          >
            Adelante →
          </button>
        </div>
      </div>

      {/* Modal de confirmación */}
      {confirmOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          className="z-50 fixed inset-0 flex justify-center items-center bg-slate-900/50 p-4"
          onClick={() => setConfirmOpen(false)}
        >
          <div
            className="bg-white shadow-xl p-6 rounded-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="confirm-title" className="font-bold text-slate-900 text-lg">
              ¿Finalizar con preguntas sin responder?
            </h3>
            <p className="mt-2 text-slate-600 text-sm">
              Tienes{" "}
              <strong className="text-slate-900">
                {unanswered.length}{" "}
                {unanswered.length === 1 ? "pregunta" : "preguntas"}
              </strong>{" "}
              sin responder (
              {unanswered
                .map((q) => exam.questions.findIndex((x) => x.id === q.id) + 1)
                .join(", ")}
              ). Se contarán como incorrectas.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="bg-white hover:bg-slate-50 px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-700 text-sm"
              >
                Seguir respondiendo
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmOpen(false);
                  onFinish();
                }}
                className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg font-semibold text-white text-sm"
              >
                Finalizar de todas formas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* =========================================================================
 * COMPONENTES: RESULTADOS
 * ========================================================================= */

interface ResultsViewProps {
  exam: Exam;
  progress: ExamProgress;
  onRetake: () => void;
  onExit: () => void;
}

const renderStatementWithAnswer = (q: Question, optionId?: string): string => {
  if (q.type !== "fill_in_the_blank") return q.statement;
  const text = q.options.find((o) => o.id === optionId)?.text ?? "______";
  return q.statement.replace("___", `[${text}]`);
};

const ResultsView: React.FC<ResultsViewProps> = ({
  exam,
  progress,
  onRetake,
  onExit,
}) => {
  const total = exam.questions.length;
  const score = progress.score ?? computeScore(exam, progress.answers);
  const pct = Math.round((score / total) * 100);
  const passed = pct >= 70;

  const optionText = (q: Question, id?: string) =>
    q.options.find((o) => o.id === id)?.text;

  return (
    <div className="mx-auto px-4 sm:px-6 py-8 max-w-3xl">
      <button
        type="button"
        onClick={onExit}
        className="font-medium text-indigo-600 hover:text-indigo-800 text-sm"
      >
        ← Volver al listado
      </button>

      {/* Resumen */}
      <section
        className={cx(
          "mt-4 rounded-2xl border p-8 text-center shadow-sm",
          passed
            ? "border-emerald-200 bg-emerald-50"
            : "border-rose-200 bg-rose-50",
        )}
      >
        <p className="font-medium text-slate-600 text-sm uppercase tracking-wider">
          Resultado
        </p>
        <h1 className="mt-1 font-bold text-slate-900 text-2xl">{exam.title}</h1>
        <div className="flex justify-center items-center gap-6 mt-6">
          <div
            className={cx(
              "flex h-32 w-32 flex-col items-center justify-center rounded-full border-8",
              passed
                ? "border-emerald-500 text-emerald-700"
                : "border-rose-500 text-rose-700",
            )}
          >
            <span className="font-extrabold text-3xl">{pct}%</span>
            <span className="font-semibold text-xs">
              {score}/{total}
            </span>
          </div>
        </div>
        <p
          className={cx(
            "mt-5 text-lg font-semibold",
            passed ? "text-emerald-800" : "text-rose-800",
          )}
        >
          {passed
            ? "¡Excelente! Has aprobado el examen."
            : "Sigue estudiando. Revisa las explicaciones a continuación."}
        </p>
        {progress.completedAt && (
          <p className="mt-1 text-slate-500 text-xs">
            Completado el{" "}
            {new Date(progress.completedAt).toLocaleString("es-ES", {
              dateStyle: "long",
              timeStyle: "short",
            })}
          </p>
        )}
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <button
            type="button"
            onClick={onRetake}
            className="bg-indigo-600 hover:bg-indigo-700 shadow-sm px-5 py-2.5 rounded-lg font-semibold text-white text-sm"
          >
            Repetir examen
          </button>
          <button
            type="button"
            onClick={onExit}
            className="bg-white hover:bg-slate-50 shadow-sm px-5 py-2.5 border border-slate-300 rounded-lg font-semibold text-slate-700 text-sm"
          >
            Ir al listado
          </button>
        </div>
      </section>

      {/* Desglose */}
      <h2 className="mt-10 font-bold text-slate-900 text-lg">
        Desglose de respuestas
      </h2>
      <ol className="space-y-4 mt-4">
        {exam.questions.map((q, i) => {
          const userAnswer = progress.answers[q.id];
          const correct = userAnswer === q.correctAnswer;
          const skipped = userAnswer === undefined;
          return (
            <li
              key={q.id}
              className={cx(
                "rounded-2xl border bg-white p-5 shadow-sm",
                correct ? "border-emerald-200" : "border-rose-200",
              )}
            >
              <div className="flex items-start gap-3">
                <span
                  className={cx(
                    "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white",
                    correct ? "bg-emerald-500" : "bg-rose-500",
                  )}
                  aria-label={correct ? "Correcta" : "Incorrecta"}
                >
                  {correct ? "✓" : "✗"}
                </span>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-500 text-xs uppercase tracking-wide">
                      Pregunta {i + 1}
                    </span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded-full font-medium text-[11px] text-slate-600">
                      {TYPE_LABEL[q.type]}
                    </span>
                  </div>
                  <p className="mt-1 font-medium text-slate-900">
                    {renderStatementWithAnswer(q, q.correctAnswer)}
                  </p>

                  <dl className="gap-2 grid sm:grid-cols-2 mt-3 text-sm">
                    <div
                      className={cx(
                        "rounded-lg p-3",
                        correct
                          ? "bg-emerald-50"
                          : skipped
                            ? "bg-slate-50"
                            : "bg-rose-50",
                      )}
                    >
                      <dt className="font-semibold text-slate-500 text-xs uppercase">
                        Tu respuesta
                      </dt>
                      <dd
                        className={cx(
                          "mt-0.5 font-medium",
                          correct
                            ? "text-emerald-800"
                            : skipped
                              ? "italic text-slate-500"
                              : "text-rose-800",
                        )}
                      >
                        {skipped
                          ? "Sin responder"
                          : optionText(q, userAnswer) ?? userAnswer}
                      </dd>
                    </div>
                    {!correct && (
                      <div className="bg-emerald-50 p-3 rounded-lg">
                        <dt className="font-semibold text-slate-500 text-xs uppercase">
                          Respuesta correcta
                        </dt>
                        <dd className="mt-0.5 font-medium text-emerald-800">
                          {optionText(q, q.correctAnswer) ?? q.correctAnswer}
                        </dd>
                      </div>
                    )}
                  </dl>

                  <p className="bg-indigo-50/60 mt-3 p-3 border-indigo-400 border-l-4 rounded-lg text-slate-700 text-sm leading-relaxed">
                    <span className="font-semibold text-indigo-800">
                      Explicación:{" "}
                    </span>
                    {q.explanation}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

/* =========================================================================
 * APP PRINCIPAL (enrutado simple por estado)
 * ========================================================================= */

type Route =
  | { view: "dashboard" }
  | { view: "exam"; examId: string }
  | { view: "results"; examId: string };

const PharmacologyQuizApp: React.FC = () => {
  const [state, setState] = useState<AppState>(() => loadState());
  const [route, setRoute] = useState<Route>({ view: "dashboard" });

  // Persistir cada cambio de estado
  useEffect(() => {
    saveState(state);
  }, [state]);

  const examsById = useMemo(
    () => new Map(EXAMS_DATA.map((e) => [e.id, e])),
    [],
  );

  const updateProgress = useCallback(
    (examId: string, updater: (prev: ExamProgress) => ExamProgress) => {
      const exam = examsById.get(examId);
      if (!exam) return;
      setState((prev) => ({
        ...prev,
        [examId]: updater(prev[examId] ?? emptyProgress(exam.questions.length)),
      }));
    },
    [examsById],
  );

  const handleStart = useCallback(
    (examId: string) => {
      const exam = examsById.get(examId);
      if (!exam) return;
      // Asegura que exista progreso (inicia "en progreso" al entrar)
      setState((prev) => ({
        ...prev,
        [examId]: prev[examId] ?? emptyProgress(exam.questions.length),
      }));
      setRoute({ view: "exam", examId });
      window.scrollTo({ top: 0 });
    },
    [examsById],
  );

  const handleRetake = useCallback(
    (examId: string) => {
      const exam = examsById.get(examId);
      if (!exam) return;
      setState((prev) => ({
        ...prev,
        [examId]: emptyProgress(exam.questions.length),
      }));
      setRoute({ view: "exam", examId });
      window.scrollTo({ top: 0 });
    },
    [examsById],
  );

  const handleReview = useCallback((examId: string) => {
    setRoute({ view: "results", examId });
    window.scrollTo({ top: 0 });
  }, []);

  const handleAnswer = useCallback(
    (examId: string, questionId: number, optionId: string) => {
      updateProgress(examId, (p) => ({
        ...p,
        answers: { ...p.answers, [questionId]: optionId },
      }));
    },
    [updateProgress],
  );

  const handleNavigate = useCallback(
    (examId: string, index: number) => {
      const exam = examsById.get(examId);
      if (!exam) return;
      const clamped = Math.min(Math.max(index, 0), exam.questions.length - 1);
      updateProgress(examId, (p) => ({ ...p, currentIndex: clamped }));
    },
    [examsById, updateProgress],
  );

  const handleFinish = useCallback(
    (examId: string) => {
      const exam = examsById.get(examId);
      if (!exam) return;
      updateProgress(examId, (p) => ({
        ...p,
        completed: true,
        score: computeScore(exam, p.answers),
        total: exam.questions.length,
        completedAt: new Date().toISOString(),
      }));
      setRoute({ view: "results", examId });
      window.scrollTo({ top: 0 });
    },
    [examsById, updateProgress],
  );

  const goDashboard = useCallback(() => {
    setRoute({ view: "dashboard" });
    window.scrollTo({ top: 0 });
  }, []);

  let content: React.ReactNode;

  if (route.view === "exam") {
    const exam = examsById.get(route.examId);
    const progress = exam
      ? state[exam.id] ?? emptyProgress(exam.questions.length)
      : null;
    if (!exam || !progress) {
      content = null;
    } else if (progress.completed) {
      // Un examen completado no se edita: se revisa o se repite
      content = (
        <ResultsView
          exam={exam}
          progress={progress}
          onRetake={() => handleRetake(exam.id)}
          onExit={goDashboard}
        />
      );
    } else {
      content = (
        <ExamView
          exam={exam}
          progress={progress}
          onAnswer={(qId, optId) => handleAnswer(exam.id, qId, optId)}
          onNavigate={(i) => handleNavigate(exam.id, i)}
          onFinish={() => handleFinish(exam.id)}
          onExit={goDashboard}
        />
      );
    }
  } else if (route.view === "results") {
    const exam = examsById.get(route.examId);
    const progress = exam ? state[exam.id] : undefined;
    content =
      exam && progress ? (
        <ResultsView
          exam={exam}
          progress={progress}
          onRetake={() => handleRetake(exam.id)}
          onExit={goDashboard}
        />
      ) : null;
  } else {
    content = (
      <Dashboard
        exams={EXAMS_DATA}
        state={state}
        onStart={handleStart}
        onReview={handleReview}
        onRetake={handleRetake}
      />
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-900 antialiased">
      {content ?? (
        <div className="mx-auto px-4 py-20 max-w-md text-center">
          <p className="text-slate-600">Examen no encontrado.</p>
          <button
            type="button"
            onClick={goDashboard}
            className="bg-indigo-600 mt-4 px-4 py-2 rounded-lg font-semibold text-white text-sm"
          >
            Volver al listado
          </button>
        </div>
      )}
    </div>
  );
};

export default PharmacologyQuizApp;
