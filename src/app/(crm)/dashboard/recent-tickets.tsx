import Link from "next/link";

export function RecentTickets({ tickets }: { tickets: { id: number; title: string; status: string }[] }) {
    return (
        <div className="p-4 border rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Recent Tickets</h2>
            <ul className="space-y-2">
                {tickets.map((ticket) => (
                    <li key={ticket.id} className="flex justify-between items-center">
                        <Link href={`/tickets?id=${ticket.id}`} className="text-blue-600 hover:underline">
                            {ticket.title}
                        </Link>
                        <span
                            className={`px-2 py-1 text-xs rounded ${ticket.status === "open" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                                }`}
                        >
                            {ticket.status}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}