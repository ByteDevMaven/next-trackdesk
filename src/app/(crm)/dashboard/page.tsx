import { Suspense } from "react";
import { getUser, fetchTickets, fetchCustomers } from "@/lib/server-api";
import { DashboardHeader } from "./dashboard-header";
import { DashboardWidgets } from "./dashboard-widgets";
import { DashboardSkeleton } from "./dashboard-skeleton";
import { RecentTickets } from "./recent-tickets";
import { CustomerStats } from "./customer-stats";

export default async function DashboardPage() {
  const user = await getUser();

  if (!user) {
    return <div>Not authenticated</div>;
  }

  return (
    <div className="space-y-6">
      <DashboardHeader user={user} />
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent user={user} />
      </Suspense>
    </div>
  );
}

async function DashboardContent({ user }: { user: { name: string; alias: string } }) {
  const tickets = await fetchTickets(user.alias, 1, 5); // Fetch recent tickets
  const customers = await fetchCustomers(user.alias, 1, 5); // Fetch customer stats

  return (
    <div className="space-y-6">
      <DashboardWidgets user={user} />
      <RecentTickets tickets={tickets.data} />
      <CustomerStats customers={customers.data} />
    </div>
  );
}