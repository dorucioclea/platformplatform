import { t } from "@lingui/core/macro";
import { cva, type VariantProps } from "class-variance-authority";
import { ChevronLeftIcon, PanelLeftIcon } from "lucide-react";
import * as React from "react";

import { useViewportResize } from "../hooks/useViewportResize";
import { cn } from "../utils";
import {
  getRootFontSize,
  SIDE_MENU_COLLAPSED_WIDTH_REM,
  SIDE_MENU_DEFAULT_WIDTH_REM,
  SIDE_MENU_MAX_WIDTH_REM,
  SIDE_MENU_MIN_WIDTH_REM
} from "../utils/responsive";
import { Button } from "./Button";
import { Separator } from "./Separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "./Sheet";
import { Skeleton } from "./Skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./Tooltip";

// Width is in rem (persisted to localStorage as a rem number).
// Icon-collapsed width comes from responsive.ts so it stays in sync with the old SideMenu migration.
const SIDEBAR_WIDTH_MOBILE_REM = 18;
const SIDEBAR_KEYBOARD_SHORTCUT = "b";
const SIDEBAR_STORAGE_KEY_COLLAPSED = "side-menu-collapsed"; // "true" means collapsed
const SIDEBAR_STORAGE_KEY_WIDTH = "side-menu-size"; // rem number
const DRAG_THRESHOLD_PX = 5;

// Minimal `asChild` helper. Clones a single child and merges className and other props.
// Lets callers pass router `<Link>` or other elements where ShadCN uses `asChild`.
type SlotProps = React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode };
function Slot({ children, ...props }: SlotProps) {
  const child = React.Children.only(children);
  if (!React.isValidElement<React.HTMLAttributes<HTMLElement>>(child)) {
    return null;
  }
  const childProps = child.props;
  return React.cloneElement(child, {
    ...childProps,
    ...props,
    className: cn(childProps.className, props.className)
  });
}

type SidebarContextProps = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
  wrapperRef: React.RefObject<HTMLDivElement | null>;
  setWidthRem: (rem: number) => void;
};

const SidebarContext = React.createContext<SidebarContextProps | null>(null);

// Legacy shims matching the old SideMenu.tsx context surface.
// Federated modules (UserMenu, MobileMenu, MobileMenuContent) still import these names.
// Provided by SidebarProvider with values derived from useSidebar state — no consumer changes needed.
const collapsedContext = React.createContext(false);
const overlayContext = React.createContext<{ isOpen: boolean; close: () => void } | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return context;
}

// Safe variant for components that may render with or without a SidebarProvider ancestor
// (e.g. AppLayout, which still supports the legacy SideMenu until all SCSs are migrated).
function useSidebarSafe() {
  return React.useContext(SidebarContext);
}

function readInitialOpen(defaultOpen: boolean) {
  if (typeof window === "undefined") {
    return defaultOpen;
  }
  const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY_COLLAPSED);
  if (stored === null) {
    return defaultOpen;
  }
  return stored !== "true";
}

