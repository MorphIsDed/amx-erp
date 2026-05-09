"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Button from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function SettingsPage() {
  const [tab, setTab] = useState<"general" | "team" | "security">("general");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 max-w-5xl"
    >
      {/* PAGE HEADER */}
      <div>
        <h1 className="text-2xl font-semibold text-text-main tracking-tight">Settings</h1>
        <p className="text-sm text-text-muted mt-1">
          Manage your organization settings and preferences.
        </p>
      </div>
      {/* TAB NAVIGATION */}
      <div className="flex gap-6 border-b border-border">
        {(["general", "team", "security"] as const).map((t) => (
          <Button
            key={t}
            onClick={() => setTab(t)}
            className={`capitalize pb-3 text-sm font-medium transition-colors relative ${
              tab === t
                ? "text-text-main"
                : "text-text-muted hover:text-text-main"
            }`}
          >
            {t}
            {tab === t && (
              <motion.div
                layoutId="active-tab"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary"
                transition={{ duration: 0.2 }}
              />
            )}
          </Button>
        ))}
      </div>
      {/* TAB CONTENT */}
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {tab === "general" && (
              <>
                {/* ORGANIZATION PROFILE CARD */}
                <Card>
                  <CardHeader className="border-b border-border pb-4">
                    <CardTitle className="text-base">Organization Profile</CardTitle>
                    <p className="text-sm text-text-muted mt-1">
                      Update your company name and contact information.
                    </p>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-text-main">
                          Company Name
                        </label>
                        <Input
                          type="text"
                          defaultValue="AMX Global"
                          placeholder="Enter company name"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-text-main">
                          Contact Email
                        </label>
                        <Input
                          type="email"
                          defaultValue="admin@amxglobal.com"
                          placeholder="Enter contact email"
                        />
                      </div>
                    </div>
                  </CardContent>
                  <div className="bg-background/50 p-4 border-t border-border flex justify-end rounded-b-xl">
                    <Button variant="primary">Save Changes</Button>
                  </div>
                </Card>

                {/* DANGER ZONE CARD */}
                <Card className="border-danger/30">
                  <CardHeader className="border-b border-danger/20 pb-4">
                    <CardTitle className="text-base text-danger">Danger Zone</CardTitle>
                    <p className="text-sm text-text-muted mt-1">
                      Irreversible actions for your organization.
                    </p>
                  </CardHeader>
                  <CardContent className="pt-6 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-text-main">
                        Delete Organization
                      </p>
                      <p className="text-sm text-text-muted mt-0.5">
                        Permanently remove your organization and all related data.
                      </p>
                    </div>
                    <Button variant="danger">Delete Organization</Button>
                  </CardContent>
                </Card>
              </>
            )}

            {tab === "team" && (
              <Card>
                <CardHeader className="border-b border-border pb-4 flex flex-row items-center justify-between space-y-0">
                  <div className="space-y-1.5">
                    <CardTitle className="text-base">Team Members</CardTitle>
                    <p className="text-sm text-text-muted mt-1">
                      Manage who has access to this workspace.
                    </p>
                  </div>
                  <Button variant="primary" size="sm">Invite Member</Button>
                </CardHeader>
                
                <div className="[&>div]:border-0 [&>div]:rounded-none [&>div]:bg-transparent">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        { name: "Alice Johnson", role: "Admin", status: "Active" },
                        { name: "Bob Smith", role: "Editor", status: "Active" },
                        { name: "Charlie Davis", role: "Viewer", status: "Pending" },
                      ].map((user, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium text-text-main">{user.name}</TableCell>
                          <TableCell className="text-text-muted">{user.role}</TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-md text-[11px] font-medium tracking-wide ${
                                user.status === "Active"
                                  ? "bg-success/10 text-success"
                                  : "bg-warning/10 text-warning"
                              }`}
                            >
                              {user.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right space-x-3">
                            <Button className="text-sm text-text-muted hover:text-text-main transition-colors font-medium">
                              Edit
                            </Button>
                            <Button className="text-sm text-danger hover:text-danger-hover transition-colors font-medium">
                              Revoke
                            </Button>
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
                <CardHeader className="border-b border-border pb-4">
                  <CardTitle className="text-base">Security Settings</CardTitle>
                  <p className="text-sm text-text-muted mt-1">
                    Manage your password and authentication methods.
                  </p>
                </CardHeader>
                <CardContent className="pt-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-main">
                      Two-Factor Authentication
                    </p>
                    <p className="text-sm text-text-muted mt-0.5">
                      Add an extra layer of security to your account.
                    </p>
                  </div>
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


