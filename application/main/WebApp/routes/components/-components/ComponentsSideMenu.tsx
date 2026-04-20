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
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail
} from "@repo/ui/components/Sidebar";
import { Link as RouterLink, useRouter } from "@tanstack/react-router";
import { BlocksIcon, ChevronRightIcon, LayersIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { PreviewAvatarMenu } from "./PreviewAvatarMenu";
import { chartsIcon as ChartsIcon, chartsLabel, componentsSections, examplesSections } from "./previewSections";

const normalizePath = (path: string): string => path.replace(/\/$/, "") || "/";

function useHash(defaultHash: string) {
  const [hash, setHash] = useState(() => window.location.hash.replace("#", "") || defaultHash);
  useEffect(() => {
    const handle = () => setHash(window.location.hash.replace("#", "") || defaultHash);
    window.addEventListener("hashchange", handle);
    return () => window.removeEventListener("hashchange", handle);
  }, [defaultHash]);
  return hash;
}

type CollapsibleKey = "components" | "examples";

export function ComponentsSideMenu() {
  const router = useRouter();
  const currentPath = normalizePath(router.state.location.pathname);
  const isComponentsPage = currentPath === "/components";
  const isExamplesPage = currentPath === "/components/examples";
  const isChartsPage = currentPath === "/components/charts";

  const componentsHash = useHash("controls");
  const examplesHash = useHash("dialogs");

  // Expanded by default when the user is on the matching page. Users can still toggle manually
  // via the chevron action. Deliberately not persisted — resets per session.
  const [expanded, setExpanded] = useState<Record<CollapsibleKey, boolean>>({
    components: isComponentsPage,
    examples: isExamplesPage
  });

  useEffect(() => {
    setExpanded((prev) => ({
      components: prev.components || isComponentsPage,
      examples: prev.examples || isExamplesPage
    }));
  }, [isComponentsPage, isExamplesPage]);

  const toggle = (key: CollapsibleKey) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

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
                <SidebarMenuButton asChild={true} isActive={isComponentsPage} tooltip={t`Components`}>
                  <RouterLink to="/components">
                    <BlocksIcon />
                    <span>
                      <Trans>Components</Trans>
                    </span>
                  </RouterLink>
                </SidebarMenuButton>
                <SidebarMenuAction
                  onClick={() => toggle("components")}
                  aria-label={expanded.components ? t`Collapse Components` : t`Expand Components`}
                  data-state={expanded.components ? "open" : "closed"}
                >
                  <ChevronRightIcon className="transition-transform duration-100 data-[state=open]:rotate-90" />
                </SidebarMenuAction>
                {expanded.components && (
                  <SidebarMenuSub>
                    {componentsSections.map(({ hash, label, icon: Icon }) => (
                      <SidebarMenuSubItem key={hash}>
                        <SidebarMenuSubButton asChild={true} isActive={isComponentsPage && componentsHash === hash}>
                          {isComponentsPage ? (
                            // Same-route hash change: use a native anchor so the browser updates
                            // window.location.hash and fires `hashchange`, which the content components listen for.
                            <a href={`#${hash}`}>
                              <Icon />
                              <span>{label}</span>
                            </a>
                          ) : (
                            <RouterLink to="/components" hash={hash}>
                              <Icon />
                              <span>{label}</span>
                            </RouterLink>
                          )}
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild={true} isActive={isExamplesPage} tooltip={t`Examples`}>
                  <RouterLink to="/components/examples">
                    <LayersIcon />
                    <span>
                      <Trans>Examples</Trans>
                    </span>
                  </RouterLink>
                </SidebarMenuButton>
                <SidebarMenuAction
                  onClick={() => toggle("examples")}
                  aria-label={expanded.examples ? t`Collapse Examples` : t`Expand Examples`}
                  data-state={expanded.examples ? "open" : "closed"}
                >
                  <ChevronRightIcon className="transition-transform duration-100 data-[state=open]:rotate-90" />
                </SidebarMenuAction>
                {expanded.examples && (
                  <SidebarMenuSub>
                    {examplesSections.map(({ hash, label, icon: Icon }) => (
                      <SidebarMenuSubItem key={hash}>
                        <SidebarMenuSubButton asChild={true} isActive={isExamplesPage && examplesHash === hash}>
                          {isExamplesPage ? (
                            <a href={`#${hash}`}>
                              <Icon />
                              <span>{label}</span>
                            </a>
                          ) : (
                            <RouterLink to="/components/examples" hash={hash}>
                              <Icon />
                              <span>{label}</span>
                            </RouterLink>
                          )}
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild={true} isActive={isChartsPage} tooltip={t`Charts`}>
                  <RouterLink to="/components/charts">
                    <ChartsIcon />
                    <span>{chartsLabel}</span>
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
