export type PatientPrognosisInput = {
  sex?: "муж" | "жен";
  heightCm?: number;
  weightKg?: number;

  stage?: string;
  pT?: string;
  pN?: string;
  pM?: string;
  gradeG?: string;
  lymphovascularInvasion?: string;
  perineuralInvasion?: string;
  nodesExamined?: number;
  nodesAffected?: number;

  nras?: string;
  braf?: string;
  kras?: string;

  operation?: string;
  surgicalAccess?: string;
  adjuvantTherapy?: string;
  adjuvantScheme?: string;
  adjuvantCourses?: number;
  radiotherapy?: string;
  therapySite?: string;

  cea?: number;
  lymphocytesAbs?: number;
  leukocytes?: number;
  hemoglobin?: number;
  platelets?: number;
  ast?: number;
  bilirubin?: number;

  albumin?: number;
  neutrophilsAbs?: number;
  alkalinePhosphatase?: number;
  fibrinogen?: number;
  inr?: number;
  diabetes?: string;
  comorbidities?: string;
};

export type PatientRecord = {
  id: string;
  name: string;
  age: number;
  gender: string;
  diagnosis: string;
  stage: string;
  riskScore: number;
  riskLevel: string;
  lastVisit: string;
  status: string;
  prognosis?: PatientPrognosisInput;
};

export const patientsData: PatientRecord[] = [
  {
    id: "83492017",
    name: "83492017",
    age: 58,
    gender: "Мужской",
    diagnosis: "Колоректальный рак",
    stage: "II",
    riskScore: 24,
    riskLevel: "Низкий",
    lastVisit: "2026-03-20",
    status: "Ремиссия",
    prognosis: {
      sex: "муж",
      heightCm: 172,
      weightKg: 78,
      stage: "II",
      pT: "T3",
      pN: "N0",
      pM: "M0",
      gradeG: "G2",
      lymphovascularInvasion: "L0",
      perineuralInvasion: "нет",
      nodesExamined: 14,
      nodesAffected: 0,
      kras: "не мутирован",
      nras: "не мутирован",
      braf: "не мутирован",
      operation: "Лапароскопическая резекция сигмовидной кишки",
      surgicalAccess: "Лапароскопический доступ",
      adjuvantTherapy: "нет",
      radiotherapy: "нет",
      therapySite: "Онкодиспансер (стационар)",
      cea: 3.4,
      hemoglobin: 132,
      leukocytes: 6.2,
      lymphocytesAbs: 1.7,
      platelets: 245,
      ast: 22,
      bilirubin: 11,
      albumin: 42,
      diabetes: "нет",
      comorbidities: "АГ I ст.",
    },
  },
  {
    id: "50716384",
    name: "50716384",
    age: 64,
    gender: "Женский",
    diagnosis: "Колоректальный рак",
    stage: "III",
    riskScore: 68,
    riskLevel: "Высокий",
    lastVisit: "2026-03-22",
    status: "Лечение",
    prognosis: {
      sex: "жен",
      heightCm: 166,
      weightKg: 74,
      stage: "III",
      pT: "T3",
      pN: "N1",
      pM: "M0",
      gradeG: "G2",
      lymphovascularInvasion: "L1",
      perineuralInvasion: "есть",
      nodesExamined: 12,
      nodesAffected: 3,
      kras: "мутирован",
      nras: "не мутирован",
      braf: "не мутирован",
      operation: "Передняя резекция прямой кишки",
      surgicalAccess: "Открытый доступ",
      adjuvantTherapy: "да",
      adjuvantScheme: "XELOX",
      adjuvantCourses: 6,
      radiotherapy: "да",
      therapySite: "НМИЦ им. Н.Н. Блохина (стационар)",
      cea: 18.2,
      hemoglobin: 118,
      leukocytes: 6.8,
      lymphocytesAbs: 1.2,
      platelets: 240,
      ast: 32,
      bilirubin: 14,
      albumin: 36,
      diabetes: "нет",
      comorbidities: "ИБС, ХСН I ФК",
    },
  },
  {
    id: "21947560",
    name: "21947560",
    age: 45,
    gender: "Мужской",
    diagnosis: "Колоректальный рак",
    stage: "I",
    riskScore: 12,
    riskLevel: "Низкий",
    lastVisit: "2026-03-25",
    status: "Наблюдение",
    prognosis: {
      sex: "муж",
      heightCm: 178,
      weightKg: 82,
      stage: "I",
      pT: "T1",
      pN: "N0",
      pM: "M0",
      gradeG: "G1",
      lymphovascularInvasion: "L0",
      perineuralInvasion: "нет",
      nodesExamined: 10,
      nodesAffected: 0,
      kras: "не мутирован",
      nras: "не мутирован",
      braf: "не мутирован",
      operation: "Эндоскопическая резекция",
      surgicalAccess: "Эндоскопический доступ",
      adjuvantTherapy: "нет",
      radiotherapy: "нет",
      therapySite: "Онкодиспансер (амбулаторно)",
      cea: 2.1,
      hemoglobin: 140,
      leukocytes: 5.9,
      lymphocytesAbs: 2.0,
      platelets: 230,
      ast: 20,
      bilirubin: 10,
      albumin: 44,
      diabetes: "нет",
      comorbidities: "",
    },
  },
  {
    id: "68120493",
    name: "68120493",
    age: 72,
    gender: "Женский",
    diagnosis: "Колоректальный рак",
    stage: "II",
    riskScore: 45,
    riskLevel: "Средний",
    lastVisit: "2026-03-18",
    status: "Лечение",
  },
  {
    id: "94638125",
    name: "94638125",
    age: 52,
    gender: "Мужской",
    diagnosis: "Колоректальный рак",
    stage: "IV",
    riskScore: 89,
    riskLevel: "Высокий",
    lastVisit: "2026-03-27",
    status: "Паллиатив",
  },
  {
    id: "37059248",
    name: "37059248",
    age: 39,
    gender: "Женский",
    diagnosis: "Колоректальный рак",
    stage: "I",
    riskScore: 8,
    riskLevel: "Низкий",
    lastVisit: "2026-03-10",
    status: "Ремиссия",
  },
];

