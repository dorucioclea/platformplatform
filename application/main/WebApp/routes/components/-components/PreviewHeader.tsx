import { Trans } from "@lingui/react/macro";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage
} from "@repo/ui/components/Breadcrumb";
import { Link } from "@repo/ui/components/Link";
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
    <nav className="hidden w-full justify-between gap-2 sm:flex">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/" variant="secondary" underline={false} />}>
              <Trans>Home</Trans>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            {activeLabel ? (
              <BreadcrumbLink
                render={
                  <Link
                    href={sectionHref}
                    variant="secondary"
                    underline={false}
                    onClick={() => {
                      window.location.hash = "";
                    }}
                  />
                }
              >
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
      {rightContent && <span className="flex items-center gap-2">{rightContent}</span>}
    </nav>
  );
}
