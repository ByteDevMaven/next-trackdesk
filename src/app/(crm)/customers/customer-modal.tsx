"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { addCustomer, updateCustomer } from "@/lib/api"
import { getUser } from "@/lib/client-auth"
import type { Customer, User } from "@/lib/api"
import { useSettings } from '@/lib/settings-context';
import { useTranslations } from "next-intl"

interface CustomerModalProps {
    customer?: Customer | null
    isOpen: boolean
    onClose: () => void
    mode: "add" | "edit"
}

const initialCustomerState: Omit<Customer, "id"> = {
    title: "Mr.",
    name: "",
    email: "",
    phone: "",
}

export function CustomerModal({ customer, isOpen, onClose, mode }: CustomerModalProps) {
    const [formData, setFormData] = useState<Omit<Customer, "id"> & { id?: number }>(initialCustomerState)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [currentUser, setCurrentUser] = useState<User>()
    const { toast } = useToast()
    const router = useRouter()
    const { settings } = useSettings();
    const t = useTranslations('CustomerModal');

    const titleOptions = ["N/A", ...(settings?.titles?.split(",") || [])]

    // Fetch the current user when the component mounts
    useEffect(() => {
        async function fetchUser() {
            const user = await getUser()
            setCurrentUser(user)
        }

        fetchUser()
    }, [])

    // Reset form when modal opens/closes or customer changes
    useEffect(() => {
        if (isOpen) {
            if (mode === "edit" && customer) {
                setFormData(customer)
            } else {
                setFormData(initialCustomerState)
            }
        }
    }, [isOpen, customer, mode])

    function handleChange(field: keyof Customer, value: string) {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        // console.log("Form submitted with data:", formData)
        setIsSubmitting(true)

        try {
            if (!currentUser) {
                throw new Error("User not authenticated")
            }

            let result
            if (mode === "add") {
                // For adding a new customer
                const { ...customerData } = formData
                result = await addCustomer(currentUser.alias, customerData)
            } else {
                // For updating an existing customer
                if (!formData.id) {
                    throw new Error("Customer ID is required for updates")
                }
                result = await updateCustomer(currentUser.alias, formData as Customer)
            }

            if (result.success) {
                toast({
                    title: mode === "add" ? "Customer added" : "Customer updated",
                    description: result.message,
                })
                onClose()
                router.refresh()
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
                            <Select value={formData.title} onValueChange={(value) => handleChange("title", value)}>
                                <SelectTrigger id="title">
                                    <SelectValue placeholder="Select title" />
                                </SelectTrigger>
                                <SelectContent>
                                    {titleOptions.map((title) => (
                                        <SelectItem key={title} value={title}>
                                            {title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">{t('name')}</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleChange("name", e.target.value)}
                                placeholder={t('namePlaceholder')}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">{t('email')}</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleChange("email", e.target.value)}
                                placeholder={t('emailPlaceholder')}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">{t('phone')}</Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => handleChange("phone", e.target.value)}
                                placeholder={t('phonePlaceholder')}
                                required
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