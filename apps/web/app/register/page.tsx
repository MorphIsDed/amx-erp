"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  User, 
  Mail, 
  Lock, 
  Globe, 
  ArrowRight, 
  CheckCircle2,
  ChevronLeft,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_ENDPOINTS } from "@/lib/api-config";

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    companyName: "",
    companyDomain: "",
    adminName: "",
    adminEmail: "",
    adminPassword: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(API_ENDPOINTS.REGISTER, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Registration failed");

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (error) {
      console.error(error);
      alert("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6">
      {/* LOGO */}
      <div className="mb-10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
          <Building2 className="text-slate-950 w-6 h-6" />
        </div>
        <span className="font-bold text-2xl tracking-tight text-text-main">AMX-ERP</span>
      </div>

      <div className="w-full max-w-[480px]">
        <AnimatePresence mode="wait">
          {!success ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card variant="glass" className="p-8">
                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-text-main">Set up your workspace</h1>
                  <p className="text-text-muted text-sm mt-1">
                    Step {step} of 2: {step === 1 ? "Company Details" : "Admin Account"}
                  </p>
                  
                  {/* PROGRESS BAR */}
                  <div className="mt-4 flex gap-2">
                    <div className={cn("h-1 flex-1 rounded-full transition-colors", step >= 1 ? "bg-primary" : "bg-border")} />
                    <div className={cn("h-1 flex-1 rounded-full transition-colors", step >= 2 ? "bg-primary" : "bg-border")} />
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {step === 1 && (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-4"
                    >
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-text-main">Company Name</label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                          <input
                            required
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleInputChange}
                            placeholder="e.g. Acme Industries"
                            className="w-full bg-surface border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary/50 transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-text-main">Workspace Domain</label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                          <input
                            required
                            name="companyDomain"
                            value={formData.companyDomain}
                            onChange={handleInputChange}
                            placeholder="acme-inc"
                            className="w-full bg-surface border border-border rounded-lg pl-10 pr-24 py-2.5 text-sm outline-none focus:border-primary/50 transition-all"
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-text-muted">
                            .amx-erp.com
                          </div>
                        </div>
                      </div>

                      <Button type="button" onClick={nextStep} className="w-full mt-4">
                        Next Step
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-4"
                    >
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-text-main">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                          <input
                            required
                            name="adminName"
                            value={formData.adminName}
                            onChange={handleInputChange}
                            placeholder="John Doe"
                            className="w-full bg-surface border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary/50 transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-text-main">Work Email</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                          <input
                            required
                            type="email"
                            name="adminEmail"
                            value={formData.adminEmail}
                            onChange={handleInputChange}
                            placeholder="john@company.com"
                            className="w-full bg-surface border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary/50 transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-text-main">Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                          <input
                            required
                            type="password"
                            name="adminPassword"
                            value={formData.adminPassword}
                            onChange={handleInputChange}
                            placeholder="••••••••"
                            className="w-full bg-surface border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary/50 transition-all"
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <Button type="button" variant="outline" onClick={prevStep} className="flex-1">
                          <ChevronLeft className="mr-2 w-4 h-4" />
                          Back
                        </Button>
                        <Button type="submit" disabled={loading} className="flex-[2]">
                          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Complete Setup"}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </form>

                <div className="mt-8 text-center">
                  <p className="text-xs text-text-muted">
                    By continuing, you agree to our <Link href="#" className="text-primary hover:underline">Terms of Service</Link> and <Link href="#" className="text-primary hover:underline">Privacy Policy</Link>.
                  </p>
                </div>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="text-primary w-12 h-12" />
              </div>
              <h1 className="text-3xl font-bold text-text-main">Workspace Ready!</h1>
              <p className="text-text-muted mt-2">Provisioning your ERP environment...</p>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="mt-8 text-center text-sm text-text-muted">
          Already have a workspace? <Link href="/login" className="text-primary font-semibold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
