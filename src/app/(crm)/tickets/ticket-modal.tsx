"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { addTicket, updateTicket, fetchCustomersForSelect, fetchUsersForSelect, createActivityEntry } from "@/lib/api"
import { getUser } from "@/lib/client-auth"
import type { Ticket, User } from "@/lib/api"
import { useSettings } from '@/lib/settings-context';
import { useTranslations } from 'next-intl'

interface TicketModalProps {
    ticket?: Ticket | null
    isOpen: boolean
    onClose: () => void
    mode: "add" | "edit"
    onSuccess?: (ticket: Ticket) => void
}

const initialTicketState: Omit<Ticket, "id"> = {
    title: "",
    status: "open",
    tags: "",
    user_id: 0,
    priority: "low",
    customer_id: 0,
    notes: "[]",
    activity: "[]",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
}

export function TicketModal({ ticket, isOpen, onClose, mode, onSuccess }: TicketModalProps) {
    const [formData, setFormData] = useState<Omit<Ticket, "id"> & { id?: number }>(initialTicketState)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [currentUser, setCurrentUser] = useState<User>()
    const [customers, setCustomers] = useState<{ id: number; label: string }[]>([])
    const [users, setUsers] = useState<{ id: number; label: string }[]>([])
    const { toast } = useToast()
    const { settings } = useSettings();
    const t = useTranslations('TicketModal');
    const tCommon = useTranslations('Common');

    const statusOptions = ["all", ...(settings?.status?.split(",") || [])]
    const priorityOptions = ["all", ...(settings?.priority?.split(",") || [])]

    // Fetch the current user when the component mounts
    useEffect(() => {
        async function fetchUser() {
            const user = await getUser()
            setCurrentUser(user)
        }

        fetchUser()
    }, [])

    // Fetch customers and users for dropdowns
    useEffect(() => {
        async function fetchData() {
            if (currentUser) {
                const [customersData, usersData] = await Promise.all([
                    fetchCustomersForSelect(currentUser.alias),
                    fetchUsersForSelect(currentUser.alias),
                ])
                setCustomers(customersData)
                setUsers(usersData)
            }
        }

        if (isOpen && currentUser) {
            fetchData()
        }
    }, [isOpen, currentUser])

    // Reset form when modal opens/closes or ticket changes
    useEffect(() => {
        if (isOpen) {
            if (mode === "edit" && ticket) {
                setFormData({
                    title: ticket.title,
                    status: ticket.status,
                    tags: ticket.tags,
                    user_id: ticket.user_id,
                    priority: ticket.priority,
                    customer_id: ticket.customer_id,
                    notes: ticket.notes,
                    activity: ticket.activity,
                    created_at: ticket.created_at,
                    updated_at: new Date().toISOString(), // Update the timestamp
                    id: ticket.id,
                })
            } else {
                // For new tickets, set the current user as the assignee and initialize timestamps
                const now = new Date().toISOString()
                setFormData({
                    ...initialTicketState,
                    user_id: currentUser?.id || 0,
                    activity: JSON.stringify([createActivityEntry("created", currentUser?.name || "system", "Ticket created")]),
                    created_at: now,
                    updated_at: now,
                })
            }
        }
    }, [isOpen, ticket, mode, currentUser])

    function handleChange(field: keyof Ticket, value: string | number) {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
            // Update the updated_at timestamp whenever a field changes (for edit mode)
            ...(mode === "edit" && { updated_at: new Date().toISOString() }),
        }))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            if (!currentUser) {
                throw new Error("User not authenticated")
            }

            let result
            if (mode === "add") {
                // For adding a new ticket
                result = await addTicket(currentUser.alias, formData)
            } else {
                // For updating an existing ticket
                if (!formData.id) {
                    throw new Error("Ticket ID is required for updates")
                }

                // Add an activity entry for the update
                const activities = JSON.parse(formData.activity)
                activities.push(createActivityEntry("updated", currentUser.name, "Ticket details updated"))

                result = await updateTicket(currentUser.alias, {
                    ...formData,
                    activity: JSON.stringify(activities),
                    updated_at: new Date().toISOString(), // Ensure updated timestamp
                } as Ticket)
            }

            if (result.success) {
                toast({
                    title: mode === "add" ? "Ticket created" : "Ticket updated",
                    description: result.message,
                })

                // Call the onSuccess callback with the new/updated ticket
                if (onSuccess && result.ticket) {
                    onSuccess(result.ticket)
                }

                onClose()
            } else {
                throw new Error(result.message)
            }
        } catch (error) {
            console.error("Error in form submission:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "An error occurred",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{mode === "add" ? t('new') : t('edit')}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">{t('title')}</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => handleChange("title", e.target.value)}
                                placeholder={t('titlePlaceholder')}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="status">{tCommon('status.name')}</Label>
                                <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                                    <SelectTrigger id="status">
                                        <SelectValue placeholder="Select status" />
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

                            <div className="space-y-2">
                                <Label htmlFor="priority">{tCommon('priority.name')}</Label>
                                <Select value={formData.priority} onValueChange={(value) => handleChange("priority", value)}>
                                    <SelectTrigger id="priority">
                                        <SelectValue placeholder="Select priority" />
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

                        <div className="space-y-2">
                            <Label htmlFor="customer_id">{t('customer')}</Label>
                            <Select
                                value={formData.customer_id.toString()}
                                onValueChange={(value) => handleChange("customer_id", Number.parseInt(value))}
                            >
                                <SelectTrigger id="customer_id">
                                    <SelectValue placeholder="Select customer" />
                                </SelectTrigger>
                                <SelectContent>
                                    {customers.map((customer) => (
                                        <SelectItem key={customer.id} value={customer.id.toString()}>
                                            {customer.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="user_id">{t('assignee')}</Label>
                            <Select
                                value={formData.user_id.toString()}
                                onValueChange={(value) => handleChange("user_id", Number.parseInt(value))}
                            >
                                <SelectTrigger id="user_id">
                                    <SelectValue placeholder="Select assignee" />
                                </SelectTrigger>
                                <SelectContent>
                                    {users.map((user) => (
                                        <SelectItem key={user.id} value={user.id.toString()}>
                                            {user.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tags">{t('tags')}</Label>
                            <Input
                                id="tags"
                                value={formData.tags}
                                onChange={(e) => handleChange("tags", e.target.value)}
                                placeholder={t('tagsPlaceholder')}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            {t('cancel')}
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting
                                ? mode === "add"
                                    ? t('button.submit.create')
                                    : t('button.submit.update')
                                : mode === "add"
                                    ? t('button.create')
                                    : t('button.update')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}