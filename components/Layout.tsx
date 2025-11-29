import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { useAuth } from "./AuthContext";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        {user && <Sidebar />}
        <main className={user ? "flex-1 md:ml-64" : "flex-1"}>
          {children}
        </main>
      </div>
    </div>
  );
}