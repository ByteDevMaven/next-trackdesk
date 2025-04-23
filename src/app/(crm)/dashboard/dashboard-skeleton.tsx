export function DashboardSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg shadow bg-background animate-pulse">Loading...</div>
            <div className="p-4 border rounded-lg shadow bg-background animate-pulse">Loading...</div>
            <div className="p-4 border rounded-lg shadow bg-background animate-pulse">Loading...</div>
        </div>
    );
}