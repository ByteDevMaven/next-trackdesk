import { Suspense } from "react"
import { getUser, fetchSettings } from "@/lib/server-api"
import { SettlementsHeader } from "./settlements-header"
import { SettlementsContent } from "./settlements-content"
import { SettlementsTableSkeleton } from "./settlements-table-skeleton"

export default async function SettlementsPage({
    searchParams,
}: {
    searchParams: { page?: string; ticket_id?: string; settlement_id?: string }
}) {
    const user = await getUser()
    if (!user) {
        return <div>Not authenticated</div>
    }

    const page = searchParams.page ? Number.parseInt(searchParams.page) : 1
    const ticketId = searchParams.ticket_id ? Number.parseInt(searchParams.ticket_id) : undefined
    const settlementId = searchParams.settlement_id ? Number.parseInt(searchParams.settlement_id) : undefined

    // Fetch settings to get available options
    const settings = await fetchSettings(user.alias)

    return (
        <div className="space-y-4">
            <SettlementsHeader />
            <Suspense fallback={<SettlementsTableSkeleton />}>
                <SettlementsContent
                    page={page}
                    user={user}
                    ticketId={ticketId}
                    settlementId={settlementId}
                    settings={settings}
                />
            </Suspense>
        </div>
    )
}