import { Suspense } from "react"
import { getUser, fetchTickets, fetchSettings, User } from "@/lib/server-api"
import { TicketsTable } from "./tickets-table"
import { TicketsTableSkeleton } from "./tickets-table-skeleton"
import { TicketsHeader } from "./tickets-header"

export default async function TicketsPage({
    searchParams,
}: {
    searchParams: { page?: string; ticket_id?: string }
}) {
    const user = await getUser()
    if (!user) {
        return <div>Not authenticated</div>
    }

    const page = searchParams.page ? Number.parseInt(searchParams.page) : 1
    const ticketId = searchParams.ticket_id ? Number.parseInt(searchParams.ticket_id) : undefined

    return (
        <div className="space-y-4">
            <TicketsHeader />
            <Suspense fallback={<TicketsTableSkeleton />}>
                <TicketsContent page={page} user={user} ticketId={ticketId} />
            </Suspense>
        </div>
    )
}

async function TicketsContent({ page, user }: { page: number; user: User; ticketId?: number }) {
    // Fetch settings to get available options
    const settings = await fetchSettings(user.alias)

    // Fetch tickets (if user is not admin, only fetch their tickets)
    const isAdmin = user.role === "admin" // Assuming admin has ID 1, adjust as needed
    const tickets = await fetchTickets(user.alias, page, 10, isAdmin ? undefined : user.id)

    return <TicketsTable tickets={tickets} currentPage={page} settings={settings} user={user} />
}