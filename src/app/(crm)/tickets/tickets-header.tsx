"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { TicketModal } from "./ticket-modal"
import { useTranslations } from 'next-intl'

export function TicketsHeader() {
    const [showAddModal, setShowAddModal] = useState(false)
    const t = useTranslations('TicketsPage');

    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Tickets</h1>
                <p className="text-muted-foreground">{t('description')}</p>
            </div>
            <Button onClick={() => setShowAddModal(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                {t('newTicket')}
            </Button>

            <TicketModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                mode="add"
                onSuccess={(newTicket) => {
                    // Dispatch a custom event with the new ticket
                    const event = new CustomEvent("ticket-created", { detail: newTicket })
                    window.dispatchEvent(event)
                    setShowAddModal(false)
                }}
            />
        </div>
    )
}