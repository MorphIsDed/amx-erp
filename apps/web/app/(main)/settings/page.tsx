"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Button from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } } };

export default function SettingsPage() {
  const [tab, setTab] = useState<"general" | "team" | "security">("general");
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 w-full max-w-5xl mx-auto">
      <motion.div variants={item}>
        <h1 className="text-3xl font-bold tracking-tight"><span className="text-gradient-primary">Settings</span></h1>
        <p className="text-sm text-text-muted mt-2">Manage your organization settings and preferences.</p>
      </motion.div>

      <motion.div variants={item}>
        <div className="flex gap-1 p-1 bg-card/40 border border-border/20 rounded-xl w-fit backdrop-blur-sm">
          {(["general", "team", "security"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all capitalize ${tab === t ? "text-text-main" : "text-text-faint hover:text-text-muted"}`}>
              {tab === t && <motion.div layoutId="settings-tab" className="absolute inset-0 bg-card border border-border/40 rounded-lg shadow-sm" transition={{ type: "spring", stiffness: 350, damping: 30 }} />}
              <span className="relative z-10">{t}</span>
            </button>
          ))}
        </div>
      </motion.div>

      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="space-y-6">
            {tab === "general" && (<>
              <Card>
                <CardHeader className="border-b border-border/20 pb-4"><CardTitle className="text-base">Organization Profile</CardTitle><p className="text-sm text-text-faint mt-1">Update your company name and contact information.</p></CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2"><label className="text-sm font-medium text-text-main">Company Name</label><Input type="text" defaultValue="AMX Global" placeholder="Enter company name" /></div>
                    <div className="space-y-2"><label className="text-sm font-medium text-text-main">Contact Email</label><Input type="email" defaultValue="admin@amxglobal.com" placeholder="Enter contact email" /></div>
                  </div>
                </CardContent>
                <div className="p-4 border-t border-border/20 flex justify-end rounded-b-2xl"><Button variant="primary">Save Changes</Button></div>
              </Card>
              <Card className="border-danger/20">
                <CardHeader className="border-b border-danger/10 pb-4"><CardTitle className="text-base text-danger">Danger Zone</CardTitle><p className="text-sm text-text-faint mt-1">Irreversible actions for your organization.</p></CardHeader>
                <CardContent className="pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div><p className="text-sm font-medium text-text-main">Delete Organization</p><p className="text-sm text-text-faint mt-0.5">Permanently remove your organization and all related data.</p></div>
                  <Button variant="danger" className="w-full sm:w-auto">Delete Organization</Button>
                </CardContent>
              </Card>
            </>)}
            {tab === "team" && (
              <Card>
                <CardHeader className="border-b border-border/20 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 space-y-0">
                  <div className="space-y-1.5"><CardTitle className="text-base">Team Members</CardTitle><p className="text-sm text-text-faint mt-1">Manage who has access to this workspace.</p></div>
                  <Button variant="primary" size="sm" className="w-full sm:w-auto">Invite Member</Button>
                </CardHeader>
                <div className="[&>div]:border-0 [&>div]:rounded-none [&>div]:bg-transparent">
                  <Table>
                    <TableHeader><TableRow className="hover:bg-transparent"><TableHead>User</TableHead><TableHead>Role</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {[{ name: "Alice Johnson", role: "Admin", status: "Active" }, { name: "Bob Smith", role: "Editor", status: "Active" }, { name: "Charlie Davis", role: "Viewer", status: "Pending" }].map((user, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium text-text-main">{user.name}</TableCell>
                          <TableCell className="text-text-muted">{user.role}</TableCell>
                          <TableCell><span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider ${user.status === "Active" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>{user.status}</span></TableCell>
                          <TableCell className="text-right space-x-3">
                            <Button variant="ghost" size="sm" className="text-text-muted hover:text-text-main">Edit</Button>
                            <Button variant="ghost" size="sm" className="text-danger hover:text-danger-hover">Revoke</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            )}
            {tab === "security" && (
              <Card>
                <CardHeader className="border-b border-border/20 pb-4"><CardTitle className="text-base">Security Settings</CardTitle><p className="text-sm text-text-faint mt-1">Manage your password and authentication methods.</p></CardHeader>
                <CardContent className="pt-6 flex items-center justify-between">
                  <div><p className="text-sm font-medium text-text-main">Two-Factor Authentication</p><p className="text-sm text-text-faint mt-0.5">Add an extra layer of security to your account.</p></div>
                  <Button variant="secondary">Enable 2FA</Button>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
