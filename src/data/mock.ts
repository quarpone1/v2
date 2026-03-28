export const patientsData = [
  {
    id: "PT-001",
    name: "Иванов Иван Иванович",
    age: 58,
    gender: "Мужской",
    diagnosis: "Аденокарцинома",
    stage: "II",
    riskScore: 24,
    riskLevel: "Низкий",
    lastVisit: "2026-03-20",
    status: "Ремиссия",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  },
  {
    id: "PT-002",
    name: "Смирнова Анна Сергеевна",
    age: 64,
    gender: "Женский",
    diagnosis: "Плоскоклеточный рак",
    stage: "III",
    riskScore: 68,
    riskLevel: "Высокий",
    lastVisit: "2026-03-22",
    status: "Лечение",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  },
  {
    id: "PT-003",
    name: "Петров Сергей Николаевич",
    age: 45,
    gender: "Мужской",
    diagnosis: "Саркома",
    stage: "I",
    riskScore: 12,
    riskLevel: "Низкий",
    lastVisit: "2026-03-25",
    status: "Наблюдение",
    image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  },
  {
    id: "PT-004",
    name: "Кузнецова Мария Владимировна",
    age: 72,
    gender: "Женский",
    diagnosis: "Меланома",
    stage: "II",
    riskScore: 45,
    riskLevel: "Средний",
    lastVisit: "2026-03-18",
    status: "Лечение",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  },
  {
    id: "PT-005",
    name: "Волков Дмитрий Андреевич",
    age: 52,
    gender: "Мужской",
    diagnosis: "Аденокарцинома",
    stage: "IV",
    riskScore: 89,
    riskLevel: "Высокий",
    lastVisit: "2026-03-27",
    status: "Паллиатив",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  },
  {
    id: "PT-006",
    name: "Лебедева Елена Павловна",
    age: 39,
    gender: "Женский",
    diagnosis: "Карцинома",
    stage: "I",
    riskScore: 8,
    riskLevel: "Низкий",
    lastVisit: "2026-03-10",
    status: "Ремиссия",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
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
