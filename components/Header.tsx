import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { ShoppingCart, Heart, User, Sun, Moon } from "lucide-react";
import { useAuth } from "./AuthContext";
import { useCart } from "../lib/cart";
import { useFavorites } from "../lib/favorites";
import { CartSheet } from "./CartSheet";
import { Badge } from "./ui/badge";
import { useTheme } from "./ThemeProvider";

export function Header() {
  const { user } = useAuth();
  const { items } = useCart();
  const { ids } = useFavorites();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme(); // now properly typed

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  

  const totalItems = items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center space-x-2">
          <ShoppingCart className="h-6 w-6" />
          <span className="font-bold text-xl">E-Shop</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {user ? (
            <>
              <Link to="/favorites">
                <Button variant="ghost" size="icon" className="relative">
                  <Heart className="h-5 w-5" />
                  {ids.length > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {ids.length}
                    </Badge>
                  )}
                </Button>
              </Link>

              <CartSheet>
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {totalItems > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {totalItems}
                    </Badge>
                  )}
                </Button>
              </CartSheet>

              <Link to="/profile">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>

              
            </>
          ) : (
            <Button onClick={() => navigate("/auth")}>Login / Sign Up</Button>
          )}
        </div>
      </div>
    </header>
  );
}