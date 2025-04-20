"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusCircle, Search } from "lucide-react"
import { CustomerModal } from "./customer-modal"

export function CustomersHeader() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
    const [showAddModal, setShowAddModal] = useState(false)

    function handleSearch(e: React.FormEvent) {
        e.preventDefault()

        if (searchQuery) {
            // Navigate to the search results page
            router.push(`/customers?name__contains=${encodeURIComponent(searchQuery)}`)
        } else {
            router.push("/customers")
        }
    }

    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
                <p className="text-muted-foreground">Manage your customer database</p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
                <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
                    <Input
                        type="search"
                        placeholder="Search customers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full"
                    />
                    <Button type="submit" size="icon">
                        <Search className="h-4 w-4" />
                        <span className="sr-only">Search</span>
                    </Button>
                </form>

                <Button onClick={() => setShowAddModal(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Customer
                </Button>
            </div>

            <CustomerModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} mode="add" />
        </div>
    )
}
