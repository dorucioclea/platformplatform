import { t } from "@lingui/core/macro";
import { useUserInfo } from "@repo/infrastructure/auth/hooks";
import { AppLayout } from "@repo/ui/components/AppLayout";
import { createFileRoute } from "@tanstack/react-router";

import { MainSideMenu } from "@/shared/components/MainSideMenu";

import { ComponentPreview } from "./-components/ComponentPreview";

export const Route = createFileRoute("/dashboard/")({
  staticData: { trackingTitle: "Dashboard" },
  component: DashboardPage
});

function getTimeBasedGreeting(firstName: string | undefined) {
  const hour = new Date().getHours();
  if (hour >= 0 && hour < 5) {
    return firstName ? t`Burning the midnight oil, ${firstName}?` : t`Burning the midnight oil?`;
  }
  if (hour >= 5 && hour < 12) {
    return firstName ? t`Good morning, ${firstName}` : t`Good morning`;
  }
  if (hour >= 12 && hour < 17) {
    return firstName ? t`Good afternoon, ${firstName}` : t`Good afternoon`;
  }
  return firstName ? t`Good evening, ${firstName}` : t`Good evening`;
}

function DashboardPage() {
  const userInfo = useUserInfo();

  return (
    <>
      <MainSideMenu />
      <AppLayout
        variant="full"
        browserTitle={t`Dashboard`}
        title={getTimeBasedGreeting(userInfo?.firstName)}
        subtitle={t`Here's your overview of what's happening.`}
      >
        <ComponentPreview />
      </AppLayout>
    </>
  );
}