function readInitialWidthRem() {
  if (typeof window === "undefined") {
    return SIDE_MENU_DEFAULT_WIDTH_REM;
  }
  const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY_WIDTH);
  if (stored === null) {
    return SIDE_MENU_DEFAULT_WIDTH_REM;
  }
  const parsed = Number.parseFloat(stored);
  if (Number.isNaN(parsed)) {
    return SIDE_MENU_DEFAULT_WIDTH_REM;
  }
  return Math.min(Math.max(parsed, SIDE_MENU_MIN_WIDTH_REM), SIDE_MENU_MAX_WIDTH_REM);
}

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const isMobile = useViewportResize();
  const [openMobile, setOpenMobile] = React.useState(false);
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  const [internalOpen, setInternalOpen] = React.useState(() => readInitialOpen(defaultOpen));
  const open = openProp ?? internalOpen;
  const setOpen = React.useCallback(
    (value: boolean | ((prev: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(openState);
      } else {
        setInternalOpen(openState);
      }
      localStorage.setItem(SIDEBAR_STORAGE_KEY_COLLAPSED, String(!openState));
    },
    [setOpenProp, open]
  );

  const toggleSidebar = React.useCallback(() => {
    if (isMobile) {
      setOpenMobile((prev) => !prev);
    } else {
      setOpen((prev) => !prev);
    }
  }, [isMobile, setOpen]);

  const setWidthRem = React.useCallback((rem: number) => {
    const clamped = Math.min(Math.max(rem, SIDE_MENU_MIN_WIDTH_REM), SIDE_MENU_MAX_WIDTH_REM);
    wrapperRef.current?.style.setProperty("--sidebar-width", `${clamped}rem`);
    localStorage.setItem(SIDEBAR_STORAGE_KEY_WIDTH, String(clamped));
  }, []);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  const state = open ? "expanded" : "collapsed";

  const contextValue = React.useMemo<SidebarContextProps>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
      wrapperRef,
      setWidthRem
    }),
    [state, open, setOpen, isMobile, openMobile, toggleSidebar, setWidthRem]
  );

  const initialWidthRem = React.useMemo(readInitialWidthRem, []);

  const overlayValue = React.useMemo(() => ({ isOpen: openMobile, close: () => setOpenMobile(false) }), [openMobile]);

  return (
    <SidebarContext value={contextValue}>
      <collapsedContext.Provider value={state === "collapsed"}>
        <overlayContext.Provider value={overlayValue}>
          <TooltipProvider delay={0}>
            <div
              ref={wrapperRef}
              data-slot="sidebar-wrapper"
              style={
                {
                  "--sidebar-width": `${initialWidthRem}rem`,
                  "--sidebar-width-icon": `${SIDE_MENU_COLLAPSED_WIDTH_REM}rem`,
                  ...style
                } as React.CSSProperties
              }
              className={cn(
                "group/sidebar-wrapper flex min-h-svh w-full has-data-[variant=inset]:bg-sidebar",
                className
              )}
              {...props}
            >
              {children}
            </div>
          </TooltipProvider>
        </overlayContext.Provider>
      </collapsedContext.Provider>
    </SidebarContext>
  );
}

function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "icon",
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  side?: "left" | "right";
  variant?: "sidebar" | "floating" | "inset";
  collapsible?: "offcanvas" | "icon" | "none";
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

  if (collapsible === "none") {
    return (
      <div
        data-slot="sidebar"
        className={cn("flex h-full w-(--sidebar-width) flex-col bg-sidebar text-sidebar-foreground", className)}
        {...props}
      >
        {children}
      </div>
    );
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent
          data-sidebar="sidebar"
          data-slot="sidebar"
          data-mobile="true"
          className="w-[var(--sidebar-width)] bg-sidebar p-0 text-sidebar-foreground data-[side=left]:sm:max-w-none data-[side=right]:sm:max-w-none [&>button]:hidden"
          style={{ "--sidebar-width": `${SIDEBAR_WIDTH_MOBILE_REM}rem` } as React.CSSProperties}
          side={side}
          showCloseButton={false}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>{t`Sidebar`}</SheetTitle>
            <SheetDescription>{t`Displays the mobile sidebar.`}</SheetDescription>
          </SheetHeader>
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      className="group peer hidden text-sidebar-foreground sm:block"
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-variant={variant}
      data-side={side}
      data-slot="sidebar"
    >
      {/* Placeholder stays at icon-rail width so the expanded sidebar always OVERLAYS content. */}
      <div
        data-slot="sidebar-gap"
        className={cn(
          "relative w-(--sidebar-width-icon) bg-transparent",
          "group-data-[collapsible=offcanvas]:w-0",
          "group-data-[side=right]:rotate-180"
        )}
      />
      <div
        data-slot="sidebar-container"
        className={cn(
          "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-100 ease-linear sm:flex",
          side === "left"
            ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
            : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
          variant === "floating" || variant === "inset"
            ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+0.125rem)]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l",
          className
        )}
        {...props}
      >
        <div
          data-sidebar="sidebar"
          data-slot="sidebar-inner"
          className="flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow-sm"
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function SidebarTrigger({ className, onClick, ...props }: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar();
  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon"
      className={cn("size-7", className)}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      aria-label={t`Toggle sidebar`}
      {...props}
    >
      <PanelLeftIcon />
    </Button>
  );
}

