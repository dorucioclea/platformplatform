import { cn } from "../utils";

export interface InlineFieldGroupProps extends React.ComponentProps<"div"> {
  alignWithLabel?: boolean;
}

export function InlineFieldGroup({ alignWithLabel, className, ...props }: InlineFieldGroupProps) {
  return <div className={cn("flex flex-wrap gap-x-6", alignWithLabel && "mt-[1.953rem]", className)} {...props} />;
}
