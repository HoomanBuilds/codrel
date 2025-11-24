import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await getServerSession();

  if (!session) redirect("/");

  return <>{children}</>;
}
