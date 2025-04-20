import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST() {
    (await cookies()).delete("auth-token")

    return NextResponse.json({ message: "Logged out successfully" }, { status: 200 })
}