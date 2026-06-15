"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore, UserRole } from "@/lib/auth-store";
import Cookies from "js-cookie";
import { motion } from "framer-motion";
import { 
  Building2, 
  Mail, 
  Lock, 
  ArrowRight, 
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";



export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, isLoading, initialize } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("admin");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(redirectUrl);
    }
  }, [isAuthenticated, router, redirectUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg("Please enter an email address");
      return;
    }
    setLoading(true);
    setErrorMsg("");

    try {
      const activeRole = selectedRole;

      const success = await login(email, password, activeRole);
      if (success) {
        Cookies.set("amx_auth", "true", { expires: 7 });
        Cookies.set("amx_role", activeRole, { expires: 7 });
        router.replace(redirectUrl);
      } else {
        setErrorMsg("Invalid credentials. Try using a quick-select account.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Decorative ambient gradients */}
      <div className="fixed inset-0 bg-mesh pointer-events-none opacity-50" />
      <div className="fixed top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/[0.04] rounded-full blur-[160px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-accent/[0.03] rounded-full blur-[160px] pointer-events-none" />

      <div className="relative w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
        
        {/* LEFT COLUMN: BRANDING AND VALUE PROPOSITION */}
        <div className="lg:col-span-5 text-left space-y-6 hidden lg:block">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-cyan flex items-center justify-center shadow-lg shadow-primary/20">
              <Building2 className="text-slate-950 w-6 h-6" />
            </div>
            <span className="font-extrabold text-3xl tracking-tight text-text-main">
              AMX <span className="text-primary font-normal">ERP</span>
            </span>
          </div>

          <div className="space-y-4">
            <h2 className="text-4xl font-extrabold text-text-main tracking-tight leading-tight">
              Enterprise Control, <br />
              <span className="text-gradient-primary">Redefined.</span>
            </h2>
            <p className="text-text-muted text-base max-w-md">
              Synchronize Finance, HR, Inventory, and Purchase Orders with visual precision. Custom roles ensure contextual clarity across departments.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/10">
            <div>
              <p className="text-2xl font-bold text-text-main font-mono">100%</p>
              <p className="text-xs text-text-faint uppercase">Protected Routing</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-text-main font-mono">Real-time</p>
              <p className="text-xs text-text-faint uppercase">Optimistic Feeds</p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LOGIN FORM & QUICK CREDENTIALS */}
        <div className="lg:col-span-7 w-full max-w-md mx-auto lg:max-w-none grid grid-cols-1 gap-6">
          
          <Card variant="glass" className="border-border/30 overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary to-accent" />
            
            <CardContent className="p-8">
              {/* Mobile Header Logo */}
              <div className="flex lg:hidden items-center justify-center gap-2 mb-8">
                <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                  <Building2 className="text-slate-950 w-5 h-5" />
                </div>
                <span className="font-bold text-xl text-text-main">AMX-ERP</span>
              </div>

              <div className="mb-6 text-center lg:text-left">
                <h1 className="text-2xl font-bold text-text-main">Sign In</h1>
                <p className="text-text-muted text-xs mt-1">
                  Access your organization&apos;s administrative space
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="p-3 bg-danger/10 border border-danger/20 rounded-lg text-xs text-danger text-center font-medium animate-shake">
                    {errorMsg}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-muted">Work Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-faint" />
                    <input
                      type="email"
                      required
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-surface/50 border border-border/40 rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-main placeholder:text-text-faint/60 focus:border-primary/50 focus:bg-surface/90 outline-none transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-text-muted">Password</label>
                    <Link href="#" className="text-[10px] text-primary hover:underline font-semibold">
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-faint" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-surface/50 border border-border/40 rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-main placeholder:text-text-faint/60 focus:border-primary/50 focus:bg-surface/90 outline-none transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Role select */}
                {email && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-1.5 pt-1"
                  >
                    <label className="text-xs font-semibold text-text-muted">Assign Account Role</label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                      className="w-full bg-surface/50 border border-border/40 rounded-xl px-3 py-2 text-sm text-text-main focus:border-primary/50 focus:bg-surface/90 outline-none transition-all"
                    >
                      <option value="admin" className="bg-background">Global Admin</option>
                      <option value="finance" className="bg-background">Finance Manager</option>
                      <option value="hr" className="bg-background">HR Manager</option>
                      <option value="inventory" className="bg-background">Inventory Lead</option>
                      <option value="viewer" className="bg-background">Executive Guest</option>
                    </select>
                  </motion.div>
                )}

                <Button type="submit" disabled={loading} className="w-full mt-4 py-2.5 shadow-lg shadow-primary/10">
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Secure Sign In
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <span className="text-xs text-text-faint">Don&apos;t have an enterprise workspace? </span>
                <Link href="/register" className="text-xs text-primary font-bold hover:underline">
                  Create Workspace
                </Link>
              </div>
            </CardContent>
          </Card>


        </div>
      </div>
    </div>
  );
}
