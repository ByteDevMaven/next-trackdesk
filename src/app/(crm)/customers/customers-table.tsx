"use client"

import { useState } from "react"
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
import { Edit, Eye, Mail, Phone } from "lucide-react"
import { CustomerModal } from "./customer-modal"
import { CustomerDetailModal } from "./customer-detail-modal"
import type { PaginatedResponse, Customer, User } from "@/lib/api"
import { useTranslations } from "next-intl"

interface CustomersTableProps {
    customers: PaginatedResponse<Customer>
    currentPage: number
    user: User
    search?: string
}

export function CustomersTable({ customers, currentPage, search }: CustomersTableProps) {
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
    const t = useTranslations('CustomersPage');

    const totalPages = Math.ceil(customers.total / customers.per_page)

    function handleEdit(customer: Customer) {
        setSelectedCustomer(customer)
        setIsEditModalOpen(true)
    }

    function handleView(customer: Customer) {
        setSelectedCustomer(customer)
        setIsDetailModalOpen(true)
    }

    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">{t('table.id')}</TableHead>
                            <TableHead>{t('table.name')}</TableHead>
                            <TableHead>{t('table.email')}</TableHead>
                            <TableHead>{t('table.phone')}</TableHead>
                            <TableHead className="text-right">{t('table.actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {customers.data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    {search ? t('emptySearch') : t('empty')}
                                </TableCell>
                            </TableRow>
                        ) : (
                            customers.data.map((customer) => (
                                <TableRow key={customer.id} className="hover:bg-muted/50">
                                    <TableCell className="font-medium">#{customer.id}</TableCell>
                                    <TableCell>
                                        {customer.title} {customer.name}
                                    </TableCell>
                                    <TableCell>
                                        <a
                                            href={`mailto:${customer.email}`}
                                            className="flex items-center gap-1 text-primary hover:underline"
                                        >
                                            <Mail className="h-4 w-4" />
                                            {customer.email}
                                        </a>
                                    </TableCell>
                                    <TableCell>
                                        <a href={`tel:${customer.phone}`} className="flex items-center gap-1 hover:underline">
                                            <Phone className="h-4 w-4" />
                                            {customer.phone}
                                        </a>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" size="sm" onClick={() => handleView(customer)}>
                                                <Eye className="h-4 w-4" />
                                                <span className="sr-only">{t('view')}</span>
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => handleEdit(customer)}>
                                                <Edit className="h-4 w-4" />
                                                <span className="sr-only">{t('edit')}</span>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {totalPages > 1 && (
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                href={
                                    currentPage > 1
                                        ? `/customers?page=${currentPage - 1}${search ? `&name__contains=${encodeURIComponent(search)}` : ""}`
                                        : "#"
                                }
                                aria-disabled={currentPage <= 1}
                                className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                            />
                        </PaginationItem>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <PaginationItem key={page}>
                                <PaginationLink
                                    href={`/customers?page=${page}${search ? `&name__contains=${encodeURIComponent(search)}` : ""}`}
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
                                        ? `/customers?page=${currentPage + 1}${search ? `&name__contains=${encodeURIComponent(search)}` : ""}`
                                        : "#"
                                }
                                aria-disabled={currentPage >= totalPages}
                                className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}

            {/* Edit Customer Modal */}
            <CustomerModal
                customer={selectedCustomer}
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                mode="edit"
            />

            {/* View Customer Modal */}
            <CustomerDetailModal
                customer={selectedCustomer}
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                onEdit={() => {
                    setIsDetailModalOpen(false)
                    setIsEditModalOpen(true)
                }}
            />
        </div>
    )
}