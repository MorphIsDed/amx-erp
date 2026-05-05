"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Table from "@/components/ui/table";

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
        <h1 className="text-2xl font-semibold text-[#E5E7EB]">Settings</h1>
        <p className="text-sm text-[#9CA3AF] mt-1">
          Manage your organization settings and preferences.
        </p>
      </div>

      {/* TAB NAVIGATION */}
      <div className="flex gap-6 border-b border-[#1F2937]">
        {(["general", "team", "security"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`capitalize pb-3 text-sm font-medium transition-colors relative ${
              tab === t
                ? "text-[#E5E7EB]"
                : "text-[#9CA3AF] hover:text-[#E5E7EB]"
            }`}
          >
            {t}
            {tab === t && (
              <motion.div
                layoutId="active-tab"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-500"
                transition={{ duration: 0.2 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <motion.div
        key={tab}
        initial={{ opacity: 0, x: -5 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
        className="space-y-6"
      >
        {tab === "general" && (
          <>
            {/* ORGANIZATION PROFILE CARD */}
            <section className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden hover:border-[#1F2937]/80 transition-colors">
              <div className="p-6 border-b border-[#1F2937]">
                <h2 className="text-base font-medium text-[#E5E7EB]">
                  Organization Profile
                </h2>
                <p className="text-sm text-[#9CA3AF] mt-1">
                  Update your company name and contact information.
                </p>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#E5E7EB]">
                      Company Name
                    </label>
                    <input
                      type="text"
                      defaultValue="AMX Global"
                      className="w-full bg-[#0B0F19] border border-[#1F2937] px-3 py-2 rounded-lg text-sm text-[#E5E7EB] placeholder-[#9CA3AF] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#E5E7EB]">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      defaultValue="admin@amxglobal.com"
                      className="w-full bg-[#0B0F19] border border-[#1F2937] px-3 py-2 rounded-lg text-sm text-[#E5E7EB] placeholder-[#9CA3AF] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
              <div className="bg-[#0B0F19] p-4 border-t border-[#1F2937] flex justify-end">
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  Save Changes
                </button>
              </div>
            </section>

            {/* DANGER ZONE CARD */}
            <section className="bg-[#111827] border border-red-900/30 rounded-xl overflow-hidden">
              <div className="p-6 border-b border-[#1F2937]">
                <h2 className="text-base font-medium text-[#E5E7EB]">
                  Danger Zone
                </h2>
                <p className="text-sm text-[#9CA3AF] mt-1">
                  Irreversible actions for your organization.
                </p>
              </div>
              <div className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#E5E7EB]">
                    Delete Organization
                  </p>
                  <p className="text-sm text-[#9CA3AF] mt-0.5">
                    Permanently remove your organization and all related data.
                  </p>
                </div>
                <button className="text-red-400 bg-red-400/10 hover:bg-red-400/20 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  Delete Organization
                </button>
              </div>
            </section>
          </>
        )}

        {tab === "team" && (
          <section className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden">
            <div className="p-6 border-b border-[#1F2937] flex items-center justify-between">
              <div>
                <h2 className="text-base font-medium text-[#E5E7EB]">
                  Team Members
                </h2>
                <p className="text-sm text-[#9CA3AF] mt-1">
                  Manage who has access to this workspace.
                </p>
              </div>
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                Invite Member
              </button>
            </div>
            
            {/* OVERRIDING SHARED TABLE STYLES TO MATCH SETTINGS THEME */}
            <div className="[&_table]:border-0 [&_table]:border-collapse [&_thead_tr]:bg-[#0B0F19] [&_thead_tr]:text-[#9CA3AF] [&_th]:font-medium [&_th]:border-b [&_th]:border-[#1F2937] [&_td]:border-b [&_td]:border-[#1F2937]/50 [&_tr:last-child_td]:border-0 [&_tr:hover]:bg-white/[0.02] [&_tr]:transition-colors [&_th]:text-left [&_th]:p-3">
              <Table headers={["User", "Role", "Status", "Actions"]}>
                {[
                  { name: "Alice Johnson", role: "Admin", status: "Active" },
                  { name: "Bob Smith", role: "Editor", status: "Active" },
                  { name: "Charlie Davis", role: "Viewer", status: "Pending" },
                ].map((user, i) => (
                  <tr key={i}>
                    <td className="p-3 text-sm text-[#E5E7EB]">{user.name}</td>
                    <td className="p-3 text-sm text-[#9CA3AF]">{user.role}</td>
                    <td className="p-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded-md text-[11px] font-medium tracking-wide ${
                          user.status === "Active"
                            ? "bg-green-500/10 text-green-400"
                            : "bg-yellow-500/10 text-yellow-400"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-right pr-4 space-x-3">
                      <button className="text-[#9CA3AF] hover:text-[#E5E7EB] transition-colors">
                        Edit
                      </button>
                      <button className="text-red-400 hover:text-red-300 transition-colors">
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </Table>
            </div>
          </section>
        )}

        {tab === "security" && (
          <section className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden">
            <div className="p-6 border-b border-[#1F2937]">
              <h2 className="text-base font-medium text-[#E5E7EB]">
                Security Settings
              </h2>
              <p className="text-sm text-[#9CA3AF] mt-1">
                Manage your password and authentication methods.
              </p>
            </div>
            <div className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#E5E7EB]">
                  Two-Factor Authentication
                </p>
                <p className="text-sm text-[#9CA3AF] mt-0.5">
                  Add an extra layer of security to your account.
                </p>
              </div>
              <button className="bg-transparent border border-[#1F2937] hover:bg-[#1F2937]/50 text-[#E5E7EB] px-4 py-2 rounded-md text-sm font-medium transition-colors">
                Enable 2FA
              </button>
            </div>
          </section>
        )}
      </motion.div>
    </motion.div>
  );
}