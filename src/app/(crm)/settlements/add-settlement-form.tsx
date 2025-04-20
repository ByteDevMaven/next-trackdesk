"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { PlusCircle, Trash2 } from "lucide-react"
import type { User } from "@/lib/api"
import { addSettlement } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"

interface AddSettlementFormProps {
    user: User
    ticketId?: number
    onCancel: () => void
    onSuccess: () => void
}

interface SettlementItem {
    id: string
    date: string
    order_num: string
    supplier: string
    type: string
    invoice_num: string
    total: string
    revision: string
}

export function AddSettlementForm({ user, ticketId, onCancel, onSuccess }: AddSettlementFormProps) {
    const [items, setItems] = useState<SettlementItem[]>([
        {
            id: "1",
            date: new Date().toISOString().split("T")[0],
            order_num: "",
            supplier: "",
            type: "Purchase",
            invoice_num: "",
            total: "0.00",
            revision: new Date().toISOString().split("T")[0],
        },
    ])

    const [selectedTicketId, setSelectedTicketId] = useState<string>(ticketId?.toString() || "")
    const [isSubmitting, setIsSubmitting] = useState(false)

    function handleAddItem() {
        setItems([
            ...items,
            {
                id: Date.now().toString(),
                date: new Date().toISOString().split("T")[0],
                order_num: "",
                supplier: "",
                type: "Purchase",
                invoice_num: "",
                total: "0.00",
                revision: new Date().toISOString().split("T")[0],
            },
        ])
    }

    function handleRemoveItem(id: string) {
        if (items.length > 1) {
            setItems(items.filter((item) => item.id !== id))
        }
    }

    function handleItemChange(id: string, field: keyof SettlementItem, value: string) {
        setItems(
            items.map((item) => {
                if (item.id === id) {
                    return { ...item, [field]: value }
                }
                return item
            }),
        )
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            // Prepare the data for submission
            const settlementData = items.map((item) => ({
                date: item.date,
                order_num: item.order_num,
                supplier: item.supplier,
                type: item.type,
                invoice_num: item.invoice_num,
                total: Number.parseFloat(item.total),
                revision: item.revision,
            }))

            const activityData = [
                {
                    timestamp: new Date().toISOString(),
                    action: "settlement_created",
                    user: user.name,
                    details: `Settlement created with ${items.length} items.`,
                },
            ]

            // Use the new API function
            const result = await addSettlement(user.alias, {
                ticket_id: Number.parseInt(selectedTicketId),
                user_id: user.id,
                data: settlementData,
                activity: activityData,
            })

            if (result.success) {
                toast({
                    title: "Settlement Added",
                    description: "The settlement has been successfully added.",
                })
                onSuccess()
            } else {
                throw new Error(result.message || "Failed to add settlement")
            }
        } catch (error) {
            console.error("Failed to submit settlement:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "An error occurred while adding the settlement",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const totalAmount = items.reduce((sum, item) => sum + Number.parseFloat(item.total || "0"), 0)

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="ticket_id">Ticket ID</Label>
                        <Input
                            id="ticket_id"
                            value={selectedTicketId}
                            onChange={(e) => setSelectedTicketId(e.target.value)}
                            placeholder="Enter ticket ID"
                            required={!ticketId}
                            disabled={!!ticketId}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="assignee">Assignee</Label>
                        <Input id="assignee" value={user.id} disabled />
                    </div>
                </div>

                <Separator />

                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Settlement Items</h3>
                        <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add Item
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {items.map((item) => (
                            <div key={item.id} className="grid grid-cols-1 gap-4 p-4 border rounded-md sm:grid-cols-2 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor={`date-${item.id}`}>Date</Label>
                                    <Input
                                        id={`date-${item.id}`}
                                        type="date"
                                        value={item.date}
                                        onChange={(e) => handleItemChange(item.id, "date", e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor={`order-${item.id}`}>Order #</Label>
                                    <Input
                                        id={`order-${item.id}`}
                                        value={item.order_num}
                                        onChange={(e) => handleItemChange(item.id, "order_num", e.target.value)}
                                        placeholder="Order number"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor={`supplier-${item.id}`}>Supplier</Label>
                                    <Input
                                        id={`supplier-${item.id}`}
                                        value={item.supplier}
                                        onChange={(e) => handleItemChange(item.id, "supplier", e.target.value)}
                                        placeholder="Supplier name"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor={`type-${item.id}`}>Type</Label>
                                    <Select value={item.type} onValueChange={(value) => handleItemChange(item.id, "type", value)}>
                                        <SelectTrigger id={`type-${item.id}`}>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Purchase">Purchase</SelectItem>
                                            <SelectItem value="Return">Return</SelectItem>
                                            <SelectItem value="Credit">Credit</SelectItem>
                                            <SelectItem value="Debit">Debit</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor={`invoice-${item.id}`}>Invoice #</Label>
                                    <Input
                                        id={`invoice-${item.id}`}
                                        value={item.invoice_num}
                                        onChange={(e) => handleItemChange(item.id, "invoice_num", e.target.value)}
                                        placeholder="Invoice number"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor={`total-${item.id}`}>Total</Label>
                                    <div className="flex items-center">
                                        <Input
                                            id={`total-${item.id}`}
                                            type="number"
                                            step="0.01"
                                            value={item.total}
                                            onChange={(e) => handleItemChange(item.id, "total", e.target.value)}
                                            placeholder="0.00"
                                            required
                                            className="flex-1"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="ml-2"
                                            onClick={() => handleRemoveItem(item.id)}
                                            disabled={items.length <= 1}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                            <span className="sr-only">Remove item</span>
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor={`revision-${item.id}`}>Revision Date</Label>
                                    <Input
                                        id={`revision-${item.id}`}
                                        type="date"
                                        value={item.revision}
                                        onChange={(e) => handleItemChange(item.id, "revision", e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-lg font-medium">
                    Total: <span className="font-bold">${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : "Save Settlement"}
                    </Button>
                </div>
            </div>
        </form>
    )
}