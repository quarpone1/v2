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
    riskScore: 28,
    riskLevel: "Средний",
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
      operation: "Сигморезекция",
      surgicalAccess: "Лапароскопический доступ",
      adjuvantTherapy: "нет",
      adjuvantCourses: 0,
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
    riskScore: 40,
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
      operation: "Низкая передняя резекция прямой кишки",
      surgicalAccess: "Лапаротомный доступ",
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
    riskScore: 20,
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
      operation: "Дистальная / сегментарная резекция толстой кишки",
      surgicalAccess: "Лапароскопический доступ",
      adjuvantTherapy: "нет",
      adjuvantCourses: 0,
      radiotherapy: "нет",
      therapySite: "Онкодиспансер (стационар)",
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
    riskScore: 33,
    riskLevel: "Средний",
    lastVisit: "2026-03-18",
    status: "Лечение",
    prognosis: {
      sex: "жен",
      heightCm: 160,
      weightKg: 68,
      stage: "II",
      pT: "T3",
      pN: "N0",
      pM: "M0",
      gradeG: "G2",
      lymphovascularInvasion: "L0",
      perineuralInvasion: "нет",
      nodesExamined: 15,
      nodesAffected: 0,
      kras: "не мутирован",
      nras: "не мутирован",
      braf: "не мутирован",
      operation: "Гемиколэктомия справа",
      surgicalAccess: "Лапароскопический доступ",
      adjuvantTherapy: "да",
      adjuvantScheme: "XELOX",
      adjuvantCourses: 6,
      radiotherapy: "нет",
      therapySite: "Онкодиспансер (стационар)",
      cea: 6.5,
      hemoglobin: 112,
      leukocytes: 7.1,
      lymphocytesAbs: 1.4,
      platelets: 268,
      ast: 28,
      bilirubin: 13,
      albumin: 38,
      diabetes: "нет",
      comorbidities: "АГ II ст., Гипотиреоз",
    },
  },
  {
    id: "94638125",
    name: "94638125",
    age: 52,
    gender: "Мужской",
    diagnosis: "Колоректальный рак",
    stage: "IV",
    riskScore: 61,
    riskLevel: "Высокий",
    lastVisit: "2026-03-27",
    status: "Паллиатив",
    prognosis: {
      sex: "муж",
      heightCm: 174,
      weightKg: 81,
      stage: "IV",
      pT: "T4",
      pN: "N2",
      pM: "M1",
      gradeG: "G3",
      lymphovascularInvasion: "L1",
      perineuralInvasion: "есть",
      nodesExamined: 18,
      nodesAffected: 7,
      kras: "мутирован",
      nras: "не мутирован",
      braf: "не мутирован",
      operation: "Метастазэктомия печени (одномоментно с резекцией первичной опухоли)",
      surgicalAccess: "Лапаротомный доступ",
      adjuvantTherapy: "да",
      adjuvantScheme: "FOLFOX",
      adjuvantCourses: 8,
      radiotherapy: "нет",
      therapySite: "НМИЦ им. Н.Н. Блохина (стационар)",
      cea: 80.0,
      hemoglobin: 104,
      leukocytes: 8.4,
      lymphocytesAbs: 0.9,
      platelets: 312,
      ast: 45,
      bilirubin: 18,
      albumin: 32,
      diabetes: "нет",
      comorbidities: "",
    },
  },
  {
    id: "37059248",
    name: "37059248",
    age: 39,
    gender: "Женский",
    diagnosis: "Колоректальный рак",
    stage: "I",
    riskScore: 18,
    riskLevel: "Низкий",
    lastVisit: "2026-03-10",
    status: "Ремиссия",
    prognosis: {
      sex: "жен",
      heightCm: 165,
      weightKg: 61,
      stage: "I",
      pT: "T1",
      pN: "N0",
      pM: "M0",
      gradeG: "G1",
      lymphovascularInvasion: "L0",
      perineuralInvasion: "нет",
      nodesExamined: 11,
      nodesAffected: 0,
      kras: "не мутирован",
      nras: "не мутирован",
      braf: "не мутирован",
      operation: "Дистальная / сегментарная резекция толстой кишки",
      surgicalAccess: "Лапароскопический доступ",
      adjuvantTherapy: "нет",
      adjuvantCourses: 0,
      radiotherapy: "нет",
      therapySite: "Онкодиспансер (стационар)",
      cea: 1.8,
      hemoglobin: 138,
      leukocytes: 5.4,
      lymphocytesAbs: 2.1,
      platelets: 218,
      ast: 16,
      bilirubin: 9,
      albumin: 46,
      diabetes: "нет",
      comorbidities: "",
    },
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
  { name: "Низкий (< 20%)", value: 23, fill: "#10b981" },
  { name: "Средний (20-40%)", value: 43, fill: "#f59e0b" },
  { name: "Высокий (> 40%)", value: 33, fill: "#ef4444" },
];

