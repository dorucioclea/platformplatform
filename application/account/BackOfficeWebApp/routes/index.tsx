import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { AppLayout } from "@repo/ui/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/Card";
import { SidebarInset, SidebarProvider } from "@repo/ui/components/Sidebar";
import { createFileRoute } from "@tanstack/react-router";

import { BackOfficeSideMenu } from "@/shared/components/BackOfficeSideMenu";
import { useMe } from "@/shared/hooks/useMe";

export const Route = createFileRoute("/")({
  staticData: { trackingTitle: "Back office dashboard" },
  component: DashboardPage
});

function DashboardPage() {
  const { data: me } = useMe();

  return (
    <SidebarProvider>
      <BackOfficeSideMenu />
      <SidebarInset>
        <AppLayout
          browserTitle={t`Dashboard`}
          title={t`Welcome to the Back Office`}
          subtitle={t`Manage accounts, view system data, see exceptions, and perform various tasks for operational and support teams.`}
        >
          <Card className="w-full max-w-[40rem]">
            <CardHeader>
              <CardTitle>
                {me?.displayName ? <Trans>Welcome, {me.displayName}</Trans> : <Trans>Welcome</Trans>}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              <div>
                <span className="font-medium">
                  <Trans>Group claims</Trans>
                </span>
                <span>: </span>
                <span>{me?.groups?.length ? me.groups.join(", ") : <Trans>None</Trans>}</span>
              </div>
            </CardContent>
          </Card>
        </AppLayout>
      </SidebarInset>
    </SidebarProvider>
  );
}