// Custom rail: continuous drag to resize when expanded, click toggles collapse/expand.
// A floating chevron button reveals on hover or focus (matches current SideMenu UX).
function SidebarRail({ className, ...props }: React.ComponentProps<"button">) {
  const { state, toggleSidebar, setWidthRem, wrapperRef } = useSidebar();
  const dragStartRef = React.useRef<{ x: number; widthRem: number } | null>(null);
  const draggedRef = React.useRef(false);

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    draggedRef.current = false;

    // Only capture drag when expanded. Collapsed rail only toggles.
    if (state !== "expanded") {
      toggleSidebar();
      return;
    }

    const currentWidthRaw = wrapperRef.current?.style.getPropertyValue("--sidebar-width");
    const currentWidthRem = currentWidthRaw ? Number.parseFloat(currentWidthRaw) : SIDE_MENU_DEFAULT_WIDTH_REM;
    dragStartRef.current = { x: event.clientX, widthRem: currentWidthRem };
    document.body.style.cursor = "ew-resize";

    const handleMove = (moveEvent: PointerEvent) => {
      if (!dragStartRef.current) {
        return;
      }
      const deltaPx = moveEvent.clientX - dragStartRef.current.x;
      if (!draggedRef.current && Math.abs(deltaPx) > DRAG_THRESHOLD_PX) {
        draggedRef.current = true;
      }
      if (!draggedRef.current) {
        return;
      }
      const deltaRem = deltaPx / getRootFontSize();
      setWidthRem(dragStartRef.current.widthRem + deltaRem);
    };

    const handleUp = () => {
      document.body.style.cursor = "";
      document.removeEventListener("pointermove", handleMove);
      document.removeEventListener("pointerup", handleUp);
      document.removeEventListener("pointercancel", handleUp);
      if (!draggedRef.current) {
        toggleSidebar();
      }
      dragStartRef.current = null;
    };

    document.addEventListener("pointermove", handleMove);
    document.addEventListener("pointerup", handleUp);
    document.addEventListener("pointercancel", handleUp);
  };

  return (
    <button
      data-sidebar="rail"
      data-slot="sidebar-rail"
      aria-label={t`Toggle sidebar`}
      tabIndex={-1}
      onPointerDown={handlePointerDown}
      title={t`Toggle sidebar`}
      className={cn(
        "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear sm:flex",
        "group-data-[side=left]:-right-4 group-data-[side=right]:left-0",
        "after:absolute after:inset-y-0 after:left-1/2 after:w-[0.125rem] hover:after:bg-sidebar-border",
        "group-data-[state=collapsed]:cursor-pointer group-data-[state=expanded]:cursor-ew-resize",
        "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full hover:group-data-[collapsible=offcanvas]:bg-sidebar",
        "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
        "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
        className
      )}
      {...props}
    >
      <ChevronLeftIcon
        aria-hidden="true"
        className={cn(
          // Align the floating chevron with the boundary between the header and the menu items
          // (5rem — SidebarHeader height). Matches the old SideMenu toggle position.
          "pointer-events-none absolute top-[var(--side-menu-collapsed-width)] right-0 size-6 translate-x-1/2 -translate-y-1/2 rounded-full border border-border bg-background p-0.5 text-foreground opacity-0 shadow-sm transition-opacity duration-100",
          "group-focus-within/sidebar-wrapper:opacity-100 group-hover/sidebar-wrapper:opacity-100",
          "group-data-[state=collapsed]:rotate-180"
        )}
      />
    </button>
  );
}

