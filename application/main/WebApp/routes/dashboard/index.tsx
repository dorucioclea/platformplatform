import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { useUserInfo } from "@repo/infrastructure/auth/hooks";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/Alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogBody,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@repo/ui/components/AlertDialog";
import { AppLayout } from "@repo/ui/components/AppLayout";
import { Badge } from "@repo/ui/components/Badge";
import { Button } from "@repo/ui/components/Button";
import { Checkbox } from "@repo/ui/components/Checkbox";
import { DateField } from "@repo/ui/components/DateField";
import { DatePicker } from "@repo/ui/components/DatePicker";
import { DateRangePicker } from "@repo/ui/components/DateRangePicker";
import {
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@repo/ui/components/Dialog";
import { Dialog } from "@repo/ui/components/Dialog";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/components/Card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@repo/ui/components/Empty";
import { Field, FieldContent, FieldDescription, FieldLabel, FieldTitle } from "@repo/ui/components/Field";
import { MultiSelect } from "@repo/ui/components/MultiSelect";
import { NumberField } from "@repo/ui/components/NumberField";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/RadioGroup";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/Select";
import { Skeleton } from "@repo/ui/components/Skeleton";
import { Switch } from "@repo/ui/components/Switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/Tabs";
import { TextAreaField } from "@repo/ui/components/TextAreaField";
import { TextField } from "@repo/ui/components/TextField";
import { TimeField } from "@repo/ui/components/TimeField";
import { Toggle } from "@repo/ui/components/Toggle";
import { useFormatDate, useFormatLongDate, useSmartDate } from "@repo/ui/hooks/useSmartDate";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertCircleIcon,
  BanIcon,
  BoldIcon,
  CalendarIcon,
  EyeIcon,
  InfoIcon,
  ItalicIcon,
  LayoutDashboardIcon,
  MailIcon,
  MousePointerClickIcon,
  PanelsTopLeftIcon,
  PlusIcon,
  SearchIcon,
  ShieldIcon,
  SquareMousePointerIcon,
  TagIcon,
  TextCursorInputIcon,
  ToggleLeftIcon,
  TrashIcon,
  TriangleAlertIcon,
  UnderlineIcon,
  UserIcon
} from "lucide-react";
import { useMemo, useState } from "react";

import { MainSideMenu } from "@/shared/components/MainSideMenu";

export const Route = createFileRoute("/dashboard/")({
  staticData: { trackingTitle: "Dashboard" },
  component: DashboardPage
});

function useFruitItems() {
  return [
    { id: "apple", label: t`Apple` },
    { id: "banana", label: t`Banana` },
    { id: "cherry", label: t`Cherry` },
    { id: "mango", label: t`Mango` },
    { id: "orange", label: t`Orange` }
  ];
}

