import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { ActividadesPage } from "./pages/ActividadesPage";
import { ClientesPage } from "./pages/ClientesPage";
import { DashboardPage } from "./pages/DashboardPage";
import { OportunidadesPage } from "./pages/OportunidadesPage";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/clientes" element={<ClientesPage />} />
        <Route path="/oportunidades" element={<OportunidadesPage />} />
        <Route path="/actividades" element={<ActividadesPage />} />
      </Route>
    </Routes>
  );
}

export default App;
