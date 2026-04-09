export const patientsData = [
  {
    id: "P-10001",
    name: "P-10001",
    age: 58,
    gender: "Мужской",
    diagnosis: "Колоректальный рак",
    stage: "II",
    riskScore: 24,
    riskLevel: "Низкий",
    lastVisit: "2026-03-20",
    status: "Ремиссия"
  },
  {
    id: "P-10002",
    name: "P-10002",
    age: 64,
    gender: "Женский",
    diagnosis: "Колоректальный рак",
    stage: "III",
    riskScore: 68,
    riskLevel: "Высокий",
    lastVisit: "2026-03-22",
    status: "Лечение"
  },
  {
    id: "P-10003",
    name: "P-10003",
    age: 45,
    gender: "Мужской",
    diagnosis: "Колоректальный рак",
    stage: "I",
    riskScore: 12,
    riskLevel: "Низкий",
    lastVisit: "2026-03-25",
    status: "Наблюдение"
  },
  {
    id: "P-10004",
    name: "P-10004",
    age: 72,
    gender: "Женский",
    diagnosis: "Колоректальный рак",
    stage: "II",
    riskScore: 45,
    riskLevel: "Средний",
    lastVisit: "2026-03-18",
    status: "Лечение"
  },
  {
    id: "P-10005",
    name: "P-10005",
    age: 52,
    gender: "Мужской",
    diagnosis: "Колоректальный рак",
    stage: "IV",
    riskScore: 89,
    riskLevel: "Высокий",
    lastVisit: "2026-03-27",
    status: "Паллиатив"
  },
  {
    id: "P-10006",
    name: "P-10006",
    age: 39,
    gender: "Женский",
    diagnosis: "Колоректальный рак",
    stage: "I",
    riskScore: 8,
    riskLevel: "Низкий",
    lastVisit: "2026-03-10",
    status: "Ремиссия"
  },
];

export type PatientRecord = (typeof patientsData)[number];

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