function ControlRow({
  suffix,
  selectedColor,
  setSelectedColor,
  selectedFruits,
  setSelectedFruits,
  fruitItems,
  label,
  tooltip,
  disabled,
  readOnly,
  error,
  showIcon
}: {
  suffix: string;
  selectedColor: string;
  setSelectedColor: (value: string) => void;
  selectedFruits: string[];
  setSelectedFruits: (value: string[]) => void;
  fruitItems: { id: string; label: string }[];
  label?: boolean;
  tooltip?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  error?: boolean;
  showIcon?: boolean;
}) {
  const [switchChecked, setSwitchChecked] = useState(false);
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const colorLabels: Record<string, string> = { red: t`Red`, green: t`Green`, blue: t`Blue` };
  const tip = tooltip ? t`This is a helpful tooltip` : undefined;
  const err = error ? t`This field is required` : undefined;

  return (
    <div className="grid grid-cols-4 gap-x-6 gap-y-4">
      {/* TextField -- supports: label, tooltip, disabled, readOnly, errorMessage, startIcon */}
      <TextField
        label={label ? t`Text field` : undefined}
        tooltip={tip}
        name={`text-${suffix}`}
        placeholder={t`E.g., Alex Taylor`}
        defaultValue={readOnly ? t`Alex Taylor` : undefined}
        isDisabled={disabled}
        isReadOnly={readOnly}
        errorMessage={err}
        startIcon={showIcon ? <SearchIcon /> : undefined}
      />
      {/* TextAreaField -- supports: label, tooltip, disabled, readOnly, errorMessage */}
      <TextAreaField
        label={label ? t`Text area` : undefined}
        tooltip={tip}
        name={`textarea-${suffix}`}
        placeholder={t`Add notes here`}
        defaultValue={readOnly ? t`Some notes` : undefined}
        isDisabled={disabled}
        isReadOnly={readOnly}
        errorMessage={err}
      />
      {/* NumberField -- supports: label, tooltip, disabled, readOnly, errorMessage */}
      <NumberField
        label={label ? t`Number (integer)` : undefined}
        tooltip={tip}
        name={`int-${suffix}`}
        defaultValue={1}
        minValue={0}
        maxValue={100}
        step={1}
        isDisabled={disabled}
        isReadOnly={readOnly}
        errorMessage={err}
      />
      {/* NumberField decimal -- supports: label, tooltip, disabled, readOnly, errorMessage */}
      <NumberField
        label={label ? t`Number (decimal)` : undefined}
        tooltip={tip}
        name={`dec-${suffix}`}
        defaultValue={9.99}
        minValue={0}
        maxValue={999.99}
        step={0.01}
        isDisabled={disabled}
        isReadOnly={readOnly}
        errorMessage={err}
      />
      {/* Select -- NO built-in: label, tooltip, readOnly, errorMessage */}
      <Select name={`select-${suffix}`} value={selectedColor} onValueChange={(v) => v && setSelectedColor(v)} disabled={disabled}>
        <SelectTrigger>
          <SelectValue>{() => colorLabels[selectedColor]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="red"><Trans>Red</Trans></SelectItem>
          <SelectItem value="green"><Trans>Green</Trans></SelectItem>
          <SelectItem value="blue"><Trans>Blue</Trans></SelectItem>
        </SelectContent>
      </Select>
      {/* MultiSelect -- supports: label, tooltip. NO: disabled, readOnly, errorMessage */}
      <MultiSelect
        label={label ? t`Multi select` : undefined}
        tooltip={tip}
        placeholder={t`Select fruits`}
        items={fruitItems}
        value={selectedFruits}
        onChange={setSelectedFruits}
      />
      {/* DateField -- supports: label, tooltip, disabled, readOnly, errorMessage */}
      <DateField
        label={label ? t`Date field` : undefined}
        tooltip={tip}
        name={`datefield-${suffix}`}
        isDisabled={disabled}
        isReadOnly={readOnly}
        errorMessage={err}
      />
      {/* DatePicker -- supports: label, tooltip, disabled, errorMessage. NO: readOnly */}
      <DatePicker
        label={label ? t`Date picker` : undefined}
        tooltip={tip}
        name={`datepicker-${suffix}`}
        placeholder={t`Pick a date`}
        isDisabled={disabled}
        errorMessage={err}
      />
      {/* DateRangePicker -- supports: label, disabled. NO: tooltip, readOnly, errorMessage */}
      <DateRangePicker label={label ? t`Date range` : undefined} disabled={disabled} />
      {/* TimeField -- supports: label, tooltip, disabled, readOnly, errorMessage */}
      <TimeField
        label={label ? t`Time field` : undefined}
        tooltip={tip}
        name={`time-${suffix}`}
        isDisabled={disabled}
        isReadOnly={readOnly}
        errorMessage={err}
      />
      {/* Switch -- NO built-in: label, tooltip, readOnly, errorMessage */}
      <Switch checked={switchChecked} onCheckedChange={setSwitchChecked} disabled={disabled} />
      {/* Checkbox -- NO built-in: label, tooltip, readOnly, errorMessage */}
      <Checkbox checked={checkboxChecked} onCheckedChange={setCheckboxChecked} disabled={disabled} />
      {/* RadioGroup -- NO built-in: label, tooltip, readOnly, errorMessage */}
      <RadioGroup name={`radio-${suffix}`} defaultValue="option-a" disabled={disabled}>
        <RadioGroupItem value="option-a" />
        <RadioGroupItem value="option-b" />
      </RadioGroup>
    </div>
  );
}

function SmartDateDisplay({ date, label }: { date: string; label: string }) {
  const smartDate = useSmartDate(date);
  const formatShortDate = useFormatDate();
  const formatLongDate = useFormatLongDate();

  let relativeText = "";
  if (smartDate) {
    switch (smartDate.type) {
      case "justNow":
        relativeText = t`Just now`;
        break;
      case "minutesAgo":
        relativeText = t`${smartDate.value} minutes ago`;
        break;
      case "hoursAgo":
        relativeText = t`${smartDate.value} hours ago`;
        break;
      case "date":
        relativeText = smartDate.formatted;
        break;
    }
  }

  return (
    <div className="flex flex-col gap-1 rounded-md border p-3">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
        <span className="text-muted-foreground">
          <Trans>Short date</Trans>
        </span>
        <span>{formatShortDate(date)}</span>
        <span className="text-muted-foreground">
          <Trans>Long date</Trans>
        </span>
        <span>{formatLongDate(date)}</span>
        <span className="text-muted-foreground">
          <Trans>Short date with time</Trans>
        </span>
        <span>{formatShortDate(date, true)}</span>
        <span className="text-muted-foreground">
          <Trans>Relative</Trans>
        </span>
        <span>{relativeText}</span>
      </div>
    </div>
  );
}

function DateFormatPreview() {
  const now = useMemo(() => new Date(), []);
  const justNow = now.toISOString();
  const threeMinutesAgo = new Date(now.getTime() - 3 * 60 * 1000).toISOString();
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  return (
    <div className="flex flex-col gap-2">
      <h4>
        <Trans>Date and time formatting</Trans>
      </h4>
      <div className="grid grid-cols-5 gap-4">
        <SmartDateDisplay date={justNow} label={t`Just now`} />
        <SmartDateDisplay date={threeMinutesAgo} label={t`3 minutes ago`} />
        <SmartDateDisplay date={twoHoursAgo} label={t`2 hours ago`} />
        <SmartDateDisplay date={yesterday} label={t`Yesterday`} />
        <SmartDateDisplay date={lastMonth} label={t`Last month`} />
      </div>
    </div>
  );
}

function ButtonsPreview() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h4>
          <Trans>Button variants</Trans>
        </h4>
        <div className="flex flex-wrap items-center gap-3">
          <Button>
            <Trans>Default</Trans>
          </Button>
          <Button variant="secondary">
            <Trans>Secondary</Trans>
          </Button>
          <Button variant="outline">
            <Trans>Outline</Trans>
          </Button>
          <Button variant="ghost">
            <Trans>Ghost</Trans>
          </Button>
          <Button variant="destructive">
            <Trans>Destructive</Trans>
          </Button>
          <Button variant="link">
            <Trans>Link</Trans>
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h4>
          <Trans>Button sizes</Trans>
        </h4>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="xs">
            <Trans>Extra small</Trans>
          </Button>
          <Button size="sm">
            <Trans>Small</Trans>
          </Button>
          <Button size="default">
            <Trans>Default</Trans>
          </Button>
          <Button size="lg">
            <Trans>Large</Trans>
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h4>
          <Trans>With icons</Trans>
        </h4>
        <div className="flex flex-wrap items-center gap-3">
          <Button>
            <PlusIcon />
            <Trans>Create</Trans>
          </Button>
          <Button variant="secondary">
            <MailIcon />
            <Trans>Send invite</Trans>
          </Button>
          <Button variant="outline">
            <SearchIcon />
            <Trans>Search</Trans>
          </Button>
          <Button variant="destructive">
            <TrashIcon />
            <Trans>Delete</Trans>
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h4>
          <Trans>Icon-only buttons</Trans>
        </h4>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="icon-xs">
            <PlusIcon />
          </Button>
          <Button size="icon-sm">
            <PlusIcon />
          </Button>
          <Button size="icon">
            <PlusIcon />
          </Button>
          <Button size="icon-lg">
            <PlusIcon />
          </Button>
          <Button size="icon" variant="outline">
            <SearchIcon />
          </Button>
          <Button size="icon" variant="ghost">
            <TrashIcon />
          </Button>
          <Button size="icon" variant="destructive">
            <TrashIcon />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h4>
          <Trans>Disabled buttons</Trans>
        </h4>
        <div className="flex flex-wrap items-center gap-3">
          <Button disabled>
            <Trans>Default</Trans>
          </Button>
          <Button variant="secondary" disabled>
            <Trans>Secondary</Trans>
          </Button>
          <Button variant="outline" disabled>
            <Trans>Outline</Trans>
          </Button>
          <Button variant="destructive" disabled>
            <Trans>Destructive</Trans>
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h4>
          <Trans>Toggle buttons</Trans>
        </h4>
        <div className="flex flex-wrap items-center gap-3">
          <Toggle aria-label={t`Bold`}>
            <BoldIcon />
          </Toggle>
          <Toggle aria-label={t`Italic`}>
            <ItalicIcon />
          </Toggle>
          <Toggle aria-label={t`Underline`}>
            <UnderlineIcon />
          </Toggle>
          <Toggle variant="outline" aria-label={t`Bold`}>
            <BoldIcon />
          </Toggle>
        </div>
      </div>
    </div>
  );
}