// SidebarInset is the main content area. Its margin-left follows the sidebar's collapsed/expanded state
// via peer-data selectors on the sibling <Sidebar>. When sidebar is expanded, main sits to its right;
// when collapsed, main shifts to sit next to the icon rail. Transitions are 200ms to match sidebar.
function SidebarInset({ className, ...props }: React.ComponentProps<"main">) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn(
        "relative flex w-full flex-1 flex-col bg-background",
        "sm:peer-data-[variant=inset]:m-2 sm:peer-data-[variant=inset]:ml-0 sm:peer-data-[variant=inset]:rounded-xl sm:peer-data-[variant=inset]:shadow-sm sm:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2",
        className
      )}
      {...props}
    />
  );
}

function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-header"
      data-sidebar="header"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  );
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-footer"
      data-sidebar="footer"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  );
}

function SidebarSeparator({ className, ...props }: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="sidebar-separator"
      data-sidebar="separator"
      className={cn("mx-2 w-auto bg-sidebar-border", className)}
      {...props}
    />
  );
}

function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-content"
      data-sidebar="content"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        className
      )}
      {...props}
    />
  );
}

function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group"
      data-sidebar="group"
      className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
      {...props}
    />
  );
}

function SidebarGroupLabel({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      data-slot="sidebar-group-label"
      data-sidebar="group-label"
      className={cn(
        "flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 uppercase outline-ring transition-[margin,opacity] duration-100 ease-linear focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 [&>svg]:size-4 [&>svg]:shrink-0",
        "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
        className
      )}
      {...props}
    />
  );
}

function SidebarGroupAction({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="sidebar-group-action"
      data-sidebar="group-action"
      className={cn(
        "absolute top-3.5 right-3 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 [&>svg]:size-4 [&>svg]:shrink-0",
        "after:absolute after:-inset-2 sm:after:hidden",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  );
}

function SidebarGroupContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group-content"
      data-sidebar="group-content"
      className={cn("w-full text-sm", className)}
      {...props}
    />
  );
}

function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu"
      data-sidebar="menu"
      className={cn("flex w-full min-w-0 flex-col gap-1", className)}
      {...props}
    />
  );
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-item"
      data-sidebar="menu-item"
      className={cn(
        // Active indicator: a vertical bar flush with the sidebar's left edge when any descendant
        // button carries [data-active=true]. `-left-2` reaches past the SidebarGroup's 0.5rem padding.
        "group/menu-item relative before:pointer-events-none before:absolute before:top-1/2 before:-left-2 before:h-6 before:w-1 before:-translate-y-1/2 before:rounded-r-sm before:bg-primary before:opacity-0 has-[[data-active=true]]:before:opacity-100",
        className
      )}
      {...props}
    />
  );
}

