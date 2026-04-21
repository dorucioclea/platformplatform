import type { LucideIcon } from "lucide-react";

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
  SidebarMenuCollapsibleProvider,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebarMenuCollapsible
} from "@repo/ui/components/Sidebar";
import { Link as RouterLink, useRouter } from "@tanstack/react-router";
import { BlocksIcon, ChevronRightIcon, LayersIcon } from "lucide-react";
import { useEffect, useState } from "react";

import type { PreviewSection } from "./previewSections";

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

type CollapsibleMenuProps = Readonly<{
  groupKey: string;
  icon: LucideIcon;
  label: React.ReactNode;
  collapseLabel: string;
  expandLabel: string;
  tooltip: string;
  routePath: string;
  isOnPage: boolean;
  activeHash: string;
  sections: readonly PreviewSection[];
}>;

function CollapsibleMenu({
  groupKey,
  icon: Icon,
  label,
  collapseLabel,
  expandLabel,
  tooltip,
  routePath,
  isOnPage,
  activeHash,
  sections
}: CollapsibleMenuProps) {
  // Arriving at a matching page auto-expands this group (and auto-collapses any sibling).
  const { isExpanded, toggle, expand } = useSidebarMenuCollapsible(groupKey);
  useEffect(() => {
    if (isOnPage) {
      expand();
    }
  }, [isOnPage, expand]);

  return (
    <SidebarMenuItem>
      {/* Clicking the top-level button both navigates and expands the sub group. The route-change
          effect only fires on `isOnPage` transitions, so an explicit `expand()` on click also covers
          the "already on this page, user manually collapsed, clicks again" case. */}
      <SidebarMenuButton asChild={true} isActive={isOnPage} tooltip={tooltip} onClick={expand}>
        <RouterLink to={routePath}>
          <Icon />
          <span>{label}</span>
        </RouterLink>
      </SidebarMenuButton>
      <SidebarMenuAction onClick={toggle} aria-label={isExpanded ? collapseLabel : expandLabel}>
        <ChevronRightIcon className={`transition-transform duration-100 ${isExpanded ? "rotate-90" : ""}`} />
      </SidebarMenuAction>
      <SidebarMenuSub isExpanded={isExpanded}>
        {sections.map(({ hash, label: sectionLabel, icon: SectionIcon }) => (
          <SidebarMenuSubItem key={hash}>
            <SidebarMenuSubButton
              asChild={true}
              isActive={isOnPage && activeHash === hash}
              tooltip={{ children: sectionLabel }}
            >
              {isOnPage ? (
                // Same-route hash change: native anchor so the browser updates window.location.hash
                // and fires `hashchange`, which the content components listen for.
                <a href={`#${hash}`}>
                  <SectionIcon />
                  <span>{sectionLabel}</span>
                </a>
              ) : (
                <RouterLink to={routePath} hash={hash}>
                  <SectionIcon />
                  <span>{sectionLabel}</span>
                </RouterLink>
              )}
            </SidebarMenuSubButton>
          </SidebarMenuSubItem>
        ))}
      </SidebarMenuSub>
    </SidebarMenuItem>
  );
}

export function ComponentsSideMenu() {
  const router = useRouter();
  const currentPath = normalizePath(router.state.location.pathname);
  const isComponentsPage = currentPath === "/components";
  const isExamplesPage = currentPath === "/components/examples";
  const isChartsPage = currentPath === "/components/charts";

  const componentsHash = useHash("controls");
  const examplesHash = useHash("dialogs");

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
              <SidebarMenuCollapsibleProvider
                defaultExpanded={isComponentsPage ? "components" : isExamplesPage ? "examples" : null}
              >
                <CollapsibleMenu
                  groupKey="components"
                  icon={BlocksIcon}
                  label={<Trans>Components</Trans>}
                  collapseLabel={t`Collapse Components`}
                  expandLabel={t`Expand Components`}
                  tooltip={t`Components`}
                  routePath="/components"
                  isOnPage={isComponentsPage}
                  activeHash={componentsHash}
                  sections={componentsSections}
                />
                <CollapsibleMenu
                  groupKey="examples"
                  icon={LayersIcon}
                  label={<Trans>Examples</Trans>}
                  collapseLabel={t`Collapse Examples`}
                  expandLabel={t`Expand Examples`}
                  tooltip={t`Examples`}
                  routePath="/components/examples"
                  isOnPage={isExamplesPage}
                  activeHash={examplesHash}
                  sections={examplesSections}
                />
              </SidebarMenuCollapsibleProvider>

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