function AlertsBadgesPreview() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h4>
          <Trans>Alerts</Trans>
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <Alert>
            <InfoIcon />
            <AlertTitle>
              <Trans>Default alert</Trans>
            </AlertTitle>
            <AlertDescription>
              <Trans>This is a default informational alert.</Trans>
            </AlertDescription>
          </Alert>
          <Alert variant="info">
            <InfoIcon />
            <AlertTitle>
              <Trans>Info alert</Trans>
            </AlertTitle>
            <AlertDescription>
              <Trans>This is an informational message.</Trans>
            </AlertDescription>
          </Alert>
          <Alert variant="warning">
            <TriangleAlertIcon />
            <AlertTitle>
              <Trans>Warning alert</Trans>
            </AlertTitle>
            <AlertDescription>
              <Trans>This action may have unintended consequences.</Trans>
            </AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>
              <Trans>Destructive alert</Trans>
            </AlertTitle>
            <AlertDescription>
              <Trans>Something went wrong. Please try again.</Trans>
            </AlertDescription>
          </Alert>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h4>
          <Trans>Badges</Trans>
        </h4>
        <div className="flex flex-wrap items-center gap-3">
          <Badge>
            <Trans>Default</Trans>
          </Badge>
          <Badge variant="secondary">
            <Trans>Secondary</Trans>
          </Badge>
          <Badge variant="destructive">
            <Trans>Destructive</Trans>
          </Badge>
          <Badge variant="outline">
            <Trans>Outline</Trans>
          </Badge>
        </div>
      </div>
    </div>
  );
}

