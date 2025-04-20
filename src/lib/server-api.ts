export async function getUser() {
    try {
        // Dynamic import to avoid static analysis errors
        const { cookies } = await import("next/headers")
        const cookieStore = await cookies()
        const authToken = cookieStore.get("auth-token")

        if (!authToken) {
            return null
        }

        return JSON.parse(authToken.value)
    } catch (error) {
        console.error("Error getting user from cookie:", error)
        return null
    }
}

// Common types used by both server and client
export type User = {
    id: number
    name: string
    role: string
    email: string
    alias: string
}

// Update the Ticket type to match the new API response format
export type Ticket = {
    id: number
    title: string
    status: string
    tags: string
    user_id: number // Changed from assignee to user_id
    priority: string
    customer_id: number
    notes: string
    created_at: string
    updated_at: string
    activity: string
    user?: UserDetails // Added nested user data
    customer?: Customer // Added nested customer data
    settlements?: Settlement[] // Added nested settlements data
}

export type TicketNote = {
    id: number
    user: string
    content: string
    created_at: string
}

export type TicketActivity = {
    timestamp: string
    action: string
    user: string
    details: string
}

export type Settlement = {
    id: number
    ticket_id?: number
    user_id?: number
    data?: string
    activity?: string
    user?: UserDetails
}

export type SettlementData = {
    date: string
    order_num: string
    supplier: string
    type: string
    invoice_num: string
    total: number
    revision: string
}

export type SettlementActivity = {
    timestamp: string
    action: string
    user: string
    details: string
}

export type Settings = {
    name: string
    logo: string
    priority: string
    type: string
    status: string
    tags: string
    modules: string
}

export type UserDetails = {
    id: number
    name: string
    email: string
    role: string
    status: string
}

export type PaginatedResponse<T> = {
    page: number
    per_page: number
    total: number
    data: T[]
}

export type ApiResponse<T = unknown> = {
    status: number
} & {
    [key: string]: T
}

export type Customer = {
    id: number
    title: string
    name: string
    email: string
    phone: string
}

// Server-side API functions
export async function fetchSettings(alias: string): Promise<Settings> {
    const response = await fetch(
        `https://script.google.com/macros/s/AKfycbyb-rUF-dPBjWyYZobtChUaRC4ppv0IU_UKTeNTI1Af3msJIUeaxbzzKDVGFt0mfZv-/exec?alias=${alias}&sheet=settings&key=74792ffbf37a3ddcb4dff279c7ef7ffc`,
        { cache: "no-store" },
    )

    if (!response.ok) {
        throw new Error("Failed to fetch settings")
    }

    const data = (await response.json()) as ApiResponse & { settings: PaginatedResponse<Settings> }
    return data.settings.data[0]
}

// Update fetchTickets to handle the new response format
export async function fetchTickets(
    alias: string,
    page = 1,
    limit = 10,
    userId?: number,
): Promise<PaginatedResponse<Ticket>> {
    let url = `https://script.google.com/macros/s/AKfycbyb-rUF-dPBjWyYZobtChUaRC4ppv0IU_UKTeNTI1Af3msJIUeaxbzzKDVGFt0mfZv-/exec?alias=${alias}&sheet=tickets&limit=${limit}&page=${page}&sort_by=id&order=desc&key=74792ffbf37a3ddcb4dff279c7ef7ffc`

    // If userId is provided, only fetch tickets assigned to this user
    if (userId) {
        url += `&user_id=${userId}` // Updated from assignee to user_id
    }

    const response = await fetch(url, { cache: "no-store" })

    if (!response.ok) {
        throw new Error("Failed to fetch tickets")
    }

    const data = (await response.json()) as ApiResponse & { tickets: PaginatedResponse<Ticket> }
    return data.tickets
}

// Add function to add a new ticket
export async function addTicket(
    alias: string,
    ticketData: Omit<Ticket, "id" | "created_at" | "updated_at">,
): Promise<{ success: boolean; message: string; ticket?: Ticket }> {
    try {
        const requestBody = {
            alias,
            sheet: "tickets",
            action: "add",
            key: "74792ffbf37a3ddcb4dff279c7ef7ffc",
            data: ticketData,
        }

        const response = await fetch(
            `https://script.google.com/macros/s/AKfycbyb-rUF-dPBjWyYZobtChUaRC4ppv0IU_UKTeNTI1Af3msJIUeaxbzzKDVGFt0mfZv-/exec`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            },
        )

        const result = await response.json()

        if (!response.ok) {
            throw new Error(result.message || "Failed to add ticket")
        }

        return {
            success: result.status === 200,
            message: result.message || "Ticket added successfully",
            ticket: result.ticket,
        }
    } catch (error) {
        console.error("Error adding ticket:", error)
        return {
            success: false,
            message: error instanceof Error ? error.message : "Failed to add ticket",
        }
    }
}

