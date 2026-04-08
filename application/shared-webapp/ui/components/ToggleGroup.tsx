import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group";
import { type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../utils";
import { toggleVariants } from "./Toggle";

type ToggleGroupContextValue = VariantProps<typeof toggleVariants> & {
  spacing?: number;
  orientation?: "horizontal" | "vertical";
};

const ToggleGroupContext = React.createContext<ToggleGroupContextValue>({
  size: "default",
  variant: "default",
  spacing: 0,
  orientation: "horizontal"
});

function ToggleGroup({
  className,
  variant,
  size,
  spacing = 0,
  orientation = "horizontal",
  children,
  ...props
}: ToggleGroupPrimitive.Props &
  VariantProps<typeof toggleVariants> & {
    spacing?: number;
    orientation?: "horizontal" | "vertical";
  }) {
  const childArray = React.Children.toArray(children);

  return (
    <ToggleGroupPrimitive
      data-slot="toggle-group"
      className={cn(
        "inline-flex w-fit items-center rounded-md",
        orientation === "vertical" ? "flex-col items-stretch" : "flex-row",
        className
      )}
      style={spacing > 0 ? { gap: `${spacing * 0.25}rem` } : undefined}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size, spacing, orientation }}>
        {childArray.map((child, index) => {
          if (!React.isValidElement(child)) {
            return child;
          }
          const isFirst = index === 0;
          const isLast = index === childArray.length - 1;
          return React.cloneElement(child as React.ReactElement<{ "data-position"?: string }>, {
            key: child.key ?? index,
            "data-position": isFirst && isLast ? "only" : isFirst ? "first" : isLast ? "last" : "middle"
          });
        })}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive>
  );
}

function ToggleGroupItem({
  className,
  children,
  variant: variantProp,
  size: sizeProp,
  ...props
}: TogglePrimitive.Props & VariantProps<typeof toggleVariants> & { "data-position"?: string }) {
  const context = React.useContext(ToggleGroupContext);
  const variant = context.variant ?? variantProp;
  const size = context.size ?? sizeProp;
  const spacing = context.spacing ?? 0;
  const orientation = context.orientation ?? "horizontal";
  const position = props["data-position"];
  const isFirst = position === "first" || position === "only";
  const isLast = position === "last" || position === "only";
  const isHorizontal = orientation === "horizontal";
  const isConnected = spacing === 0;

  return (
    <TogglePrimitive
      data-slot="toggle-group-item"
      className={cn(
        toggleVariants({ variant, size }),
        "shrink-0 focus:z-10 focus-visible:z-10",
        isConnected && [
          "px-2",
          isHorizontal && !isFirst && "rounded-l-none",
          isHorizontal && !isLast && "rounded-r-none",
          !isHorizontal && !isFirst && "rounded-t-none",
          !isHorizontal && !isLast && "rounded-b-none",
          variant === "outline" && isHorizontal && !isFirst && "border-l-0",
          variant === "outline" && !isHorizontal && !isFirst && "border-t-0"
        ],
        "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground",
        className
      )}
      {...props}
    >
      {children}
    </TogglePrimitive>
  );
}

export { ToggleGroup, ToggleGroupItem };