export const survivalData = [
  { year: 1, survival: 98, risk: 2 },
  { year: 2, survival: 94, risk: 6 },
  { year: 3, survival: 88, risk: 12 },
  { year: 4, survival: 82, risk: 18 },
  { year: 5, survival: 75, risk: 25 },
];

export const riskDistributionData = [
  { name: "Низкий (< 25%)", value: 45, fill: "#10b981" },
  { name: "Средний (25-50%)", value: 30, fill: "#f59e0b" },
  { name: "Высокий (> 50%)", value: 25, fill: "#ef4444" },
];

export const earlyDetectionRiskDistributionData = [
  { name: "Низкий (< 20%)", value: 52, fill: "#10b981" },
  { name: "Средний (20-40%)", value: 31, fill: "#f59e0b" },
  { name: "Высокий (> 40%)", value: 17, fill: "#ef4444" },
];

export const earlyDetectionAgeData = [
  { range: "30-40", пациентов: 38 },
  { range: "41-50", пациентов: 72 },
  { range: "51-60", пациентов: 118 },
  { range: "61-70", пациентов: 95 },
  { range: "71-80", пациентов: 44 },
  { range: "81+", пациентов: 12 },
];

export type EarlyDetectionPatient = {
  id: string;
  age: number;
  gender: string;
  riskLevel: "Низкий" | "Средний" | "Высокий";
  completionPercent: number;
  lastCalculated: string;
};

export const earlyDetectionPatientsData: EarlyDetectionPatient[] = [
  { id: "ED-10012", age: 52, gender: "Женский", riskLevel: "Низкий", completionPercent: 90, lastCalculated: "2026-05-14" },
  { id: "ED-10031", age: 44, gender: "Мужской", riskLevel: "Низкий", completionPercent: 85, lastCalculated: "2026-05-20" },
  { id: "ED-10047", age: 61, gender: "Женский", riskLevel: "Низкий", completionPercent: 95, lastCalculated: "2026-04-30" },
  { id: "ED-10058", age: 67, gender: "Мужской", riskLevel: "Средний", completionPercent: 80, lastCalculated: "2026-05-18" },
  { id: "ED-10063", age: 59, gender: "Женский", riskLevel: "Средний", completionPercent: 75, lastCalculated: "2026-05-22" },
  { id: "ED-10074", age: 71, gender: "Мужской", riskLevel: "Средний", completionPercent: 88, lastCalculated: "2026-04-25" },
  { id: "ED-10082", age: 65, gender: "Мужской", riskLevel: "Высокий", completionPercent: 95, lastCalculated: "2026-05-21" },
  { id: "ED-10091", age: 73, gender: "Женский", riskLevel: "Высокий", completionPercent: 92, lastCalculated: "2026-05-19" },
  { id: "ED-10105", age: 68, gender: "Мужской", riskLevel: "Высокий", completionPercent: 78, lastCalculated: "2026-05-10" },
];
