import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  role: "buyer" | "seller" | "admin";
  storeId?: string;
  storeName?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthed: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, role: "buyer" | "seller", storeName?: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // Create default admin account if it doesn't exist
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const adminExists = users.some((u: any) => u.role === "admin");
    
    if (!adminExists) {
      const defaultAdmin = {
        id: "admin_001",
        email: "admin@ecommerce.com",
        password: "admin123",
        name: "Admin",
        role: "admin",
      };
      users.push(defaultAdmin);
      localStorage.setItem("users", JSON.stringify(users));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const foundUser = users.find(
      (u: any) => u.email === email && u.password === password
    );

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem("user", JSON.stringify(userWithoutPassword));
      return true;
    }
    return false;
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    role: "buyer" | "seller",
    storeName?: string
  ): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    
    if (users.some((u: any) => u.email === email)) {
      return false;
    }

    const newUser = {
      id: `user_${Date.now()}`,
      email,
      password,
      name,
      role,
      storeId: role === "seller" ? `store_${Date.now()}` : undefined,
      storeName: role === "seller" ? storeName : undefined,
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem("user", JSON.stringify(userWithoutPassword));
    return true;
  };

  const logout = () => {
    const userId = user?.id;
    
    if (userId) {
      // Clear only truly user-specific data
      localStorage.setItem("favorites", JSON.stringify([]));
      localStorage.removeItem("cart");
      
      // Keep orders, reviews, and products global
      // In a real app, orders would still be accessible via user profile
      // For demo purposes, you can choose to keep or clear user's orders:
      
      // Option A: Clear user's orders
      const allOrders = JSON.parse(localStorage.getItem("orders") || "[]");
      const otherUsersOrders = allOrders.filter((order: any) => order.userId !== userId);
      localStorage.setItem("orders", JSON.stringify(otherUsersOrders));
      
      // DON'T touch reviews - they belong to products, not users
      // DON'T touch products - marketplace products persist
    }
    
    // Clear user session
    setUser(null);
    localStorage.removeItem("user");
    
    // Only dispatch events for things we actually changed
    window.dispatchEvent(new Event("orders-updated"));
    window.dispatchEvent(new Event("favorites-updated"));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthed: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}