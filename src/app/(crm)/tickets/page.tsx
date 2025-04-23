import { Suspense } from "react"
import { getUser, fetchTickets, User } from "@/lib/server-api"
import { TicketsTable } from "./tickets-table"
import { TicketsTableSkeleton } from "./tickets-table-skeleton"
import { TicketsHeader } from "./tickets-header"

export default async function TicketsPage({
    searchParams,
}: {
    searchParams: { page?: string; id?: string }
}) {
    const user = await getUser()
    if (!user) {
        return <div>Not authenticated</div>
    }

    const page = searchParams.page ? Number.parseInt(searchParams.page) : 1
    const ticketId = searchParams.id ? Number.parseInt(searchParams.id) : undefined

    return (
        <div className="space-y-4">
            <TicketsHeader />
            <Suspense fallback={<TicketsTableSkeleton />}>
                <TicketsContent page={page} user={user} ticketId={ticketId} />
            </Suspense>
        </div>
    )
}

async function TicketsContent({ page, user, ticketId }: { page: number; user: User; ticketId?: number }) {
    // Fetch tickets (if user is not admin, only fetch their tickets)
    const isAdmin = user.role === "admin" // Assuming admin has ID 1, adjust as needed
    const tickets = await fetchTickets(user.alias, page, 10, isAdmin ? undefined : user.id, ticketId ? ticketId : undefined)

    return <TicketsTable tickets={tickets} currentPage={page} user={user} />
}