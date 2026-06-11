import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { LoadingScreen } from "./components/common/LoadingScreen.jsx";
import { ProtectedRoute } from "./components/common/ProtectedRoute.jsx";
import { ScrollToTop } from "./components/common/ScrollToTop.jsx";

const ConfiguratorPage = lazy(() => import("./pages/ConfiguratorPage.jsx"));
const QuoteSuccessPage = lazy(() => import("./pages/QuoteSuccessPage.jsx"));
const AdminLoginPage = lazy(() => import("./pages/admin/AdminLoginPage.jsx"));
const AdminDashboardPage = lazy(() => import("./pages/admin/AdminDashboardPage.jsx"));
const VehicleManagerPage = lazy(() => import("./pages/admin/VehicleManagerPage.jsx"));
const ProductManagerPage = lazy(() => import("./pages/admin/ProductManagerPage.jsx"));
const QuoteManagerPage = lazy(() => import("./pages/admin/QuoteManagerPage.jsx"));

export default function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<ConfiguratorPage />} />
        <Route path="/configurator" element={<Navigate to="/" replace />} />
        <Route path="/quote-success" element={<QuoteSuccessPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard/vehicles"
          element={
            <ProtectedRoute>
              <VehicleManagerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard/products"
          element={
            <ProtectedRoute>
              <ProductManagerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard/quotes"
          element={
            <ProtectedRoute>
              <QuoteManagerPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