export const earlyDetectionAgeData = [
  { range: "30-40", пациентов: 38 },
  { range: "41-50", пациентов: 72 },
  { range: "51-60", пациентов: 118 },
  { range: "61-70", пациентов: 95 },
  { range: "71-80", пациентов: 44 },
  { range: "81+", пациентов: 12 },
];

export type EarlyDetectionSnapshot = {
  smoking: string; hypertension: string; diabetes: string;
  antihypertensiveMeds: string; systolicBp: string; diastolicBp: string;
  pulse: string; respirationRate: string; glucose: string;
  wbc: string; hgb: string; therapistVisits: string;
  endocrinologistVisits: string; neurologistVisits: string;
  surgeonVisits: string; fluorographyCount: string; colonoscopy: string;
};

export type EarlyDetectionPatientFull = {
  id: string;
  age: number;
  gender: "Мужской" | "Женский";
  riskLevel: "Низкий" | "Средний" | "Высокий";
  riskLevelC34: "Низкий" | "Средний" | "Высокий";
  riskLevelC18C20: "Низкий" | "Средний" | "Высокий";
  completionPercent: number;
  lastCalculated: string;
  eventualDiagnosis: "C34" | "C18-C20";
  risks: { 1: number; 2: number; 3: number };
  snapshot: EarlyDetectionSnapshot;
};

