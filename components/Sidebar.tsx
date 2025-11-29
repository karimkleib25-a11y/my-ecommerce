import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useCart } from "../lib/cart";
import { cn } from "./ui/utils";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";
import {
  Home,
  ShoppingBag,
  Heart,
  Package,
  Star,
  HelpCircle,
  User,
  LayoutDashboard,
  ListOrdered,
  ShoppingCart,
  X,
  ArrowRight,
  Eye,
  ShieldCheck,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { useState } from "react";
import { CartSheet } from "./CartSheet";

export function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { getTotal, items, removeItem } = useCart();
  const total = getTotal();
  const [cartOpen, setCartOpen] = useState(false);
  const totalItems = items.reduce((sum, item) => sum + item.qty, 0);

  const buyerLinks = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/favorites", icon: Heart, label: "Favorites" },
    { href: "/orders", icon: Package, label: "My Orders" },
    { href: "/reviews", icon: Star, label: "My Reviews" },
    { href: "/profile", icon: User, label: "Profile" },
    { href: "/support", icon: HelpCircle, label: "Support" },
  ];

  const sellerLinks = [
    { href: "/", icon: Home, label: "Shop" },
    { href: "/seller/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/seller/products", icon: ShoppingBag, label: "My Products" },
    { href: "/seller/orders", icon: ListOrdered, label: "Seller Orders" },
    { href: "/orders", icon: Package, label: "My Purchases" },
    { href: "/favorites", icon: Heart, label: "Favorites" },
    { href: "/profile", icon: User, label: "Profile" },
    { href: "/support", icon: HelpCircle, label: "Support" },
  ];

  const adminLinks = [
    { href: "/admin", icon: ShieldCheck, label: "Admin Panel" },
    { href: "/", icon: Home, label: "Shop" },
    { href: "/profile", icon: User, label: "Profile" },
    { href: "/support", icon: HelpCircle, label: "Support" },
  ];

  const links =
    user?.role === "admin"
      ? adminLinks
      : user?.role === "seller"
      ? sellerLinks
      : buyerLinks;

  if (!user) return null;

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 border-r bg-background hidden md:flex flex-col">
      {/* Navigation Links */}
      <ScrollArea className="flex-1">
        <nav className="p-3 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.href;

            return (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all font-medium text-sm",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Cart Section */}
      {items.length > 0 && (
        <>
          <Separator />
          <Collapsible open={cartOpen} onOpenChange={setCartOpen} className="p-3">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between hover:bg-accent"
              >
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  <span className="font-semibold">Cart</span>
                </div>
                <Badge variant="secondary" className="ml-auto">
                  {totalItems}
                </Badge>
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="space-y-3 pt-3">
              <ScrollArea className="h-[200px] pr-3">
                <div className="space-y-2">
                  {items.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="group relative flex gap-3 p-2 rounded-lg border bg-card hover:shadow-sm transition-all"
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-14 h-14 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs line-clamp-1">
                          {item.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.qty} × ${item.price.toFixed(2)}
                        </p>
                        <p className="text-xs font-semibold mt-1">
                          ${(item.price * item.qty).toFixed(2)}
                        </p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity absolute top-1 right-1"
                        onClick={() => removeItem(item.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  {items.length > 3 && (
                    <p className="text-xs text-center text-muted-foreground py-2">
                      +{items.length - 3} more items
                    </p>
                  )}
                </div>
              </ScrollArea>

              <div className="space-y-2 pt-2 border-t">
                <div className="flex justify-between items-center px-1">
                  <span className="text-sm font-semibold">Subtotal</span>
                  <span className="text-lg font-bold">${total.toFixed(2)}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <CartSheet>
                    <Button variant="outline" className="w-full gap-2" size="sm">
                      <Eye className="h-3 w-3" />
                      View Cart
                    </Button>
                  </CartSheet>

                  <Button
                    className="w-full gap-2"
                    size="sm"
                    onClick={() => navigate("/checkout")}
                  >
                    Checkout
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </>
      )}

      {/* Cart Total for Buyer Role */}
      {user?.role === "buyer" && (
        <div className="p-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Cart Total</span>
            <span className="font-semibold">${total.toFixed(2)}</span>
          </div>
        </div>
      )}
    </aside>
  );
}