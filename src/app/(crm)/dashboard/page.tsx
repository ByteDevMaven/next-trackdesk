import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function DashboardPage() {
    // Get user data from cookie
    const cookieStore = await cookies()
    const authToken = cookieStore.get("auth-token")

    if (!authToken) {
        redirect("/login")
    }

    let user
    try {
        user = JSON.parse(authToken.value)
    } catch (error) {
        console.error("Failed to parse user data from cookie:", error)
    }

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6">TrackDesk Dashboard</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Welcome, {user.name}!</CardTitle>
                    <CardDescription>
                        You are logged in as {user.email} for company alias: {user.alias}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="mb-4">This is a protected page that only authenticated users can access.</p>
                    <form action="/api/auth/logout" method="post">
                        <Button type="submit" variant="outline">
                            Sign out
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}