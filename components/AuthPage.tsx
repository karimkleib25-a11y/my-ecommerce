import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import { Header } from "./Header"; // added

export function AuthPage() {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerRole, setRegisterRole] = useState<"buyer" | "seller">("buyer");
  const [storeName, setStoreName] = useState("");
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    const success = await login(loginEmail, loginPassword);
    if (success) {
      toast.success("Login successful!");
      
      // Dispatch event to refresh products
      window.dispatchEvent(new Event("products-updated"));
      
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        navigate(user.role === "seller" ? "/seller/dashboard" : "/");
      } else {
        navigate("/");
      }
    } else {
      toast.error("Invalid email or password");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerName || !registerEmail || !registerPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    if (registerRole === "seller" && !storeName) {
      toast.error("Please provide a store name");
      return;
    }
    const success = await register(
      registerEmail,
      registerPassword,
      registerName,
      registerRole,
      storeName
    );
    if (success) {
      toast.success("Registration successful!");
      navigate(registerRole === "seller" ? "/seller/dashboard" : "/");
    } else {
      toast.error("Email already exists");
    }
  };

  return (
    <>
      <Header /> {/* shows logo link back to main page */}
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background p-4">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-md flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="text-sm"
          >
            ← Back to Store
          </Button>
        </div>
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Welcome to E-Shop</CardTitle>
            <CardDescription>Login or create an account to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Login
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Name</Label>
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="Enter your name"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="Enter your email"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="Create a password"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Register as</Label>
                    <RadioGroup value={registerRole} onValueChange={(v) => setRegisterRole(v as "buyer" | "seller")}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="buyer" id="register-buyer" />
                        <Label htmlFor="register-buyer" className="cursor-pointer">Buyer</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="seller" id="register-seller" />
                        <Label htmlFor="register-seller" className="cursor-pointer">Seller</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  {registerRole === "seller" && (
                    <div className="space-y-2">
                      <Label htmlFor="store-name">Store Name</Label>
                      <Input
                        id="store-name"
                        type="text"
                        placeholder="Enter your store name"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                      />
                    </div>
                  )}
                  <Button type="submit" className="w-full">
                    Register
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </>
  );
}