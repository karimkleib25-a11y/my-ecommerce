import * as React from 'react';
import { useState } from 'react';
import { Header } from './Header';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';
import { User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "./AuthContext";
import { Layout } from "./Layout";

interface UserProfileProps {
  user?: { id: string; name: string; email: string };
  onLogout?: () => void;
}

export function UserProfile(props: { user?: { id: string; name: string; email: string }; onLogout?: () => void }) {
  const ctx = useAuth();
  const navigate = useNavigate();
  const user = props.user ?? ctx.user!;
  const onLogout = props.onLogout ?? ctx.logout;

  if (!user) {
    return (
      <div className="container px-4 md:px-6 py-6">
        <h1 className="text-2xl font-semibold mb-2">Profile</h1>
        <p className="text-muted-foreground">You are not logged in.</p>
        <Button onClick={() => navigate("/auth?tab=login")}>Go to Login</Button>
      </div>
    );
  }

  return (
    <Layout>
      <div className="container px-4 md:px-6 py-8 space-y-6">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <div className="space-y-2">
          <p><span className="font-medium">Name:</span> {user.name}</p>
          <p><span className="font-medium">Email:</span> {user.email}</p>
        </div>
        <Button
          variant="destructive"
          onClick={() => {
            onLogout();
            navigate("/auth?tab=login");
          }}
        >
          Logout
        </Button>
      </div>
    </Layout>
  );
}

export function UserProfileSimple() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="container px-4 md:px-6 py-8">
        <h1 className="text-2xl font-semibold mb-2">Profile</h1>
        <p className="text-muted-foreground mb-4">You are not logged in.</p>
        <Button onClick={() => navigate("/auth?tab=login")}>Go to Login</Button>
      </div>
    );
  }

  return (
    <div className="container px-4 md:px-6 py-8 space-y-6">
      <h1 className="text-2xl font-semibold">Profile</h1>
      <div className="space-y-2">
        <p><span className="font-medium">Name:</span> {user.name}</p>
        <p><span className="font-medium">Email:</span> {user.email}</p>
      </div>
      <Button
        variant="destructive"
        onClick={() => {
          logout();
          navigate("/auth?tab=login");
        }}
      >
        Logout
      </Button>
    </div>
  );
}