function DialogsPreview() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h4>
          <Trans>Dialogs</Trans>
        </h4>
        <div className="flex flex-wrap items-center gap-3">
          <Dialog trackingTitle="Sample dialog">
            <DialogTrigger render={<Button variant="outline" />}>
              <Trans>Open dialog</Trans>
            </DialogTrigger>
            <DialogContent className="sm:w-dialog-md">
              <DialogHeader>
                <DialogTitle>
                  <Trans>Sample dialog</Trans>
                </DialogTitle>
              </DialogHeader>
              <DialogBody>
                <p>
                  <Trans>This is a sample dialog with a header, body, and footer.</Trans>
                </p>
              </DialogBody>
              <DialogFooter>
                <DialogClose render={<Button type="reset" variant="secondary" />}>
                  <Trans>Cancel</Trans>
                </DialogClose>
                <Button>
                  <Trans>Save changes</Trans>
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <AlertDialog trackingTitle="Delete item">
            <AlertDialogTrigger render={<Button variant="destructive" />}>
              <TrashIcon />
              <Trans>Delete item</Trans>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  <Trans>Are you sure?</Trans>
                </AlertDialogTitle>
                <AlertDialogDescription>
                  <Trans>This action cannot be undone. This will permanently delete the item.</Trans>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogBody />
              <AlertDialogFooter>
                <AlertDialogCancel>
                  <Trans>Cancel</Trans>
                </AlertDialogCancel>
                <AlertDialogAction render={<Button variant="destructive" />}>
                  <Trans>Delete</Trans>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h4>
          <Trans>Radio card selector</Trans>
        </h4>
        <RadioGroup defaultValue="member">
          <FieldLabel>
            <Field orientation="horizontal">
              <RadioGroupItem value="owner" />
              <FieldContent>
                <FieldTitle>
                  <ShieldIcon />
                  <Trans>Owner</Trans>
                </FieldTitle>
                <FieldDescription>
                  <Trans>Full access including user roles and account settings</Trans>
                </FieldDescription>
              </FieldContent>
            </Field>
          </FieldLabel>
          <FieldLabel>
            <Field orientation="horizontal">
              <RadioGroupItem value="admin" />
              <FieldContent>
                <FieldTitle>
                  <UserIcon />
                  <Trans>Admin</Trans>
                </FieldTitle>
                <FieldDescription>
                  <Trans>Full access except changing user roles and account settings</Trans>
                </FieldDescription>
              </FieldContent>
            </Field>
          </FieldLabel>
          <FieldLabel>
            <Field orientation="horizontal">
              <RadioGroupItem value="member" />
              <FieldContent>
                <FieldTitle>
                  <MailIcon />
                  <Trans>Member</Trans>
                </FieldTitle>
                <FieldDescription>
                  <Trans>Standard user access</Trans>
                </FieldDescription>
              </FieldContent>
            </Field>
          </FieldLabel>
        </RadioGroup>
      </div>

      <div className="flex flex-col gap-2">
        <h4>
          <Trans>Cards</Trans>
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>
                <Trans>Notifications</Trans>
              </CardTitle>
              <CardDescription>
                <Trans>Manage your notification preferences.</Trans>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                <Trans>You have 3 unread notifications.</Trans>
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm">
                <Trans>View all</Trans>
              </Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>
                <Trans>Team members</Trans>
              </CardTitle>
              <CardDescription>
                <Trans>Invite and manage your team.</Trans>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                <Trans>5 active members</Trans>
              </p>
            </CardContent>
            <CardFooter>
              <Button size="sm">
                <PlusIcon />
                <Trans>Invite</Trans>
              </Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>
                <Trans>Usage</Trans>
              </CardTitle>
              <CardDescription>
                <Trans>Your current plan usage this month.</Trans>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                <Trans>75% of quota used</Trans>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function EmptySkeletonPreview() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h4>
          <Trans>Empty states</Trans>
        </h4>
        <div className="grid grid-cols-2 gap-6">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <LayoutDashboardIcon />
              </EmptyMedia>
              <EmptyTitle>
                <Trans>No data yet</Trans>
              </EmptyTitle>
              <EmptyDescription>
                <Trans>There is nothing to display here. Create your first item to get started.</Trans>
              </EmptyDescription>
            </EmptyHeader>
            <Button>
              <PlusIcon />
              <Trans>Create item</Trans>
            </Button>
          </Empty>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SearchIcon />
              </EmptyMedia>
              <EmptyTitle>
                <Trans>No results found</Trans>
              </EmptyTitle>
              <EmptyDescription>
                <Trans>Try adjusting your search or filter to find what you are looking for.</Trans>
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h4>
          <Trans>Skeleton loading states</Trans>
        </h4>
        <div className="grid grid-cols-3 gap-6">
          <div className="flex flex-col gap-3 rounded-lg border p-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-[var(--control-height)] w-full" />
          </div>
          <div className="flex flex-col gap-3 rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-full" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
            <Skeleton className="h-20 w-full" />
          </div>
          <div className="flex flex-col gap-3 rounded-lg border p-4">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-[var(--control-height)] w-full" />
            <Skeleton className="h-[var(--control-height)] w-full" />
            <Skeleton className="h-[var(--control-height)] w-2/3" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ComponentPreview() {
  const [selectedColor, setSelectedColor] = useState("red");
  const [selectedFruits, setSelectedFruits] = useState<string[]>([]);
  const fruitItems = useFruitItems();

  const shared = { selectedColor, setSelectedColor, selectedFruits, setSelectedFruits, fruitItems };

  return (
    <Tabs defaultValue="labels">
      <TabsList>
        <TabsTrigger value="labels">
          <TextCursorInputIcon />
          <Trans>With labels</Trans>
        </TabsTrigger>
        <TabsTrigger value="tooltips">
          <InfoIcon />
          <Trans>With tooltips</Trans>
        </TabsTrigger>
        <TabsTrigger value="icons">
          <SearchIcon />
          <Trans>With icons</Trans>
        </TabsTrigger>
        <TabsTrigger value="no-labels">
          <ToggleLeftIcon />
          <Trans>Without labels</Trans>
        </TabsTrigger>
        <TabsTrigger value="readonly">
          <EyeIcon />
          <Trans>Read only</Trans>
        </TabsTrigger>
        <TabsTrigger value="disabled">
          <BanIcon />
          <Trans>Disabled</Trans>
        </TabsTrigger>
        <TabsTrigger value="errors">
          <AlertCircleIcon />
          <Trans>Validation errors</Trans>
        </TabsTrigger>
        <TabsTrigger value="buttons">
          <MousePointerClickIcon />
          <Trans>Buttons</Trans>
        </TabsTrigger>
        <TabsTrigger value="alerts">
          <TagIcon />
          <Trans>Alerts and badges</Trans>
        </TabsTrigger>
        <TabsTrigger value="dialogs">
          <PanelsTopLeftIcon />
          <Trans>Dialogs and cards</Trans>
        </TabsTrigger>
        <TabsTrigger value="dates">
          <CalendarIcon />
          <Trans>Date formatting</Trans>
        </TabsTrigger>
        <TabsTrigger value="empty">
          <SquareMousePointerIcon />
          <Trans>Empty and skeleton</Trans>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="labels">
        <ControlRow suffix="labeled" label {...shared} />
      </TabsContent>
      <TabsContent value="tooltips">
        <ControlRow suffix="tooltip" label tooltip {...shared} />
      </TabsContent>
      <TabsContent value="icons">
        <ControlRow suffix="icon" label showIcon {...shared} />
      </TabsContent>
      <TabsContent value="no-labels">
        <ControlRow suffix="bare" {...shared} />
      </TabsContent>
      <TabsContent value="readonly">
        <ControlRow suffix="readonly" label readOnly {...shared} />
      </TabsContent>
      <TabsContent value="disabled">
        <ControlRow suffix="disabled" label disabled {...shared} />
      </TabsContent>
      <TabsContent value="errors">
        <ControlRow suffix="error" label error {...shared} />
      </TabsContent>
      <TabsContent value="buttons">
        <ButtonsPreview />
      </TabsContent>
      <TabsContent value="alerts">
        <AlertsBadgesPreview />
      </TabsContent>
      <TabsContent value="dialogs">
        <DialogsPreview />
      </TabsContent>
      <TabsContent value="dates">
        <DateFormatPreview />
      </TabsContent>
      <TabsContent value="empty">
        <EmptySkeletonPreview />
      </TabsContent>
    </Tabs>
  );
}


function getTimeBasedGreeting(firstName: string | undefined) {
  const hour = new Date().getHours();
  if (hour >= 0 && hour < 5) {
    return firstName ? t`Burning the midnight oil, ${firstName}?` : t`Burning the midnight oil?`;
  }
  if (hour >= 5 && hour < 12) {
    return firstName ? t`Good morning, ${firstName}` : t`Good morning`;
  }
  if (hour >= 12 && hour < 17) {
    return firstName ? t`Good afternoon, ${firstName}` : t`Good afternoon`;
  }
  return firstName ? t`Good evening, ${firstName}` : t`Good evening`;
}

function DashboardPage() {
  const userInfo = useUserInfo();

  return (
    <>
      <MainSideMenu />
      <AppLayout
        variant="full"
        browserTitle={t`Dashboard`}
        title={getTimeBasedGreeting(userInfo?.firstName)}
        subtitle={t`Here's your overview of what's happening.`}
      >
        <ComponentPreview />
      </AppLayout>
    </>
  );
}
