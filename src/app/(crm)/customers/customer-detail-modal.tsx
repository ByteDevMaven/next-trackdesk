"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Edit, Mail, Phone } from "lucide-react"
import type { Customer } from "@/lib/api"

interface CustomerDetailModalProps {
    customer: Customer | null
    isOpen: boolean
    onClose: () => void
    onEdit: () => void
}

export function CustomerDetailModal({ customer, isOpen, onClose, onEdit }: CustomerDetailModalProps) {
    if (!customer) return null

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl">
                        {customer.title} {customer.name}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="flex items-start gap-2">
                        <Mail className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium">Email</p>
                            <a href={`mailto:${customer.email}`} className="text-primary hover:underline">
                                {customer.email}
                            </a>
                        </div>
                    </div>

                    <div className="flex items-start gap-2">
                        <Phone className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium">Phone</p>
                            <a href={`tel:${customer.phone}`} className="hover:underline">
                                {customer.phone}
                            </a>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                    <Button onClick={onEdit}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}