// Diverges from stock ShadCN:
// - Apple HIG: uses --control-height (38px desktop / 44px mobile) instead of h-8.
// - Collapsed: keeps the SAME height as expanded so icons stay at the exact same vertical
//   position when the sidebar collapses. Only the label hides, icon centers.
// - Icon size: size-5 matches the old SideMenu visual language.
// - Active indicator: ::before pseudo-element renders a vertical bar at the sidebar's left edge
//   (-0.5rem from the item, reaching past the SidebarGroup's 0.5rem padding).
const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full cursor-pointer items-center gap-4 overflow-hidden rounded-md px-3 text-left text-sm outline-ring group-has-data-[sidebar=menu-action]/menu-item:pr-8 group-data-[collapsible=icon]:justify-center hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground [&>span:last-child]:truncate group-data-[collapsible=icon]:[&>span:last-child]:hidden [&>svg]:size-5 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline:
          "bg-background shadow-[0_0_0_0.0625rem_var(--sidebar-border)] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_0.0625rem_var(--sidebar-accent)]"
      },
      size: {
        default: "h-[var(--control-height)] text-sm",
        sm: "h-[var(--control-height-sm)] text-xs",
        lg: "h-[var(--control-height-lg)] text-sm"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

function SidebarMenuButton({
  asChild = false,
  isActive = false,
  variant = "default",
  size = "default",
  tooltip,
  className,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean;
  isActive?: boolean;
  tooltip?: string | React.ComponentProps<typeof TooltipContent>;
} & VariantProps<typeof sidebarMenuButtonVariants>) {
  const Comp = asChild ? Slot : "button";
  const { isMobile, state } = useSidebar();

  const button = (
    <Comp
      data-slot="sidebar-menu-button"
      data-sidebar="menu-button"
      data-size={size}
      data-active={isActive}
      className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
      {...props}
    />
  );

  if (!tooltip) {
    return button;
  }

  // When sidebar is collapsed to icons on desktop, show the menu label in a tooltip.
  // Our BaseUI Tooltip has no `asChild`: use the `render` prop pattern on the trigger.
  const tooltipProps = typeof tooltip === "string" ? { children: tooltip } : tooltip;
  const hideTooltip = state !== "collapsed" || isMobile;

  return (
    <Tooltip>
      <TooltipTrigger render={button} />
      {!hideTooltip && <TooltipContent side="right" align="center" {...tooltipProps} />}
    </Tooltip>
  );
}

function SidebarMenuAction({
  className,
  asChild = false,
  showOnHover = false,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean;
  showOnHover?: boolean;
}) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="sidebar-menu-action"
      data-sidebar="menu-action"
      className={cn(
        "absolute top-1.5 right-1 flex aspect-square w-5 cursor-pointer items-center justify-center rounded-md p-0 text-sidebar-foreground outline-ring transition-transform peer-hover/menu-button:text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 [&>svg]:size-4 [&>svg]:shrink-0",
        "after:absolute after:-inset-2 sm:after:hidden",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        showOnHover &&
          "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground data-[state=open]:opacity-100 sm:opacity-0",
        className
      )}
      {...props}
    />
  );
}

function SidebarMenuBadge({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-menu-badge"
      data-sidebar="menu-badge"
      className={cn(
        "pointer-events-none absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium text-sidebar-foreground tabular-nums select-none",
        "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  );
}

function SidebarMenuSkeleton({
  className,
  showIcon = false,
  ...props
}: React.ComponentProps<"div"> & {
  showIcon?: boolean;
}) {
  const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`;
  }, []);

  return (
    <div
      data-slot="sidebar-menu-skeleton"
      data-sidebar="menu-skeleton"
      className={cn("flex h-8 items-center gap-2 rounded-md px-2", className)}
      {...props}
    >
      {showIcon && <Skeleton className="size-4 rounded-md" data-sidebar="menu-skeleton-icon" />}
      <Skeleton
        className="h-4 max-w-(--skeleton-width) flex-1"
        data-sidebar="menu-skeleton-text"
        style={{ "--skeleton-width": width } as React.CSSProperties}
      />
    </div>
  );
}

function SidebarMenuSub({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu-sub"
      data-sidebar="menu-sub"
      className={cn(
        "mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  );
}

function SidebarMenuSubItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-sub-item"
      data-sidebar="menu-sub-item"
      className={cn("group/menu-sub-item relative", className)}
      {...props}
    />
  );
}

function SidebarMenuSubButton({
  asChild = false,
  size = "md",
  isActive = false,
  className,
  ...props
}: React.ComponentProps<"a"> & {
  asChild?: boolean;
  size?: "sm" | "md";
  isActive?: boolean;
}) {
  const Comp = asChild ? Slot : "a";
  return (
    <Comp
      data-slot="sidebar-menu-sub-button"
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        "flex h-7 min-w-0 -translate-x-px cursor-pointer items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground outline-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground",
        "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  );
}

export {
  collapsedContext,
  overlayContext,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
  useSidebarSafe
};
