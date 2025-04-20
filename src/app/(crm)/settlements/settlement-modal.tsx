"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, Trash2, Printer, Save } from "lucide-react"
import { parseSettlementData, parseSettlementActivity, updateSettlement } from "@/lib/api"
import type { Settlement, SettlementData, SettlementActivity, User, Settings } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"

interface SettlementModalProps {
    settlement: Settlement | null
    settings: Settings
    isOpen: boolean
    onClose: () => void
    onSave: (settlement: Settlement, items: SettlementData[]) => Promise<void>
    user: User
}

export function SettlementModal({ settlement, settings, isOpen, onClose, onSave, user }: SettlementModalProps) {
    const [activeTab, setActiveTab] = useState<string>("edit")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [items, setItems] = useState<SettlementData[]>([])
    const [activities, setActivities] = useState<SettlementActivity[]>([])
    const types = settings.type.split(",").map((type) => type.trim())

    // Reset state when settlement changes
    useEffect(() => {
        if (settlement) {
            const parsedData = parseSettlementData(settlement.data)
            const parsedActivities = parseSettlementActivity(settlement.activity)
            setItems(parsedData)
            setActivities(parsedActivities)
        } else {
            setItems([])
            setActivities([])
        }
    }, [settlement, user.alias])

    if (!settlement) return null

    const totalAmount = items.reduce((sum, item) => sum + item.total, 0)

    function handleAddItem() {
        setItems([
            ...items,
            {
                date: new Date().toISOString().split("T")[0],
                order_num: "",
                supplier: "",
                type: "Purchase",
                invoice_num: "",
                total: 0,
                revision: new Date().toISOString().split("T")[0],
            },
        ])
    }

    function handleRemoveItem(index: number) {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index))
        }
    }

    function handleItemChange(index: number, field: keyof SettlementData, value: number) {
        setItems(
            items.map((item, i) => {
                if (i === index) {
                    return {
                        ...item,
                        [field]: field === "total" ? Number(value) : value,
                        revision: field !== "revision" ? new Date().toISOString().split("T")[0] : item.revision,
                    }
                }
                return item
            }),
        )
    }

    async function handleSave() {
        setIsSubmitting(true)
        try {
            // Add a new activity entry for this edit
            const newActivity = {
                timestamp: new Date().toISOString(),
                action: "settlement_updated",
                user: user.name,
                details: `Settlement updated with ${items.length} items.`,
            }

            // Combine existing activities with the new one
            const updatedActivities = [...activities, newActivity]

            // Use the new API function
            const result = await updateSettlement(user.alias, {
                id: settlement.id,
                ticket_id: settlement.ticket_id,
                user_id: settlement.user_id,
                data: items,
                activity: updatedActivities,
            })

            if (result.success) {
                toast({
                    title: "Settlement Updated",
                    description: "The settlement has been successfully updated.",
                })

                // If onSave callback exists, call it with the updated settlement
                if (onSave && result.settlement) {
                    await onSave(result.settlement, items)
                }

                onClose()
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
        } finally {
            setIsSubmitting(false)
        }
    }

    function handlePrint() {
        const printContent = document.getElementById("settlement-print-preview")
        if (!printContent) return

        // Create a new window for printing
        const printWindow = window.open("", "_blank")
        if (!printWindow) {
            alert("Please allow pop-ups to print the settlement")
            return
        }

        // Generate a styled HTML document for printing
        printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Settlement #${settlement?.id} - Print</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                margin: 20px; 
                color: #111;
              }
              .header { 
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 30px;
                border-bottom: 1px solid #ddd;
                padding-bottom: 10px;
              }
              .header-info {
                flex: 1;
              }
              h1 { 
                color: #111; 
                margin-bottom: 5px;
              }
              .info-line {
                margin: 5px 0;
                color: #555;
              }
              .header-logo img {
                width: 300px;
                height: auto;
              }
              table { 
                width: 100%; 
                border-collapse: collapse; 
                margin: 20px 0;
              }
              th { 
                background-color: #f5f5f5; 
                border-bottom: 2px solid #ddd;
                padding: 12px 8px;
                text-align: left;
              }
              td { 
                border-bottom: 1px solid #ddd; 
                padding: 10px 8px;
              }
              tr:nth-child(even) {
                background-color: #f9f9f9;
              }
              .total-row {
                font-weight: bold;
                border-top: 2px solid #ddd;
              }
              .total-row td {
                padding-top: 12px;
              }
              .text-right {
                text-align: right;
              }
              .footer { 
                margin-top: 30px; 
                border-top: 1px solid #ddd;
                padding-top: 10px;
                font-size: 12px;
                color: #777;
              }
              @media print {
                body { 
                  -webkit-print-color-adjust: exact; 
                  print-color-adjust: exact;
                }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="header-info">
                <h1>Settlement #${settlement?.id}</h1>
                <p class="info-line">Ticket #${settlement?.ticket_id}</p>
                <p class="info-line">Assignee: ${settlement?.user?.name}</p>
                <p class="info-line">Generated: ${format(new Date(), "PPP p")}</p>
              </div>
              <div class="header-logo">
                <img src="${settings.logo}" alt="Logo" />
              </div>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Order #</th>
                  <th>Supplier</th>
                  <th>Type</th>
                  <th>Invoice #</th>
                  <th>Revision</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${items
                .map(
                    (item) => `
                  <tr>
                    <td>${item.date}</td>
                    <td>${item.order_num}</td>
                    <td>${item.supplier}</td>
                    <td>${item.type}</td>
                    <td>${item.invoice_num}</td>
                    <td>${item.revision}</td>
                    <td class="text-right">$${item.total.toFixed(2)}</td>
                  </tr>
                `,
                )
                .join("")}
                <tr class="total-row">
                  <td colspan="6" class="text-right">Total</td>
                  <td class="text-right">$${totalAmount.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
            
            <div class="footer">
              <p>TrackDesk - Settlement Report</p>
            </div>
          </body>
        </html>
      `)

        // Trigger print and close the window when done
        printWindow.document.close()
        printWindow.focus()

        // Use a slight delay to ensure the content is loaded
        setTimeout(() => {
            printWindow.print()
            // Don't automatically close the window to allow the user to see the print preview
            printWindow.close()
        }, 250)
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-xl">
                        Settlement #{settlement.id} - Ticket #{settlement.ticket_id}
                    </DialogTitle>
                </DialogHeader>

                <Tabs
                    defaultValue="edit"
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="flex-1 overflow-hidden flex flex-col"
                >
                    <TabsList className="w-full">
                        <TabsTrigger value="edit">Edit Settlement</TabsTrigger>
                        <TabsTrigger value="activity">Activity History</TabsTrigger>
                    </TabsList>

                    <TabsContent value="edit" className="flex-1 overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                            {/* Left side - Edit Form */}
                            <div className="overflow-y-auto p-1">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-medium">Settlement Items</h3>
                                        <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                                            <PlusCircle className="h-4 w-4 mr-2" />
                                            Add Item
                                        </Button>
                                    </div>

                                    <div className="space-y-4">
                                        {items.map((item, index) => (
                                            <div key={index} className="grid grid-cols-1 gap-4 p-4 border rounded-md">
                                                <div className="flex justify-between items-center mb-2">
                                                    <h4 className="font-medium">Item #{index + 1}</h4>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleRemoveItem(index)}
                                                        disabled={items.length <= 1}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                        <span className="sr-only">Remove item</span>
                                                    </Button>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor={`date-${index}`}>Date</Label>
                                                        <Input
                                                            id={`date-${index}`}
                                                            type="date"
                                                            value={item.date}
                                                            onChange={(e) => handleItemChange(index, "date", e.target.value)}
                                                            required
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor={`order-${index}`}>Order #</Label>
                                                        <Input
                                                            id={`order-${index}`}
                                                            value={item.order_num}
                                                            onChange={(e) => handleItemChange(index, "order_num", e.target.value)}
                                                            placeholder="Order number"
                                                            required
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor={`supplier-${index}`}>Supplier</Label>
                                                        <Input
                                                            id={`supplier-${index}`}
                                                            value={item.supplier}
                                                            onChange={(e) => handleItemChange(index, "supplier", e.target.value)}
                                                            placeholder="Supplier name"
                                                            required
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor={`type-${index}`}>Type</Label>
                                                        <Select value={item.type} onValueChange={(value) => handleItemChange(index, "type", value)}>
                                                            <SelectTrigger id={`type-${index}`}>
                                                                <SelectValue placeholder="Select type" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {types.map((type) => (
                                                                    <SelectItem key={type} value={type}>
                                                                        {type}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor={`invoice-${index}`}>Invoice #</Label>
                                                        <Input
                                                            id={`invoice-${index}`}
                                                            value={item.invoice_num}
                                                            onChange={(e) => handleItemChange(index, "invoice_num", e.target.value)}
                                                            placeholder="Invoice number"
                                                            required
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor={`total-${index}`}>Total</Label>
                                                        <Input
                                                            id={`total-${index}`}
                                                            type="number"
                                                            step="0.01"
                                                            value={item.total}
                                                            onChange={(e) => handleItemChange(index, "total", e.target.value)}
                                                            placeholder="0.00"
                                                            required
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor={`revision-${index}`}>Revision Date</Label>
                                                        <Input
                                                            id={`revision-${index}`}
                                                            type="date"
                                                            value={item.revision}
                                                            onChange={(e) => handleItemChange(index, "revision", e.target.value)}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right side - Preview */}
                            <div className="border rounded-md overflow-y-auto bg-background p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-medium">Print Preview</h3>
                                    <Button variant="outline" size="sm" onClick={handlePrint}>
                                        <Printer className="h-4 w-4 mr-2" />
                                        Print
                                    </Button>
                                </div>

                                <div id="settlement-print-preview">
                                    <div className="mb-4">
                                        <h2 className="text-xl font-bold">Settlement #{settlement.id}</h2>
                                        <p className="text-sm text-muted-foreground">
                                            Ticket #{settlement.ticket_id} | Assignee:{" "}
                                            {settlement.user.name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">Generated: {format(new Date(), "PPP p")}</p>
                                    </div>

                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Order #</TableHead>
                                                <TableHead>Supplier</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Invoice #</TableHead>
                                                <TableHead>Revision</TableHead>
                                                <TableHead className="text-right">Total</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {items.map((item, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{item.date}</TableCell>
                                                    <TableCell>{item.order_num}</TableCell>
                                                    <TableCell>{item.supplier}</TableCell>
                                                    <TableCell>{item.type}</TableCell>
                                                    <TableCell>{item.invoice_num}</TableCell>
                                                    <TableCell>{item.revision}</TableCell>
                                                    <TableCell className="text-right">${item.total.toFixed(2)}</TableCell>
                                                </TableRow>
                                            ))}
                                            <TableRow className="font-bold">
                                                <TableCell colSpan={6} className="text-right">
                                                    Total
                                                </TableCell>
                                                <TableCell className="text-right">${totalAmount.toFixed(2)}</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="activity" className="flex-1 overflow-y-auto p-4">
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Activity History</h3>

                            {activities.length === 0 ? (
                                <p className="text-muted-foreground">No activity recorded for this settlement.</p>
                            ) : (
                                <div className="space-y-3">
                                    {activities.map((activity, index) => (
                                        <div key={index} className="border rounded-md p-3 space-y-1">
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium">{activity.user}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {format(new Date(activity.timestamp), "PPP p")}
                                                </span>
                                            </div>
                                            <p className="text-sm">
                                                <span className="font-medium capitalize">{activity.action.replace("_", " ")}</span>:{" "}
                                                {activity.details}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>

                <DialogFooter className="mt-6 flex justify-between items-center">
                    <div className="text-lg font-medium">
                        Total: <span className="font-bold">${totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={isSubmitting}>
                            <Save className="h-4 w-4 mr-2" />
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}