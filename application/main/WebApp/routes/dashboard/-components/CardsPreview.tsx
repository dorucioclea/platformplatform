import { Trans } from "@lingui/react/macro";
import { Button } from "@repo/ui/components/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/components/Card";
import { PlusIcon } from "lucide-react";

export function CardsPreview() {
  return (
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
  );
}
