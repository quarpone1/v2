import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Patients } from "./pages/Patients";
import { PatientProfile } from "./pages/PatientProfile";
import { Calculator } from "./pages/Calculator";
import { Analytics } from "./pages/Analytics";
import { Settings } from "./pages/Settings";
import { Integrations } from "./pages/Integrations";
import { Models } from "./pages/Models";
import { BatchAnalysis } from "./pages/BatchAnalysis";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "patients", Component: Patients },
      { path: "patients/:id", Component: PatientProfile },
      { path: "calculator", Component: Calculator },
      { path: "batch-analysis", Component: BatchAnalysis },
      { path: "analytics", Component: Analytics },
      { path: "integrations", Component: Integrations },
      { path: "models", Component: Models },
      { path: "settings", Component: Settings },
    ],
  },
]);
