"use client"

import type React from "react"

import { useState, useCallback, useEffect } from "react"
import { format } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { TicketDetails } from "./ticket-details"
import { TicketModal } from "./ticket-modal"
import type { Ticket, User, PaginatedResponse } from "@/lib/api"
import { useSettings } from '@/lib/settings-context';
import { useTranslations } from 'next-intl'

interface TicketsTableProps {
    tickets: PaginatedResponse<Ticket>
    currentPage: number
    user: User
}

export function TicketsTable({ tickets: initialTickets, currentPage, user }: TicketsTableProps) {
    const [tickets, setTickets] = useState<PaginatedResponse<Ticket>>(initialTickets)
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [priorityFilter, setPriorityFilter] = useState<string>("all")
    const { settings } = useSettings();
    const t = useTranslations('TicketsPage');
    const tCommon = useTranslations('Common');

    // Update tickets when initialTickets changes (e.g., page change)
    useEffect(() => {
        setTickets(initialTickets)
    }, [initialTickets])

    // Function to handle ticket creation events
    useEffect(() => {
        const handleTicketCreated = (event: CustomEvent<Ticket>) => {
            const newTicket = event.detail
            // Add the new ticket to the tickets list
            setTickets((prevTickets) => ({
                ...prevTickets,
                data: [newTicket, ...prevTickets.data],
                total: prevTickets.total + 1,
            }))
        }

        // Function to handle ticket update events
        const handleTicketUpdated = (event: CustomEvent<Ticket>) => {
            const updatedTicket = event.detail
            // Update the ticket in the list
            setTickets((prevTickets) => ({
                ...prevTickets,
                data: prevTickets.data.map((ticket) => (ticket.id === updatedTicket.id ? updatedTicket : ticket)),
            }))

            // Also update selectedTicket if it's the one that was updated
            if (selectedTicket && selectedTicket.id === updatedTicket.id) {
                setSelectedTicket(updatedTicket)
            }
        }

        // Add event listeners
        window.addEventListener("ticket-created", handleTicketCreated as EventListener)
        window.addEventListener("ticket-updated", handleTicketUpdated as EventListener)

        // Clean up event listeners on component unmount
        return () => {
            window.removeEventListener("ticket-created", handleTicketCreated as EventListener)
            window.removeEventListener("ticket-updated", handleTicketUpdated as EventListener)
        }
    }, [selectedTicket])

    const statusOptions = ["all", ...(settings?.status?.split(",") || [])]
    const priorityOptions = ["all", ...(settings?.priority?.split(",") || [])]

    // Filter tickets based on selected filters
    const filteredTickets = tickets.data.filter((ticket) => {
        if (statusFilter !== "all" && ticket.status !== statusFilter) return false
        if (priorityFilter !== "all" && ticket.priority !== priorityFilter) return false
        return true
    })

    const totalPages = Math.ceil(tickets.total / tickets.per_page)

    function getPriorityBadgeVariant(priority: string) {
        switch (priority) {
            case "high":
                return "destructive"
            case "med":
                return "outline"
            case "low":
                return "secondary"
            default:
                return "secondary"
        }
    }

    function getStatusBadgeVariant(status: string) {
        switch (status) {
            case "open":
                return "default"
            case "pending":
                return "outline"
            case "closed":
                return "secondary"
            default:
                return "secondary"
        }
    }

    function handleViewTicket(ticket: Ticket) {
        setSelectedTicket(ticket)
        setIsDetailsOpen(true)
    }

    function handleEditTicket(ticket: Ticket, e: React.MouseEvent) {
        e.stopPropagation()
        setSelectedTicket(ticket)
        setIsEditModalOpen(true)
    }

    const handleTicketUpdated = useCallback(
        (updatedTicket: Ticket) => {
            // Update the tickets list with the updated ticket
            setTickets((prevTickets) => ({
                ...prevTickets,
                data: prevTickets.data.map((ticket) => (ticket.id === updatedTicket.id ? updatedTicket : ticket)),
            }))

            // Also update the selected ticket if it's the one that was updated
            if (selectedTicket && selectedTicket.id === updatedTicket.id) {
                setSelectedTicket(updatedTicket)
            }

            // Dispatch a custom event for other components that might need to know
            const event = new CustomEvent("ticket-updated", { detail: updatedTicket })
            window.dispatchEvent(event)
        },
        [selectedTicket],
    )

    return (
        <>
            <div className="mb-4">
                <p className="text-sm text-muted-foreground">{tickets.total} {t('ticketsfound')}</p>
            </div>

            <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{tCommon('status.name')}:</span>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                {statusOptions.map((status) => (
                                    <SelectItem key={status} value={status}>
                                        {tCommon(`status.${status}`)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{tCommon('priority.name')}:</span>
                        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by priority" />
                            </SelectTrigger>
                            <SelectContent>
                                {priorityOptions.map((priority) => (
                                    <SelectItem key={priority} value={priority}>
                                        {tCommon(`priority.${priority}`)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">{t('table.id')}</TableHead>
                                <TableHead>{t('table.title')}</TableHead>
                                <TableHead>{t('table.customer')}</TableHead>
                                <TableHead>{t('table.assignee')}</TableHead>
                                <TableHead>{t('table.status')}</TableHead>
                                <TableHead>{t('table.priority')}</TableHead>
                                <TableHead>{t('table.created')}</TableHead>
                                <TableHead className="w-[80px]">{t('table.actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTickets.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-24 text-center">
                                        {t('ticketsnotfound')}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredTickets.map((ticket) => (
                                    <TableRow
                                        key={ticket.id}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleViewTicket(ticket)}
                                    >
                                        <TableCell className="font-medium">#{ticket.id}</TableCell>
                                        <TableCell>{ticket.title}</TableCell>
                                        <TableCell>
                                            {ticket.customer
                                                ? `${ticket.customer.title} ${ticket.customer.name}`
                                                : `Customer #${ticket.customer_id}`}
                                        </TableCell>
                                        <TableCell>{ticket.user ? ticket.user.name : `User #${ticket.user_id}`}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusBadgeVariant(ticket.status)}>{tCommon(`status.${ticket.status}`)}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getPriorityBadgeVariant(ticket.priority)}>{tCommon(`priority.${ticket.priority}`)}</Badge>
                                        </TableCell>
                                        <TableCell>{format(new Date(ticket.created_at), "MMM d, yyyy")}</TableCell>
                                        <TableCell>
                                            <Button variant="outline" size="sm" onClick={(e) => handleEditTicket(ticket, e)}>
                                                <Edit className="h-4 w-4" />
                                                <span className="sr-only">Edit</span>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                href={currentPage > 1 ? `/tickets?page=${currentPage - 1}` : "#"}
                                aria-disabled={currentPage <= 1}
                                className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                            />
                        </PaginationItem>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <PaginationItem key={page}>
                                <PaginationLink href={`/tickets?page=${page}`} isActive={page === currentPage}>
                                    {page}
                                </PaginationLink>
                            </PaginationItem>
                        ))}
                        <PaginationItem>
                            <PaginationNext
                                href={currentPage < totalPages ? `/tickets?page=${currentPage + 1}` : "#"}
                                aria-disabled={currentPage >= totalPages}
                                className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>

            {/* Ticket Details Sidebar */}
            <TicketDetails
                ticket={selectedTicket}
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                onEdit={() => {
                    setIsDetailsOpen(false)
                    setIsEditModalOpen(true)
                }}
                user={user}
                onTicketUpdated={handleTicketUpdated}
            />

            {/* Edit Ticket Modal */}
            <TicketModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                mode="edit"
                ticket={selectedTicket}
                onSuccess={handleTicketUpdated}
            />
        </>
    )
}