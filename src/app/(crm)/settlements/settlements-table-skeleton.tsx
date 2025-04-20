import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function SettlementsTableSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-10 w-32" />
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">ID</TableHead>
                            <TableHead>Ticket</TableHead>
                            <TableHead>Assignee</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell>
                                    <Skeleton className="h-5 w-10" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-5 w-24" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-5 w-16" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-5 w-12" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-5 w-20" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-8 w-full" />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}