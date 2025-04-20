"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { AddSettlementModal } from "./add-settlement-modal"
import { SettlementModal } from "./settlement-modal"
import { parseSettlementData, updateSettlement, parseSettlementActivity } from "@/lib/api"
import type { PaginatedResponse, Settlement, User, Settings, SettlementData } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

interface SettlementsTableProps {
    settlements: PaginatedResponse<Settlement>
    currentPage: number
    user: User
    ticketId?: number
    settlementId?: number
    settings: Settings
    setSettlements: React.Dispatch<React.SetStateAction<PaginatedResponse<Settlement> | null>>
}

export function SettlementsTable({
    settlements,
    currentPage,
    user,
    ticketId,
    settlementId,
    settings,
    setSettlements,
}: SettlementsTableProps) {
    const [showAddModal, setShowAddModal] = useState(false)
    const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const { toast } = useToast()

    const totalPages = Math.ceil(settlements.total / settlements.per_page)

    // Process settlement data for display
    const processedSettlements = settlements.data.map((settlement) => {
        const data = parseSettlementData(settlement.data)
        const total = data.reduce((sum, item) => sum + item.total, 0)
        return {
            ...settlement,
            processedData: data,
            total,
        }
    })

    // If a specific settlement ID is provided, select it automatically
    useEffect(() => {
        if (settlementId && settlements.data.length > 0) {
            const settlement = settlements.data.find((s) => s.id === settlementId)
            if (settlement) {
                handleSelectSettlement(settlement)
            }
        }
    }, [settlements.data, settlementId])

    function handleAddSettlement() {
        setShowAddModal(true)
    }

    function handleSelectSettlement(settlement: Settlement) {
        setSelectedSettlement(settlement)
        setIsModalOpen(true)
    }

    async function handleSaveSettlement(updatedSettlement: Settlement, items: SettlementData[]) {
        try {
            // Parse the activity from the settlement
            const activities = parseSettlementActivity(updatedSettlement.activity)

            // Use the new API function
            const result = await updateSettlement(user.alias, {
                id: updatedSettlement.id,
                ticket_id: updatedSettlement.ticket_id,
                user_id: updatedSettlement.user_id,
                data: items,
                activity: activities,
            })

            if (result.success) {
                toast({
                    title: "Settlement Updated",
                    description: "The settlement has been successfully updated.",
                })

                // Refresh the settlements list
                // In a real app, you would refresh the data from the server
                // For now, we'll just update the local state
                setSettlements((prevSettlements) => {
                    if (!prevSettlements) return prevSettlements

                    const updatedData = prevSettlements.data.map((s) =>
                        s.id === updatedSettlement.id ? result.settlement || updatedSettlement : s,
                    )

                    return {
                        ...prevSettlements,
                        data: updatedData,
                    }
                })

                return Promise.resolve()
            } else {
                throw new Error(result.message || "Failed to update settlement")
            }
        } catch (error) {
            console.error("Failed to save settlement:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "An error occurred while updating the settlement",
                variant: "destructive",
            })
            return Promise.reject(error)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h2 className="text-xl font-semibold">Settlements List</h2>
                    <p className="text-sm text-muted-foreground">
                        {ticketId ? `Showing settlements for ticket #${ticketId}` : "Showing all settlements"}
                        {settlementId ? ` (filtered to settlement #${settlementId})` : ""}
                    </p>
                </div>
                <Button onClick={handleAddSettlement}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Settlement
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">ID</TableHead>
                            <TableHead>Ticket</TableHead>
                            <TableHead>Assignee</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {processedSettlements.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No settlements found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            processedSettlements.map((settlement) => (
                                <TableRow key={settlement.id} className="hover:bg-muted/50">
                                    <TableCell className="font-medium">#{settlement.id}</TableCell>
                                    <TableCell>
                                        <Link
                                            href={`/tickets?ticket_id=${settlement.ticket_id}`}
                                            className="text-primary hover:underline"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            #{settlement.ticket_id}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{settlement.user?.name}</TableCell>
                                    <TableCell>{settlement.processedData.length} items</TableCell>
                                    <TableCell className="text-right">${settlement.total.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full"
                                            onClick={() => handleSelectSettlement(settlement)}
                                        >
                                            Edit
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
                            href={
                                currentPage > 1
                                    ? `/settlements?page=${currentPage - 1}${ticketId ? `&ticket_id=${ticketId}` : ""}${settlementId ? `&settlement_id=${settlementId}` : ""}`
                                    : "#"
                            }
                            aria-disabled={currentPage <= 1}
                            className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                        />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                            <PaginationLink
                                href={`/settlements?page=${page}${ticketId ? `&ticket_id=${ticketId}` : ""}${settlementId ? `&settlement_id=${settlementId}` : ""}`}
                                isActive={page === currentPage}
                            >
                                {page}
                            </PaginationLink>
                        </PaginationItem>
                    ))}
                    <PaginationItem>
                        <PaginationNext
                            href={
                                currentPage < totalPages
                                    ? `/settlements?page=${currentPage + 1}${ticketId ? `&ticket_id=${ticketId}` : ""}${settlementId ? `&settlement_id=${settlementId}` : ""}`
                                    : "#"
                            }
                            aria-disabled={currentPage >= totalPages}
                            className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>

            {/* Add Settlement Modal */}
            <AddSettlementModal
                user={user}
                ticketId={ticketId}
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={() => {
                    // In a real app, you would refresh the data here
                    setShowAddModal(false)
                }}
            />

            {/* Edit Settlement Modal */}
            <SettlementModal
                settlement={selectedSettlement}
                settings={settings}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveSettlement}
                user={user}
            />
        </div>
    )
}