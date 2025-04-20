import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        const cookieStore = await cookies()
        const authToken = cookieStore.get("auth-token")

        if (!authToken) {
            return NextResponse.json({ authenticated: false }, { status: 401 })
        }

        // Parse the user data from the auth token
        const userData = JSON.parse(authToken.value)

        // Return the user data without sensitive information
        return NextResponse.json({
            authenticated: true,
            user: {
                id: userData.id,
                name: userData.name,
                email: userData.email,
                alias: userData.alias,
            },
        })
    } catch (error) {
        console.error("Error in auth/me endpoint:", error)
        return NextResponse.json({ authenticated: false, error: "Authentication failed" }, { status: 500 })
    }
}