import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { MultiSelect } from "@repo/ui/components/MultiSelect";
import {
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "@repo/ui/components/Select";
import { SelectField } from "@repo/ui/components/SelectField";
import { TimeZonePicker } from "@repo/ui/components/TimeZonePicker";
import { UtensilsCrossedIcon } from "lucide-react";
import { AreaChartIcon, BarChart3Icon, LineChartIcon, PieChartIcon, RadarIcon, TrendingUpIcon } from "lucide-react";
import { useState } from "react";

import type { ControlRowDerivedProps } from "./controlRowTypes";

import { ComboboxFields } from "./ComboboxFields";
import { tooltips } from "./controlTooltips";

export function SelectAndComboboxFields({
  suffix,
  label,
  tooltip,
  disabled,
  readOnly,
  showIcon,
  hasValues,
  placeholders,
  errorMessage
}: ControlRowDerivedProps) {
  const chartItems = useChartItems();
  const [selectedColor, setSelectedColor] = useState<string>(hasValues ? "bar" : "");
  const [selectedCharts, setSelectedCharts] = useState<string[]>(hasValues ? ["bar", "pie"] : []);
  const recipeGroups = [
    {
      cuisine: t`Italian`,
      recipes: [
        { value: "carbonara", label: t`Spaghetti carbonara` },
        { value: "margherita", label: t`Pizza margherita` },
        { value: "risotto", label: t`Risotto alla milanese` },
        { value: "lasagna", label: t`Lasagna bolognese` },
        { value: "osso-buco", label: t`Osso buco` },
        { value: "tiramisu", label: t`Tiramisu` }
      ]
    },
    {
      cuisine: t`Japanese`,
      recipes: [
        { value: "ramen", label: t`Tonkotsu ramen` },
        { value: "sushi", label: t`Nigiri sushi` },
        { value: "katsu", label: t`Chicken katsu` },
        { value: "tempura", label: t`Vegetable tempura` },
        { value: "okonomiyaki", label: t`Okonomiyaki` },
        { value: "yakitori", label: t`Yakitori skewers` }
      ]
    },
    {
      cuisine: t`Mexican`,
      recipes: [
        { value: "tacos", label: t`Tacos al pastor` },
        { value: "mole", label: t`Mole poblano` },
        { value: "enchiladas", label: t`Enchiladas verdes` },
        { value: "chiles-rellenos", label: t`Chiles rellenos` },
        { value: "pozole", label: t`Pozole rojo` }
      ]
    },
    {
      cuisine: t`French`,
      recipes: [
        { value: "boeuf-bourguignon", label: t`Boeuf bourguignon` },
        { value: "ratatouille", label: t`Ratatouille` },
        { value: "coq-au-vin", label: t`Coq au vin` },
        { value: "creme-brulee", label: t`Creme brulee` }
      ]
    },
    {
      cuisine: t`Indian`,
      recipes: [
        { value: "butter-chicken", label: t`Butter chicken` },
        { value: "biryani", label: t`Lamb biryani` },
        { value: "palak-paneer", label: t`Palak paneer` },
        { value: "dosa", label: t`Masala dosa` },
        { value: "rogan-josh", label: t`Rogan josh` }
      ]
    },
    {
      cuisine: t`Thai`,
      recipes: [
        { value: "pad-thai", label: t`Pad thai` },
        { value: "green-curry", label: t`Green curry` },
        { value: "tom-yum", label: t`Tom yum soup` },
        { value: "som-tam", label: t`Som tam salad` }
      ]
    }
  ];
  const allRecipes = recipeGroups.flatMap((group) => group.recipes);
  const [recipe, setRecipe] = useState<string | null>(hasValues ? "carbonara" : null);
  const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [timeZone, setTimeZone] = useState<string | null>(hasValues ? browserTimeZone : null);
  const chartSelectItems = [
    { value: "bar", label: t`Bar chart`, icon: <BarChart3Icon /> },
    { value: "line", label: t`Line chart`, icon: <LineChartIcon /> },
    { value: "pie", label: t`Pie chart`, icon: <PieChartIcon /> }
  ];
  const selectedChartIcon = chartSelectItems.find((i) => i.value === selectedColor)?.icon;
  const hasCharts = selectedCharts.length > 0;

  return (
    <>
      <SelectField
        label={label ? t`Select` : undefined}
        tooltip={tooltip ? tooltips.select : undefined}
        name={`select-${suffix}`}
        items={chartSelectItems}
        value={selectedColor || null}
        onValueChange={(value) => setSelectedColor(value ?? "")}
        isDisabled={disabled}
        isReadOnly={readOnly}
        errorMessage={errorMessage}
      >
        <SelectTrigger>
          {showIcon && (selectedChartIcon ? selectedChartIcon : placeholders ? <TrendingUpIcon /> : null)}
          <SelectValue placeholder={placeholders ? t`Pick a chart` : undefined} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={null}>
            <span className="text-muted-foreground">
              <Trans>None</Trans>
            </span>
          </SelectItem>
          {chartSelectItems.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {showIcon ? item.icon : null}
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </SelectField>
      <SelectField
        label={label ? t`Select with groups` : undefined}
        tooltip={tooltip ? tooltips.selectWithGroups : undefined}
        name={`recipe-${suffix}`}
        items={allRecipes}
        value={recipe}
        onValueChange={(value) => setRecipe(value ?? null)}
        isDisabled={disabled}
        isReadOnly={readOnly}
        errorMessage={errorMessage}
      >
        <SelectTrigger>
          {showIcon && (recipe || placeholders) ? <UtensilsCrossedIcon /> : null}
          <SelectValue placeholder={placeholders ? t`Pick a recipe` : undefined} />
        </SelectTrigger>
        <SelectContent>
          {recipeGroups.map(({ cuisine, recipes }) => (
            <SelectGroup key={cuisine} className="p-0">
              <SelectLabel className="sticky -top-1 z-10 -mx-1 bg-muted px-3 pt-2.5 pb-1.5 font-semibold text-foreground">
                {cuisine}
              </SelectLabel>
              {recipes.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </SelectField>
      <TimeZonePicker
        label={label ? t`Time zone` : undefined}
        tooltip={tooltip ? tooltips.timeZonePicker : undefined}
        name={`timezone-${suffix}`}
        placeholder={placeholders ? undefined : ""}
        startIcon={showIcon ? undefined : null}
        value={timeZone}
        onValueChange={setTimeZone}
        isDisabled={disabled}
        isReadOnly={readOnly}
        errorMessage={errorMessage}
      />
      <MultiSelect
        label={label ? t`Multi select` : undefined}
        tooltip={tooltip ? tooltips.multiSelect : undefined}
        name={`multi-${suffix}`}
        placeholder={placeholders ? t`Select charts` : undefined}
        startIcon={showIcon && (hasCharts || placeholders) ? <TrendingUpIcon /> : undefined}
        items={showIcon ? chartItems : chartItems.map(({ icon: _, ...rest }) => rest)}
        value={selectedCharts}
        onChange={setSelectedCharts}
        isDisabled={disabled}
        isReadOnly={readOnly}
        errorMessage={errorMessage}
      />
      <ComboboxFields
        suffix={suffix}
        label={label}
        tooltip={tooltip}
        disabled={disabled}
        readOnly={readOnly}
        showIcon={showIcon}
        hasValues={hasValues}
        placeholders={placeholders}
        errorMessage={errorMessage}
        chartItems={chartItems}
      />
    </>
  );
}

export function useChartItems() {
  return [
    { id: "bar", label: t`Bar chart`, icon: <BarChart3Icon /> },
    { id: "line", label: t`Line chart`, icon: <LineChartIcon /> },
    { id: "pie", label: t`Pie chart`, icon: <PieChartIcon /> },
    { id: "area", label: t`Area chart`, icon: <AreaChartIcon /> },
    { id: "radar", label: t`Radar chart`, icon: <RadarIcon /> }
  ];
}
