import { Trans } from "@lingui/react/macro";
import { Kbd, KbdGroup } from "@repo/ui/components/Kbd";

export function KbdPreview() {
  return (
    <section className="flex flex-col gap-3">
      <h3>
        <Trans>Kbd</Trans>
      </h3>
      <p className="text-sm text-muted-foreground">
        <Trans>
          Inline keyboard hint. Use it to call out shortcuts in tooltips, menus, and command palettes. Compose multi-key
          combinations with KbdGroup so each key keeps its own visual chip.
        </Trans>
      </p>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
        <span className="flex items-center gap-2">
          <Trans>Single key</Trans>
          <Kbd>K</Kbd>
        </span>
        <span className="flex items-center gap-2">
          <Trans>Modifier combo</Trans>
          <KbdGroup>
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
        </span>
        <span className="flex items-center gap-2">
          <Trans>Long shortcut</Trans>
          <KbdGroup>
            <Kbd>Ctrl</Kbd>
            <Kbd>Shift</Kbd>
            <Kbd>P</Kbd>
          </KbdGroup>
        </span>
        <span className="flex items-center gap-2">
          <Trans>Inline tip:</Trans>
          <Trans>
            press <Kbd>?</Kbd> to view all shortcuts.
          </Trans>
        </span>
      </div>
    </section>
  );
}
