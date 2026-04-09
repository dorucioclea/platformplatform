import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { MenuButton, SideMenu, SideMenuSeparator } from "@repo/ui/components/SideMenu";
import { BlocksIcon, LayersIcon } from "lucide-react";

export function ComponentsSideMenu() {
  return (
    <SideMenu sidebarToggleAriaLabel={t`Toggle sidebar`} mobileMenuAriaLabel={t`Open navigation menu`}>
      <SideMenuSeparator>
        <Trans>Navigation</Trans>
      </SideMenuSeparator>

      <MenuButton icon={BlocksIcon} label={t`Components`} href="/components" />
      <MenuButton icon={LayersIcon} label={t`Examples`} href="/components/examples" />
    </SideMenu>
  );
}
