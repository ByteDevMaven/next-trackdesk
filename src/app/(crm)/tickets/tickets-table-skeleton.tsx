import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function TicketsTableSkeleton() {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">ID</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Assignee</TableHead>
                        <TableHead>Created</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: 10 }).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell>
                                <Skeleton className="h-5 w-10" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-5 w-full" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-5 w-20" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-5 w-16" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-5 w-24" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-5 w-24" />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}