import { User } from "./server-api"

// Client-side authentication utilities
let cachedUser: User | null;

export async function getUser() {
    // Return cached user if available
    if (cachedUser) {
        return cachedUser
    }

    try {
        // Fetch user data from the API
        const response = await fetch("/api/auth/me")

        if (!response.ok) {
            return null
        }

        const data = await response.json()

        if (!data.authenticated) {
            return null
        }

        // Cache the user data
        cachedUser = data.user
        return data.user
    } catch (error) {
        console.error("Error fetching user data:", error)
        return null
    }
}

// Clear the cached user data (useful for logout)
export function clearUserCache() {
    cachedUser = null
}