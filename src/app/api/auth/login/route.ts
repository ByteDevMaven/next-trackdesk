import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
    try {
        const { email, password, alias } = await request.json()

        if (!email || !password || !alias) {
            return NextResponse.json({ message: "Email, password, and alias are required" }, { status: 400 })
        }

        // Fetch user data from the Google Apps Script endpoint
        const apiUrl = `https://script.google.com/macros/s/AKfycbyb-rUF-dPBjWyYZobtChUaRC4ppv0IU_UKTeNTI1Af3msJIUeaxbzzKDVGFt0mfZv-/exec?alias=${alias}&sheet=users&email=${encodeURIComponent(email)}&key=74792ffbf37a3ddcb4dff279c7ef7ffc`

        const response = await fetch(apiUrl)

        if (!response.ok) {
            return NextResponse.json({ message: "Failed to verify user" }, { status: 500 })
        }

        const data = await response.json()

        // Check if user exists
        if (!data.users || data.users.total === 0) {
            return NextResponse.json({ message: "User not found" }, { status: 401 })
        }

        const user = data.users.data[0]

        // Verify password
        if (user.password !== password) {
            return NextResponse.json({ message: "Invalid password" }, { status: 401 })
        }

        // Set authentication cookie
        const oneWeek = 7 * 24 * 60 * 60 * 1000
        const cookieStore = await cookies();
        cookieStore.set({
            name: "auth-token",
            value: JSON.stringify({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                alias,
            }),
            httpOnly: true,
            path: "/",
            secure: process.env.NODE_ENV === "production",
            maxAge: oneWeek,
        });

        return NextResponse.json({
            message: "Login successful",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        })
    } catch (error) {
        console.error("Login error:", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}