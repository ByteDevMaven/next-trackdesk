import { fetchSettlements } from "@/lib/server-api"
import { SettlementsTable } from "./settlements-table"
import type { User, Settings } from "@/lib/server-api"

interface SettlementsContentProps {
    page: number
    user: User
    ticketId?: number
    settlementId?: number
    settings: Settings
}

export async function SettlementsContent({ page, user, ticketId, settlementId, settings }: SettlementsContentProps) {
    // Fetch settlements
    const settlements = await fetchSettlements(user.alias, ticketId, page, 10, settlementId)

    return (
        <SettlementsTable
            settlements={settlements}
            currentPage={page}
            user={user}
            ticketId={ticketId}
            settlementId={settlementId}
            settings={settings}
        />
    )
}