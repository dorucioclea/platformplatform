import { AccordionPreview } from "./AccordionPreview";
import { DrawerPreview } from "./DrawerPreview";

export function OverlaysPreview() {
  return (
    <div className="flex flex-col gap-12">
      <AccordionPreview />
      <DrawerPreview />
    </div>
  );
}
