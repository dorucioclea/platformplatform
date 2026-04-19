import { Trans } from "@lingui/react/macro";
import { Progress } from "@repo/ui/components/Progress";

export function ProgressPreview() {
  return (
    <section className="flex flex-col gap-3">
      <h3>
        <Trans>Progress</Trans>
      </h3>
      <p className="text-sm text-muted-foreground">
        <Trans>
          Linear progress bar for determinate, foreground tasks like uploads or onboarding completion. Use Spinner for
          indeterminate or background loading.
        </Trans>
      </p>
      <div className="flex max-w-md flex-col gap-4">
        <Progress value={25} />
        <Progress value={60} />
        <Progress value={100} />
      </div>
    </section>
  );
}