// Add function to update an existing ticket
export async function updateTicket(
    alias: string,
    ticketData: Partial<Ticket> & { id: number },
): Promise<{ success: boolean; message: string; ticket?: Ticket }> {
    try {
        const requestBody = {
            alias,
            sheet: "tickets",
            action: "update",
            key: "74792ffbf37a3ddcb4dff279c7ef7ffc",
            data: ticketData,
        }

        const response = await fetch(
            `https://script.google.com/macros/s/AKfycbyb-rUF-dPBjWyYZobtChUaRC4ppv0IU_UKTeNTI1Af3msJIUeaxbzzKDVGFt0mfZv-/exec`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            },
        )

        const result = await response.json()

        if (!response.ok) {
            throw new Error(result.message || "Failed to update ticket")
        }

        return {
            success: result.status === 200,
            message: result.message || "Ticket updated successfully",
            ticket: result.ticket,
        }
    } catch (error) {
        console.error("Error updating ticket:", error)
        return {
            success: false,
            message: error instanceof Error ? error.message : "Failed to update ticket",
        }
    }
}

// Add function to fetch customers for dropdown selection
export async function fetchCustomersForSelect(alias: string): Promise<{ id: number; label: string }[]> {
    try {
        const response = await fetch(
            `https://script.google.com/macros/s/AKfycbyb-rUF-dPBjWyYZobtChUaRC4ppv0IU_UKTeNTI1Af3msJIUeaxbzzKDVGFt0mfZv-/exec?alias=${alias}&sheet=customers&limit=100&key=74792ffbf37a3ddcb4dff279c7ef7ffc`,
            { cache: "no-store" },
        )

        if (!response.ok) {
            throw new Error("Failed to fetch customers")
        }

        const data = (await response.json()) as ApiResponse

        const customers = data.customers as { data: Customer[] };
        return customers.data.map((customer: Customer) => ({
            id: customer.id,
            label: `${customer.title} ${customer.name} (${customer.email})`,
        }))
    } catch (error) {
        console.error("Error fetching customers for select:", error)
        return []
    }
}

// Add function to fetch users for dropdown selection
export async function fetchUsersForSelect(alias: string): Promise<{ id: number; label: string }[]> {
    try {
        const response = await fetch(
            `https://script.google.com/macros/s/AKfycbyb-rUF-dPBjWyYZobtChUaRC4ppv0IU_UKTeNTI1Af3msJIUeaxbzzKDVGFt0mfZv-/exec?alias=${alias}&sheet=users&limit=100&key=74792ffbf37a3ddcb4dff279c7ef7ffc`,
            { cache: "no-store" },
        )

        if (!response.ok) {
            throw new Error("Failed to fetch users")
        }

        const data = (await response.json()) as ApiResponse

        const users = data.users as { data: User[] };
        return users.data.map((user: User) => ({
            id: user.id,
            label: `${user.name} (${user.role})`,
        }))
    } catch (error) {
        console.error("Error fetching users for select:", error)
        return []
    }
}

export async function fetchSettlements(
    alias: string,
    ticketId?: number,
    page = 1,
    limit = 10,
    settlementId?: number,
): Promise<PaginatedResponse<Settlement>> {
    let url = `https://script.google.com/macros/s/AKfycbyb-rUF-dPBjWyYZobtChUaRC4ppv0IU_UKTeNTI1Af3msJIUeaxbzzKDVGFt0mfZv-/exec?alias=${alias}&sheet=settlements&limit=${limit}&page=${page}&key=74792ffbf37a3ddcb4dff279c7ef7ffc`

    if (ticketId) {
        url += `&ticket_id=${ticketId}`
    }

    if (settlementId) {
        url += `&id=${settlementId}`
    }

    const response = await fetch(url, { cache: "no-store" })

    if (!response.ok) {
        throw new Error("Failed to fetch settlements")
    }

    const data = (await response.json()) as ApiResponse & { settlements: PaginatedResponse<Settlement> }
    return data.settlements
}

export async function fetchUserById(alias: string, userId: number): Promise<UserDetails | null> {
    try {
        const response = await fetch(
            `https://script.google.com/macros/s/AKfycbyb-rUF-dPBjWyYZobtChUaRC4ppv0IU_UKTeNTI1Af3msJIUeaxbzzKDVGFt0mfZv-/exec?alias=${alias}&sheet=users&id=${userId}&key=74792ffbf37a3ddcb4dff279c7ef7ffc`,
            { cache: "no-store" },
        )

        if (!response.ok) {
            return null
        }

        const data = await response.json()
        if (data.status === 200 && data.users && data.users.data && data.users.data.length > 0) {
            return data.users.data[0]
        }
        return null
    } catch (error) {
        console.error("Failed to fetch user:", error)
        return null
    }
}

export async function fetchCustomers(
    alias: string,
    page = 1,
    limit = 10,
    search?: string,
): Promise<PaginatedResponse<Customer>> {
    let url = `https://script.google.com/macros/s/AKfycbyb-rUF-dPBjWyYZobtChUaRC4ppv0IU_UKTeNTI1Af3msJIUeaxbzzKDVGFt0mfZv-/exec?alias=${alias}&sheet=customers&limit=${limit}&page=${page}&key=74792ffbf37a3ddcb4dff279c7ef7ffc`

    if (search) {
        // Use name__contains instead of search
        url += `&name__contains=${encodeURIComponent(search)}`
    }

    const response = await fetch(url, { cache: "no-store" })

    if (!response.ok) {
        throw new Error("Failed to fetch customers")
    }

    const data = (await response.json()) as ApiResponse & { customers: PaginatedResponse<Customer> }
    return data.customers
}  