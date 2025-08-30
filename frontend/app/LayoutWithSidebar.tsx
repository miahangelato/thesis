"use client";
import React from "react";
import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function LayoutWithSidebar({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  if (isLanding) {
    return <>{children}</>;
  }
  return (
    <div className="relative h-screen">
      <SidebarProvider>
        <AppSidebar />
      </SidebarProvider>
      <main className="ml-64 h-screen p-6 overflow-auto">{children}</main>
    </div>
  );
}
