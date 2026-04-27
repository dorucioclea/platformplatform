import { requireAuthentication } from "@repo/infrastructure/auth/routeGuards";
import { SidebarInset, SidebarProvider } from "@repo/ui/components/Sidebar";
import { createFileRoute, Outlet } from "@tanstack/react-router";

import { BackOfficeSideMenu } from "@/shared/components/BackOfficeSideMenu";

export const Route = createFileRoute("/back-office")({
  beforeLoad: () => requireAuthentication(),
  component: BackOfficeLayout
});

function BackOfficeLayout() {
  return (
    <SidebarProvider>
      <BackOfficeSideMenu />
      <SidebarInset>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
