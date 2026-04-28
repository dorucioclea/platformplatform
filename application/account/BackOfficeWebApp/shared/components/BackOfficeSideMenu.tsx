import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail
} from "@repo/ui/components/Sidebar";
import { Link as RouterLink, useRouter } from "@tanstack/react-router";
import { Building2Icon, FlagIcon, HomeIcon, LifeBuoyIcon, ListIcon, UsersIcon } from "lucide-react";

import logoMark from "@/shared/images/logo-mark.svg";

const normalizePath = (path: string): string => path.replace(/\/$/, "") || "/";

export function BackOfficeSideMenu() {
  const router = useRouter();
  const currentPath = normalizePath(router.state.location.pathname);

  return (
    <Sidebar collapsible="icon">
      <nav className="contents" aria-label={t`Main navigation`}>
        <SidebarHeader>
          <div className="flex items-center gap-3 pl-[0.875rem] text-sm font-semibold">
            <img className="size-9 shrink-0" src={logoMark} alt={t`PlatformPlatform logo`} />
            <span className="truncate group-data-[collapsible=icon]:hidden">
              <Trans>Back Office</Trans>
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>
              <Trans>Navigation</Trans>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild={true} isActive={currentPath === "/"} tooltip={t`Dashboard`}>
                    <RouterLink to="/">
                      <HomeIcon />
                      <span>
                        <Trans>Dashboard</Trans>
                      </span>
                    </RouterLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>
              <Trans>Coming soon</Trans>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton disabled={true} tooltip={t`Tenants (coming soon)`}>
                    <Building2Icon />
                    <span>
                      <Trans>Tenants</Trans>
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton disabled={true} tooltip={t`Users (coming soon)`}>
                    <UsersIcon />
                    <span>
                      <Trans>Users</Trans>
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton disabled={true} tooltip={t`Feature flags (coming soon)`}>
                    <FlagIcon />
                    <span>
                      <Trans>Feature flags</Trans>
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton disabled={true} tooltip={t`Support (coming soon)`}>
                    <LifeBuoyIcon />
                    <span>
                      <Trans>Support</Trans>
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton disabled={true} tooltip={t`Wait list (coming soon)`}>
                    <ListIcon />
                    <span>
                      <Trans>Wait list</Trans>
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </nav>
      <SidebarRail />
    </Sidebar>
  );
}
