import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { LocaleSwitcher } from "@repo/infrastructure/translations/LocaleSwitcher";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage
} from "@repo/ui/components/Breadcrumb";
import { Link } from "@repo/ui/components/Link";
import { ThemeModeSelector } from "@repo/ui/theme/ThemeModeSelector";
import { useEffect, useState } from "react";

type PreviewHeaderProps = Readonly<{
  currentPage: "components" | "examples";
  tabLabels: Record<string, React.ReactNode>;
  defaultTab: string;
  rightContent?: React.ReactNode;
}>;

export function PreviewHeader({ currentPage, tabLabels, defaultTab, rightContent }: PreviewHeaderProps) {
  const [activeTab, setActiveTab] = useState(() => window.location.hash.replace("#", "") || defaultTab);

  useEffect(() => {
    const handleHashChange = () => setActiveTab(window.location.hash.replace("#", "") || defaultTab);
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [defaultTab]);

  const activeLabel = tabLabels[activeTab];
  const sectionHref = currentPage === "components" ? "/components" : "/components/examples";

  return (
    <nav className="mt-[-0.625rem] mb-3 hidden h-11 w-full items-center justify-between gap-2 sm:mt-[-0.875rem] sm:flex">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/" variant="secondary" underline={false} />}>
              <Trans>Home</Trans>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            {activeLabel ? (
              <BreadcrumbLink render={<Link href={sectionHref} variant="secondary" underline={false} />}>
                {currentPage === "components" ? <Trans>Components</Trans> : <Trans>Examples</Trans>}
              </BreadcrumbLink>
            ) : (
              <BreadcrumbPage>
                {currentPage === "components" ? <Trans>Components</Trans> : <Trans>Examples</Trans>}
              </BreadcrumbPage>
            )}
          </BreadcrumbItem>
          {activeLabel && (
            <BreadcrumbItem>
              <BreadcrumbPage>{activeLabel}</BreadcrumbPage>
            </BreadcrumbItem>
          )}
        </BreadcrumbList>
      </Breadcrumb>
      <span className="flex items-center gap-2">
        <ThemeModeSelector aria-label={t`Change theme`} />
        <LocaleSwitcher aria-label={t`Change language`} />
        {rightContent}
      </span>
    </nav>
  );
}
