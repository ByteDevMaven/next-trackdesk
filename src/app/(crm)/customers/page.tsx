import { Suspense } from "react"
import { getUser, fetchCustomers, User } from "@/lib/server-api"
import { CustomersHeader } from "./customers-header"
import { CustomersTable } from "./customers-table"
import { CustomersTableSkeleton } from "./customers-table-skeleton"

export default async function CustomersPage({
    searchParams,
}: {
    searchParams: { page?: string; name__contains?: string }
}) {
    const user = await getUser()
    if (!user) {
        return <div>Not authenticated</div>
    }

    const page = searchParams.page ? Number.parseInt(searchParams.page) : 1
    const search = searchParams.name__contains || undefined

    return (
        <div className="space-y-4">
            <CustomersHeader />
            <Suspense fallback={<CustomersTableSkeleton />}>
                <CustomersContent page={page} user={user} search={search} />
            </Suspense>
        </div>
    )
}

async function CustomersContent({ page, user, search }: { page: number; user: User; search?: string }) {
    const customers = await fetchCustomers(user.alias, page, 10, search)

    return <CustomersTable customers={customers} currentPage={page} user={user} search={search} />
}