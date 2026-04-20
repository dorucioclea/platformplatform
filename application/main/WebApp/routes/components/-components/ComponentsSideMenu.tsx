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
import { BlocksIcon, LayersIcon } from "lucide-react";

import { PreviewAvatarMenu } from "./PreviewAvatarMenu";

const normalizePath = (path: string): string => path.replace(/\/$/, "") || "/";

export function ComponentsSideMenu() {
  const router = useRouter();
  const currentPath = normalizePath(router.state.location.pathname);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <PreviewAvatarMenu />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <Trans>Navigation</Trans>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild={true} isActive={currentPath === "/components"} tooltip={t`Components`}>
                  <RouterLink to="/components">
                    <BlocksIcon />
                    <span>
                      <Trans>Components</Trans>
                    </span>
                  </RouterLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild={true}
                  isActive={currentPath === "/components/examples"}
                  tooltip={t`Examples`}
                >
                  <RouterLink to="/components/examples">
                    <LayersIcon />
                    <span>
                      <Trans>Examples</Trans>
                    </span>
                  </RouterLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
