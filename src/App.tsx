import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "../components/AuthContext";
import { AuthPage } from "../components/AuthPage";
import { StorePage } from "../components/StorePage";
import { CheckoutPage } from "../components/CheckoutPage";
import { BuyerOrders } from "../components/BuyerOrders";
import { FavoritesPage } from "../components/FavoritesPage";
import { UserProfile } from "../components/UserProfile";
import { SellerDashboard } from "../components/SellerDashboard";
import { SellerProducts } from "../components/SellerProducts";
import { AddProduct } from "../components/AddProduct";
import { SellerOrders } from "../components/SellerOrders";
import { AdminDashboard } from "../components/AdminDashboard";
import { SupportPage } from "../components/SupportPage";
import { MyReviews } from "../components/MyReviews";

function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: string }) {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<StorePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/support" element={<SupportPage />} />

        {/* Buyer Routes */}
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <BuyerOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/favorites"
          element={
            <ProtectedRoute>
              <FavoritesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reviews"
          element={
            <ProtectedRoute>
              <MyReviews />
            </ProtectedRoute>
          }
        />

        {/* Seller Routes */}
        <Route
          path="/seller/dashboard"
          element={
            <ProtectedRoute role="seller">
              <SellerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/products"
          element={
            <ProtectedRoute role="seller">
              <SellerProducts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/add-product"
          element={
            <ProtectedRoute role="seller">
              <AddProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/orders"
          element={
            <ProtectedRoute role="seller">
              <SellerOrders />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;