export function DashboardWidgets({ user }: { user: { name: string } }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg shadow">
                <h3 className="text-lg font-semibold">Tickets Overview</h3>
                <p className="text-sm text-gray-500">Track your open and closed tickets.</p>
            </div>
            <div className="p-4 border rounded-lg shadow">
                <h3 className="text-lg font-semibold">Customer Insights</h3>
                <p className="text-sm text-gray-500">Analyze customer engagement.</p>
            </div>
            <div className="p-4 border rounded-lg shadow">
                <h3 className="text-lg font-semibold">Activity Logs</h3>
                <p className="text-sm text-gray-500">View recent actions and updates.</p>
            </div>
        </div>
    );
}