export const earlyDetectionPatientsFull: EarlyDetectionPatientFull[] = [
  // ── Высокий риск, C34 (8 пациентов) ──────────────────────────────
  {
    id: "ED-10001", age: 71, gender: "Мужской",
    riskLevel: "Высокий", riskLevelC34: "Высокий", riskLevelC18C20: "Средний",
    completionPercent: 92, lastCalculated: "2026-05-28", eventualDiagnosis: "C34",
    risks: { 1: 68, 2: 35, 3: 43 },
    snapshot: { smoking: "да", hypertension: "да", diabetes: "нет", antihypertensiveMeds: "да",
      systolicBp: "158", diastolicBp: "94", pulse: "82", respirationRate: "23",
      glucose: "6.1", wbc: "9.2", hgb: "138", therapistVisits: "15",
      endocrinologistVisits: "0", neurologistVisits: "2", surgeonVisits: "3",
      fluorographyCount: "0", colonoscopy: "нет" },
  },
  {
    id: "ED-10002", age: 66, gender: "Мужской",
    riskLevel: "Высокий", riskLevelC34: "Высокий", riskLevelC18C20: "Средний",
    completionPercent: 88, lastCalculated: "2026-05-25", eventualDiagnosis: "C34",
    risks: { 1: 64, 2: 33, 3: 40 },
    snapshot: { smoking: "да", hypertension: "да", diabetes: "нет", antihypertensiveMeds: "да",
      systolicBp: "152", diastolicBp: "96", pulse: "79", respirationRate: "22",
      glucose: "6.4", wbc: "8.6", hgb: "141", therapistVisits: "13",
      endocrinologistVisits: "2", neurologistVisits: "1", surgeonVisits: "0",
      fluorographyCount: "0", colonoscopy: "нет" },
  },
  {
    id: "ED-10003", age: 68, gender: "Мужской",
    riskLevel: "Высокий", riskLevelC34: "Высокий", riskLevelC18C20: "Низкий",
    completionPercent: 85, lastCalculated: "2026-05-20", eventualDiagnosis: "C34",
    risks: { 1: 60, 2: 31, 3: 38 },
    snapshot: { smoking: "да", hypertension: "нет", diabetes: "нет", antihypertensiveMeds: "нет",
      systolicBp: "135", diastolicBp: "85", pulse: "84", respirationRate: "24",
      glucose: "5.8", wbc: "9.4", hgb: "133", therapistVisits: "12",
      endocrinologistVisits: "1", neurologistVisits: "0", surgeonVisits: "1",
      fluorographyCount: "0", colonoscopy: "нет" },
  },
  {
    id: "ED-10004", age: 73, gender: "Женский",
    riskLevel: "Высокий", riskLevelC34: "Высокий", riskLevelC18C20: "Средний",
    completionPercent: 91, lastCalculated: "2026-05-19", eventualDiagnosis: "C34",
    risks: { 1: 68, 2: 35, 3: 42 },
    snapshot: { smoking: "да", hypertension: "да", diabetes: "нет", antihypertensiveMeds: "да",
      systolicBp: "162", diastolicBp: "98", pulse: "76", respirationRate: "22",
      glucose: "6.2", wbc: "7.2", hgb: "115", therapistVisits: "14",
      endocrinologistVisits: "1", neurologistVisits: "3", surgeonVisits: "0",
      fluorographyCount: "0", colonoscopy: "нет" },
  },
  {
    id: "ED-10005", age: 70, gender: "Мужской",
    riskLevel: "Высокий", riskLevelC34: "Высокий", riskLevelC18C20: "Средний",
    completionPercent: 87, lastCalculated: "2026-05-22", eventualDiagnosis: "C34",
    risks: { 1: 63, 2: 32, 3: 39 },
    snapshot: { smoking: "нет", hypertension: "да", diabetes: "нет", antihypertensiveMeds: "да",
      systolicBp: "155", diastolicBp: "94", pulse: "80", respirationRate: "22",
      glucose: "6.8", wbc: "9.8", hgb: "127", therapistVisits: "16",
      endocrinologistVisits: "3", neurologistVisits: "0", surgeonVisits: "0",
      fluorographyCount: "0", colonoscopy: "нет" },
  },
  {
    id: "ED-10006", age: 62, gender: "Мужской",
    riskLevel: "Высокий", riskLevelC34: "Высокий", riskLevelC18C20: "Высокий",
    completionPercent: 94, lastCalculated: "2026-05-21", eventualDiagnosis: "C34",
    risks: { 1: 68, 2: 33, 3: 42 },
    snapshot: { smoking: "да", hypertension: "да", diabetes: "да", antihypertensiveMeds: "да",
      systolicBp: "147", diastolicBp: "91", pulse: "82", respirationRate: "21",
      glucose: "7.2", wbc: "8.9", hgb: "130", therapistVisits: "12",
      endocrinologistVisits: "4", neurologistVisits: "0", surgeonVisits: "0",
      fluorographyCount: "0", colonoscopy: "нет" },
  },
  {
    id: "ED-10007", age: 74, gender: "Мужской",
    riskLevel: "Высокий", riskLevelC34: "Высокий", riskLevelC18C20: "Средний",
    completionPercent: 90, lastCalculated: "2026-05-18", eventualDiagnosis: "C34",
    risks: { 1: 76, 2: 38, 3: 47 },
    snapshot: { smoking: "да", hypertension: "да", diabetes: "нет", antihypertensiveMeds: "да",
      systolicBp: "165", diastolicBp: "100", pulse: "86", respirationRate: "23",
      glucose: "6.0", wbc: "8.1", hgb: "140", therapistVisits: "18",
      endocrinologistVisits: "0", neurologistVisits: "4", surgeonVisits: "2",
      fluorographyCount: "0", colonoscopy: "нет" },
  },
  {
    id: "ED-10008", age: 65, gender: "Женский",
    riskLevel: "Высокий", riskLevelC34: "Высокий", riskLevelC18C20: "Средний",
    completionPercent: 86, lastCalculated: "2026-05-15", eventualDiagnosis: "C34",
    risks: { 1: 62, 2: 32, 3: 39 },
    snapshot: { smoking: "да", hypertension: "да", diabetes: "нет", antihypertensiveMeds: "да",
      systolicBp: "150", diastolicBp: "92", pulse: "78", respirationRate: "22",
      glucose: "6.3", wbc: "9.0", hgb: "118", therapistVisits: "11",
      endocrinologistVisits: "2", neurologistVisits: "0", surgeonVisits: "0",
      fluorographyCount: "0", colonoscopy: "нет" },
  },
  // ── Высокий риск, C18-C20 (2 пациента) ──────────────────────────
  {
    id: "ED-10009", age: 66, gender: "Мужской",
    riskLevel: "Высокий", riskLevelC34: "Средний", riskLevelC18C20: "Высокий",
    completionPercent: 89, lastCalculated: "2026-05-23", eventualDiagnosis: "C18-C20",
    risks: { 1: 60, 2: 31, 3: 35 },
    snapshot: { smoking: "нет", hypertension: "да", diabetes: "да", antihypertensiveMeds: "да",
      systolicBp: "148", diastolicBp: "94", pulse: "80", respirationRate: "20",
      glucose: "8.6", wbc: "10.2", hgb: "124", therapistVisits: "10",
      endocrinologistVisits: "5", neurologistVisits: "4", surgeonVisits: "0",
      fluorographyCount: "1", colonoscopy: "нет" },
  },
  {
    id: "ED-10010", age: 69, gender: "Женский",
    riskLevel: "Высокий", riskLevelC34: "Средний", riskLevelC18C20: "Высокий",
    completionPercent: 83, lastCalculated: "2026-05-17", eventualDiagnosis: "C18-C20",
    risks: { 1: 68, 2: 35, 3: 39 },
    snapshot: { smoking: "нет", hypertension: "да", diabetes: "да", antihypertensiveMeds: "да",
      systolicBp: "154", diastolicBp: "96", pulse: "74", respirationRate: "21",
      glucose: "9.4", wbc: "9.8", hgb: "120", therapistVisits: "8",
      endocrinologistVisits: "6", neurologistVisits: "3", surgeonVisits: "0",
      fluorographyCount: "0", colonoscopy: "нет" },
  },
  // ── Средний риск, C34 (9 пациентов) ─────────────────────────────
  {
    id: "ED-10011", age: 57, gender: "Мужской",
    riskLevel: "Средний", riskLevelC34: "Средний", riskLevelC18C20: "Низкий",
    completionPercent: 78, lastCalculated: "2026-05-14", eventualDiagnosis: "C34",
    risks: { 1: 32, 2: 15, 3: 22 },
    snapshot: { smoking: "да", hypertension: "нет", diabetes: "нет", antihypertensiveMeds: "нет",
      systolicBp: "128", diastolicBp: "80", pulse: "76", respirationRate: "18",
      glucose: "5.6", wbc: "7.2", hgb: "148", therapistVisits: "4",
      endocrinologistVisits: "0", neurologistVisits: "0", surgeonVisits: "0",
      fluorographyCount: "0", colonoscopy: "нет" },
  },
  {
    id: "ED-10012", age: 61, gender: "Мужской",
    riskLevel: "Средний", riskLevelC34: "Средний", riskLevelC18C20: "Низкий",
    completionPercent: 82, lastCalculated: "2026-05-10", eventualDiagnosis: "C34",
    risks: { 1: 38, 2: 18, 3: 22 },
    snapshot: { smoking: "нет", hypertension: "нет", diabetes: "нет", antihypertensiveMeds: "нет",
      systolicBp: "135", diastolicBp: "84", pulse: "72", respirationRate: "20",
      glucose: "6.2", wbc: "8.2", hgb: "140", therapistVisits: "7",
      endocrinologistVisits: "1", neurologistVisits: "1", surgeonVisits: "0",
      fluorographyCount: "0", colonoscopy: "нет" },
  },
  {
    id: "ED-10013", age: 59, gender: "Женский",
    riskLevel: "Средний", riskLevelC34: "Средний", riskLevelC18C20: "Низкий",
    completionPercent: 75, lastCalculated: "2026-05-08", eventualDiagnosis: "C34",
    risks: { 1: 25, 2: 12, 3: 17 },
    snapshot: { smoking: "нет", hypertension: "нет", diabetes: "нет", antihypertensiveMeds: "нет",
      systolicBp: "122", diastolicBp: "76", pulse: "70", respirationRate: "18",
      glucose: "5.9", wbc: "6.8", hgb: "132", therapistVisits: "5",
      endocrinologistVisits: "1", neurologistVisits: "0", surgeonVisits: "0",
      fluorographyCount: "0", colonoscopy: "нет" },
  },
  {
    id: "ED-10014", age: 64, gender: "Мужской",
    riskLevel: "Средний", riskLevelC34: "Средний", riskLevelC18C20: "Низкий",
    completionPercent: 80, lastCalculated: "2026-05-06", eventualDiagnosis: "C34",
    risks: { 1: 33, 2: 16, 3: 19 },
    snapshot: { smoking: "нет", hypertension: "нет", diabetes: "нет", antihypertensiveMeds: "нет",
      systolicBp: "134", diastolicBp: "84", pulse: "74", respirationRate: "19",
      glucose: "6.0", wbc: "7.8", hgb: "142", therapistVisits: "6",
      endocrinologistVisits: "1", neurologistVisits: "0", surgeonVisits: "2",
      fluorographyCount: "0", colonoscopy: "нет" },
  },
  {
    id: "ED-10015", age: 60, gender: "Мужской",
    riskLevel: "Средний", riskLevelC34: "Средний", riskLevelC18C20: "Низкий",
    completionPercent: 77, lastCalculated: "2026-05-04", eventualDiagnosis: "C34",
    risks: { 1: 33, 2: 16, 3: 22 },
    snapshot: { smoking: "да", hypertension: "нет", diabetes: "нет", antihypertensiveMeds: "нет",
      systolicBp: "130", diastolicBp: "82", pulse: "78", respirationRate: "18",
      glucose: "5.8", wbc: "7.4", hgb: "145", therapistVisits: "3",
      endocrinologistVisits: "0", neurologistVisits: "0", surgeonVisits: "0",
      fluorographyCount: "0", colonoscopy: "нет" },
  },
  {
    id: "ED-10016", age: 66, gender: "Женский",
    riskLevel: "Средний", riskLevelC34: "Средний", riskLevelC18C20: "Низкий",
    completionPercent: 84, lastCalculated: "2026-04-30", eventualDiagnosis: "C34",
    risks: { 1: 37, 2: 20, 3: 22 },
    snapshot: { smoking: "нет", hypertension: "да", diabetes: "нет", antihypertensiveMeds: "да",
      systolicBp: "142", diastolicBp: "88", pulse: "72", respirationRate: "20",
      glucose: "6.1", wbc: "7.6", hgb: "128", therapistVisits: "8",
      endocrinologistVisits: "0", neurologistVisits: "2", surgeonVisits: "0",
      fluorographyCount: "1", colonoscopy: "нет" },
  },
  {
    id: "ED-10017", age: 58, gender: "Мужской",
    riskLevel: "Средний", riskLevelC34: "Средний", riskLevelC18C20: "Низкий",
    completionPercent: 79, lastCalculated: "2026-04-28", eventualDiagnosis: "C34",
    risks: { 1: 39, 2: 19, 3: 26 },
    snapshot: { smoking: "да", hypertension: "нет", diabetes: "нет", antihypertensiveMeds: "нет",
      systolicBp: "128", diastolicBp: "80", pulse: "76", respirationRate: "20",
      glucose: "5.9", wbc: "7.8", hgb: "144", therapistVisits: "5",
      endocrinologistVisits: "1", neurologistVisits: "0", surgeonVisits: "1",
      fluorographyCount: "0", colonoscopy: "нет" },
  },
  {
    id: "ED-10018", age: 62, gender: "Женский",
    riskLevel: "Средний", riskLevelC34: "Средний", riskLevelC18C20: "Низкий",
    completionPercent: 81, lastCalculated: "2026-04-25", eventualDiagnosis: "C34",
    risks: { 1: 30, 2: 14, 3: 17 },
    snapshot: { smoking: "нет", hypertension: "нет", diabetes: "нет", antihypertensiveMeds: "нет",
      systolicBp: "126", diastolicBp: "78", pulse: "68", respirationRate: "19",
      glucose: "6.4", wbc: "7.4", hgb: "134", therapistVisits: "9",
      endocrinologistVisits: "2", neurologistVisits: "1", surgeonVisits: "0",
      fluorographyCount: "1", colonoscopy: "нет" },
  },
  {
    id: "ED-10019", age: 55, gender: "Мужской",
    riskLevel: "Средний", riskLevelC34: "Средний", riskLevelC18C20: "Низкий",
    completionPercent: 73, lastCalculated: "2026-04-22", eventualDiagnosis: "C34",
    risks: { 1: 30, 2: 14, 3: 20 },
    snapshot: { smoking: "да", hypertension: "нет", diabetes: "нет", antihypertensiveMeds: "нет",
      systolicBp: "124", diastolicBp: "78", pulse: "72", respirationRate: "18",
      glucose: "5.7", wbc: "7.2", hgb: "150", therapistVisits: "3",
      endocrinologistVisits: "0", neurologistVisits: "0", surgeonVisits: "0",
      fluorographyCount: "0", colonoscopy: "нет" },
  },
  // ── Средний риск, C18-C20 (4 пациента) ──────────────────────────
  {
    id: "ED-10020", age: 64, gender: "Мужской",
    riskLevel: "Средний", riskLevelC34: "Низкий", riskLevelC18C20: "Средний",
    completionPercent: 86, lastCalculated: "2026-04-20", eventualDiagnosis: "C18-C20",
    risks: { 1: 37, 2: 18, 3: 21 },
    snapshot: { smoking: "нет", hypertension: "нет", diabetes: "да", antihypertensiveMeds: "нет",
      systolicBp: "128", diastolicBp: "80", pulse: "76", respirationRate: "18",
      glucose: "7.4", wbc: "7.8", hgb: "135", therapistVisits: "5",
      endocrinologistVisits: "3", neurologistVisits: "2", surgeonVisits: "0",
      fluorographyCount: "1", colonoscopy: "нет" },
  },
  {
    id: "ED-10021", age: 58, gender: "Женский",
    riskLevel: "Средний", riskLevelC34: "Низкий", riskLevelC18C20: "Средний",
    completionPercent: 77, lastCalculated: "2026-04-18", eventualDiagnosis: "C18-C20",
    risks: { 1: 36, 2: 17, 3: 21 },
    snapshot: { smoking: "нет", hypertension: "да", diabetes: "да", antihypertensiveMeds: "да",
      systolicBp: "138", diastolicBp: "86", pulse: "74", respirationRate: "18",
      glucose: "7.0", wbc: "7.6", hgb: "128", therapistVisits: "6",
      endocrinologistVisits: "3", neurologistVisits: "1", surgeonVisits: "0",
      fluorographyCount: "1", colonoscopy: "нет" },
  },
  {
    id: "ED-10022", age: 55, gender: "Мужской",
    riskLevel: "Средний", riskLevelC34: "Низкий", riskLevelC18C20: "Средний",
    completionPercent: 82, lastCalculated: "2026-04-15", eventualDiagnosis: "C18-C20",
    risks: { 1: 35, 2: 17, 3: 20 },
    snapshot: { smoking: "нет", hypertension: "нет", diabetes: "да", antihypertensiveMeds: "нет",
      systolicBp: "130", diastolicBp: "82", pulse: "78", respirationRate: "18",
      glucose: "7.0", wbc: "8.4", hgb: "130", therapistVisits: "7",
      endocrinologistVisits: "4", neurologistVisits: "2", surgeonVisits: "0",
      fluorographyCount: "1", colonoscopy: "нет" },
  },
  {
    id: "ED-10023", age: 60, gender: "Женский",
    riskLevel: "Средний", riskLevelC34: "Низкий", riskLevelC18C20: "Средний",
    completionPercent: 71, lastCalculated: "2026-04-12", eventualDiagnosis: "C18-C20",
    risks: { 1: 32, 2: 15, 3: 19 },
    snapshot: { smoking: "нет", hypertension: "нет", diabetes: "да", antihypertensiveMeds: "нет",
      systolicBp: "124", diastolicBp: "78", pulse: "72", respirationRate: "18",
      glucose: "7.2", wbc: "7.4", hgb: "130", therapistVisits: "5",
      endocrinologistVisits: "4", neurologistVisits: "1", surgeonVisits: "0",
      fluorographyCount: "1", colonoscopy: "нет" },
  },
  // ── Низкий риск, C34 (5 пациентов) ──────────────────────────────
  {
    id: "ED-10024", age: 55, gender: "Женский",
    riskLevel: "Низкий", riskLevelC34: "Низкий", riskLevelC18C20: "Низкий",
    completionPercent: 88, lastCalculated: "2026-04-10", eventualDiagnosis: "C34",
    risks: { 1: 15, 2: 7, 3: 9 },
    snapshot: { smoking: "нет", hypertension: "нет", diabetes: "нет", antihypertensiveMeds: "нет",
      systolicBp: "120", diastolicBp: "74", pulse: "68", respirationRate: "16",
      glucose: "5.4", wbc: "6.4", hgb: "136", therapistVisits: "2",
      endocrinologistVisits: "0", neurologistVisits: "0", surgeonVisits: "0",
      fluorographyCount: "1", colonoscopy: "нет" },
  },
  {
    id: "ED-10025", age: 57, gender: "Женский",
    riskLevel: "Низкий", riskLevelC34: "Низкий", riskLevelC18C20: "Низкий",
    completionPercent: 92, lastCalculated: "2026-04-08", eventualDiagnosis: "C34",
    risks: { 1: 16, 2: 8, 3: 9 },
    snapshot: { smoking: "нет", hypertension: "нет", diabetes: "нет", antihypertensiveMeds: "нет",
      systolicBp: "118", diastolicBp: "72", pulse: "66", respirationRate: "16",
      glucose: "5.3", wbc: "6.2", hgb: "130", therapistVisits: "2",
      endocrinologistVisits: "0", neurologistVisits: "0", surgeonVisits: "0",
      fluorographyCount: "1", colonoscopy: "нет" },
  },
  {
    id: "ED-10026", age: 56, gender: "Мужской",
    riskLevel: "Низкий", riskLevelC34: "Низкий", riskLevelC18C20: "Низкий",
    completionPercent: 85, lastCalculated: "2026-04-05", eventualDiagnosis: "C34",
    risks: { 1: 18, 2: 9, 3: 10 },
    snapshot: { smoking: "нет", hypertension: "нет", diabetes: "нет", antihypertensiveMeds: "нет",
      systolicBp: "122", diastolicBp: "76", pulse: "70", respirationRate: "16",
      glucose: "5.4", wbc: "6.8", hgb: "146", therapistVisits: "2",
      endocrinologistVisits: "0", neurologistVisits: "0", surgeonVisits: "0",
      fluorographyCount: "2", colonoscopy: "нет" },
  },
  {
    id: "ED-10027", age: 58, gender: "Женский",
    riskLevel: "Низкий", riskLevelC34: "Низкий", riskLevelC18C20: "Низкий",
    completionPercent: 90, lastCalculated: "2026-04-03", eventualDiagnosis: "C34",
    risks: { 1: 18, 2: 9, 3: 10 },
    snapshot: { smoking: "нет", hypertension: "нет", diabetes: "нет", antihypertensiveMeds: "нет",
      systolicBp: "120", diastolicBp: "74", pulse: "68", respirationRate: "16",
      glucose: "5.5", wbc: "6.6", hgb: "134", therapistVisits: "3",
      endocrinologistVisits: "0", neurologistVisits: "0", surgeonVisits: "0",
      fluorographyCount: "1", colonoscopy: "нет" },
  },
  {
    id: "ED-10028", age: 56, gender: "Женский",
    riskLevel: "Низкий", riskLevelC34: "Низкий", riskLevelC18C20: "Низкий",
    completionPercent: 87, lastCalculated: "2026-04-01", eventualDiagnosis: "C34",
    risks: { 1: 15, 2: 7, 3: 9 },
    snapshot: { smoking: "нет", hypertension: "нет", diabetes: "нет", antihypertensiveMeds: "нет",
      systolicBp: "118", diastolicBp: "72", pulse: "64", respirationRate: "16",
      glucose: "5.2", wbc: "6.0", hgb: "128", therapistVisits: "1",
      endocrinologistVisits: "0", neurologistVisits: "0", surgeonVisits: "0",
      fluorographyCount: "2", colonoscopy: "нет" },
  },
  // ── Низкий риск, C18-C20 (2 пациента) ───────────────────────────
  {
    id: "ED-10029", age: 52, gender: "Женский",
    riskLevel: "Низкий", riskLevelC34: "Низкий", riskLevelC18C20: "Низкий",
    completionPercent: 79, lastCalculated: "2026-03-28", eventualDiagnosis: "C18-C20",
    risks: { 1: 14, 2: 7, 3: 8 },
    snapshot: { smoking: "нет", hypertension: "нет", diabetes: "нет", antihypertensiveMeds: "нет",
      systolicBp: "116", diastolicBp: "72", pulse: "66", respirationRate: "16",
      glucose: "5.6", wbc: "6.2", hgb: "132", therapistVisits: "2",
      endocrinologistVisits: "1", neurologistVisits: "0", surgeonVisits: "0",
      fluorographyCount: "1", colonoscopy: "нет" },
  },
  {
    id: "ED-10030", age: 48, gender: "Женский",
    riskLevel: "Низкий", riskLevelC34: "Низкий", riskLevelC18C20: "Низкий",
    completionPercent: 82, lastCalculated: "2026-03-25", eventualDiagnosis: "C18-C20",
    risks: { 1: 10, 2: 5, 3: 6 },
    snapshot: { smoking: "нет", hypertension: "нет", diabetes: "нет", antihypertensiveMeds: "нет",
      systolicBp: "114", diastolicBp: "70", pulse: "64", respirationRate: "15",
      glucose: "5.4", wbc: "6.0", hgb: "126", therapistVisits: "1",
      endocrinologistVisits: "0", neurologistVisits: "0", surgeonVisits: "0",
      fluorographyCount: "1", colonoscopy: "нет" },
  },
];
