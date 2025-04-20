import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function CustomersTableSkeleton() {
    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: 10 }).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell>
                                    <Skeleton className="h-5 w-10" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-5 w-full max-w-[200px]" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-5 w-full max-w-[180px]" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-5 w-32" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-9 w-full" />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <div className="flex justify-center">
                <Skeleton className="h-10 w-64" />
            </div>
        </div>
    )
}