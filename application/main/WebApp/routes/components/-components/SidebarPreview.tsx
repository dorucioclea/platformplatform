import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail
} from "@repo/ui/components/Sidebar";
import {
  Building2Icon,
  HomeIcon,
  MonitorSmartphoneIcon,
  SettingsIcon,
  SlidersHorizontalIcon,
  UserIcon,
  UsersIcon
} from "lucide-react";

// CSS containment via transform makes `position: fixed` inside Sidebar anchor to this preview
// container instead of the viewport — lets us show the full Sidebar UX inside a bounded preview.
export function SidebarPreview() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        <Trans>
          Full Sidebar shell inside a contained preview. Click the floating chevron on the edge to toggle icon mode.
          Drag the edge to continuously resize. Hover to reveal the toggle.
        </Trans>
      </p>
      <div
        className="relative h-[30rem] overflow-hidden rounded-lg border bg-background"
        style={{ transform: "translateZ(0)" }}
      >
        <SidebarProvider defaultOpen={true} className="h-full min-h-0!">
          <Sidebar collapsible="icon">
            <SidebarHeader>
              <div className="flex items-center gap-2 px-2 py-1.5 text-sm font-semibold">
                <Building2Icon className="size-5 shrink-0" />
                <span className="group-data-[collapsible=icon]:hidden">
                  <Trans>Preview app</Trans>
                </span>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>
                  <Trans>User</Trans>
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton tooltip={t`Profile`} isActive={true}>
                        <UserIcon />
                        <span>
                          <Trans>Profile</Trans>
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton tooltip={t`Preferences`}>
                        <SlidersHorizontalIcon />
                        <span>
                          <Trans>Preferences</Trans>
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton tooltip={t`Sessions`}>
                        <MonitorSmartphoneIcon />
                        <span>
                          <Trans>Sessions</Trans>
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
              <SidebarGroup>
                <SidebarGroupLabel>
                  <Trans>Account</Trans>
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton tooltip={t`Overview`}>
                        <HomeIcon />
                        <span>
                          <Trans>Overview</Trans>
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton tooltip={t`Users`}>
                        <UsersIcon />
                        <span>
                          <Trans>Users</Trans>
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton tooltip={t`Settings`}>
                        <SettingsIcon />
                        <span>
                          <Trans>Settings</Trans>
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
              <div className="px-2 py-1.5 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
                <Trans>Sidebar footer</Trans>
              </div>
            </SidebarFooter>
            <SidebarRail />
          </Sidebar>
          <SidebarInset className="h-full overflow-auto p-6">
            <h3>
              <Trans>Main content</Trans>
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              <Trans>
                The sidebar on the left persists its state and width in localStorage (rem-based, not cookies). Click the
                floating chevron to toggle icon collapse, or drag the edge to resize continuously between 14rem and
                25rem.
              </Trans>
            </p>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </div>
  );
}
