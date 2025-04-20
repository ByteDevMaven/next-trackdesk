import { CustomersHeader } from "./customers-header"
import { CustomersTableSkeleton } from "./customers-table-skeleton"

export default function Loading() {
    return (
        <div className="space-y-4">
            <CustomersHeader />
            <CustomersTableSkeleton />
        </div>
    )
}