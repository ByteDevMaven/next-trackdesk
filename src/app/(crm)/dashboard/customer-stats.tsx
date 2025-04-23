export function CustomerStats({ customers }: { customers: { id: number; name: string; email: string }[] }) {
    return (
        <div className="p-4 border rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Customer Stats</h2>
            <ul className="space-y-2">
                {customers.map((customer) => (
                    <li key={customer.id} className="flex justify-between items-center">
                        <div>
                            <p className="font-medium">{customer.name}</p>
                            <p className="text-sm text-gray-500">{customer.email}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}