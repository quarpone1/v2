export type RiskFactorEntry = {
  rank: number;
  rawName: string;
  displayName: string;
  importance: number;
  aggregation: string;
  formKey?: string;
};

export const C34_MAX_IMPORTANCE = 467;
export const C18C20_MAX_IMPORTANCE = 673;

export const c34Factors: RiskFactorEntry[] = [
  {
    rank: 1,
    rawName: "Возраст",
    displayName: "Возраст",
    importance: 467,
    aggregation: "Медиана",
    formKey: "age",
  },
  {
    rank: 2,
    rawName: "Прием врача-терапевта участкового_len",
    displayName: "Визиты к участковому терапевту",
    importance: 238,
    aggregation: "Количество посещений",
    formKey: "therapistVisits",
  },
  {
    rank: 3,
    rawName: "Прием врача-хирурга_len",
    displayName: "Визиты к хирургу",
    importance: 107,
    aggregation: "Количество посещений",
    formKey: "surgeonVisits",
  },
  {
    rank: 4,
    rawName: "Витальные параметры: частота дыхания_median",
    displayName: "Частота дыхания (медиана)",
    importance: 104,
    aggregation: "Медиана",
    formKey: "respirationRate",
  },
  {
    rank: 5,
    rawName: "Витальные параметры: частота пульса_median",
    displayName: "Частота пульса (медиана)",
    importance: 91,
    aggregation: "Медиана",
    formKey: "pulse",
  },
  {
    rank: 6,
    rawName: "Прием врача-эндокринолога_len",
    displayName: "Визиты к эндокринологу",
    importance: 73,
    aggregation: "Количество посещений",
    formKey: "endocrinologistVisits",
  },
  {
    rank: 7,
    rawName: "Давление диастолическое_median",
    displayName: "Диастолическое давление (медиана)",
    importance: 73,
    aggregation: "Медиана",
    formKey: "diastolicBp",
  },
  {
    rank: 8,
    rawName: "Прием врача-невролога_len",
    displayName: "Визиты к неврологу",
    importance: 70,
    aggregation: "Количество посещений",
    formKey: "neurologistVisits",
  },
  {
    rank: 9,
    rawName: "Биохимическое исследование крови: глюкоза_median",
    displayName: "Глюкоза крови (медиана)",
    importance: 68,
    aggregation: "Медиана",
    formKey: "glucose",
  },
  {
    rank: 10,
    rawName: "Прием врача-офтальмолога_len",
    displayName: "Визиты к офтальмологу",
    importance: 68,
    aggregation: "Количество посещений",
  },
  {
    rank: 11,
    rawName: "Пол",
    displayName: "Пол",
    importance: 66,
    aggregation: "Первое известное значение",
    formKey: "sex",
  },
  {
    rank: 37,
    rawName: "Анкетирование: Курение одной и более сигарет в день_max",
    displayName: "Курение (≥1 сигареты в день)",
    importance: 27,
    aggregation: "Максимальное значение",
    formKey: "smoking",
  },
];

export const c18c20Factors: RiskFactorEntry[] = [
  {
    rank: 1,
    rawName: "Возраст",
    displayName: "Возраст",
    importance: 673,
    aggregation: "Медиана",
    formKey: "age",
  },
  {
    rank: 2,
    rawName: "Пол",
    displayName: "Пол",
    importance: 83,
    aggregation: "Первое известное значение",
    formKey: "sex",
  },
  {
    rank: 3,
    rawName: "Прием врача-травматолога-ортопеда_len",
    displayName: "Визиты к травматологу-ортопеду",
    importance: 66,
    aggregation: "Количество посещений",
  },
  {
    rank: 4,
    rawName: "Прием врача-терапевта участкового_len",
    displayName: "Визиты к участковому терапевту",
    importance: 64,
    aggregation: "Количество посещений",
    formKey: "therapistVisits",
  },
  {
    rank: 5,
    rawName: "Прием врача-офтальмолога_len",
    displayName: "Визиты к офтальмологу",
    importance: 62,
    aggregation: "Количество посещений",
  },
  {
    rank: 6,
    rawName: "Прием врача-невролога_len",
    displayName: "Визиты к неврологу",
    importance: 60,
    aggregation: "Количество посещений",
    formKey: "neurologistVisits",
  },
  {
    rank: 7,
    rawName: "Витальные параметры: частота дыхания_iqr",
    displayName: "Частота дыхания (вариабельность)",
    importance: 57,
    aggregation: "Межквартильный размах",
    formKey: "respirationRate",
  },
  {
    rank: 8,
    rawName: "Осмотр фельдшером скорой медицинской помощи_len",
    displayName: "Вызовы скорой помощи",
    importance: 56,
    aggregation: "Количество посещений",
  },
  {
    rank: 9,
    rawName: "Прием врача-терапевта_len",
    displayName: "Визиты к терапевту",
    importance: 55,
    aggregation: "Количество посещений",
  },
  {
    rank: 10,
    rawName: "Исследование: Флюорография_len",
    displayName: "Флюорография (количество)",
    importance: 54,
    aggregation: "Количество посещений",
    formKey: "fluorographyCount",
  },
  {
    rank: 23,
    rawName: "Анкетирование: Препараты для снижения давления?_maximum",
    displayName: "Препараты от давления",
    importance: 36,
    aggregation: "Максимальное значение",
    formKey: "antihypertensiveMeds",
  },
];

export function getFormValueLabel(formKey: string, value: string): string {
  if (!value) return "—";
  if (formKey === "sex") return value === "муж" ? "Мужской" : "Женский";
  if (formKey === "smoking" || formKey === "antihypertensiveMeds") return value === "да" ? "Да" : "Нет";
  if (formKey === "therapistVisits" || formKey === "surgeonVisits" || formKey === "endocrinologistVisits" ||
      formKey === "neurologistVisits" || formKey === "fluorographyCount") return `${value} посещений`;
  if (formKey === "age") return `${value} лет`;
  if (formKey === "respirationRate") return `${value} дыхания/мин`;
  if (formKey === "pulse") return `${value} уд/мин`;
  if (formKey === "diastolicBp") return `${value} мм рт. ст.`;
  if (formKey === "glucose") return `${value} ммоль/л`;
  return value;
}
