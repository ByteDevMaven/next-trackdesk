// Client-side API functions
import type {
    Ticket,
    TicketNote,
    TicketActivity,
    Settlement,
    SettlementData,
    SettlementActivity,
    PaginatedResponse,
    User,
    ApiResponse,
    Settings,
    UserDetails,
    Customer,
} from "./server-api"

export type {
    Ticket,
    TicketNote,
    TicketActivity,
    Settlement,
    SettlementData,
    SettlementActivity,
    PaginatedResponse,
    User,
    ApiResponse,
    Settings,
    UserDetails,
    Customer,
}

// Add client-side functions for tickets
export async function addTicket(
    alias: string,
    ticketData: Omit<Ticket, "id">,
): Promise<{ success: boolean; message: string; ticket?: Ticket }> {
    try {
        const requestBody = {
            alias,
            sheet: "tickets",
            action: "add",
            key: "74792ffbf37a3ddcb4dff279c7ef7ffc",
            data: ticketData,
        }

        console.log("Adding ticket with data:", JSON.stringify(requestBody, null, 2))

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
        console.log("API response:", result)

        if (!response.ok) {
            throw new Error(result.message || "Failed to add ticket")
        }

        return {
            success: true,
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

export async function updateTicket(
    alias: string,
    ticketData: Partial<Ticket> & { id: number },
): Promise<{ success: boolean; message: string; ticket?: Ticket }> {
    try {
        // Ensure updated_at is set to current time
        const dataToUpdate = {
            ...ticketData,
            updated_at: ticketData.updated_at || new Date().toISOString(),
        }

        const requestBody = {
            alias,
            sheet: "tickets",
            action: "update",
            key: "74792ffbf37a3ddcb4dff279c7ef7ffc",
            data: dataToUpdate,
        }

        console.log("Updating ticket with data:", JSON.stringify(requestBody, null, 2))

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
        console.log("API response:", result)

        if (!response.ok) {
            throw new Error(result.message || "Failed to update ticket")
        }

        return {
            success: true,
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

export async function fetchCustomersForSelect(alias: string): Promise<{ id: number; label: string }[]> {
    try {
        const response = await fetch(
            `https://script.google.com/macros/s/AKfycbyb-rUF-dPBjWyYZobtChUaRC4ppv0IU_UKTeNTI1Af3msJIUeaxbzzKDVGFt0mfZv-/exec?alias=${alias}&sheet=customers&limit=100&key=74792ffbf37a3ddcb4dff279c7ef7ffc`,
        )

        if (!response.ok) {
            throw new Error("Failed to fetch customers")
        }

        const data = (await response.json()) as ApiResponse<PaginatedResponse<Customer>>

        return data.customers.data.map((customer) => ({
            id: customer.id,
            label: `${customer.title} ${customer.name} (${customer.email})`,
        }))
    } catch (error) {
        console.error("Error fetching customers for select:", error)
        return []
    }
}

export async function fetchUsersForSelect(alias: string): Promise<{ id: number; label: string }[]> {
    try {
        const response = await fetch(
            `https://script.google.com/macros/s/AKfycbyb-rUF-dPBjWyYZobtChUaRC4ppv0IU_UKTeNTI1Af3msJIUeaxbzzKDVGFt0mfZv-/exec?alias=${alias}&sheet=users&limit=100&key=74792ffbf37a3ddcb4dff279c7ef7ffc`,
        )

        if (!response.ok) {
            throw new Error("Failed to fetch users")
        }

        const data = (await response.json()) as ApiResponse<PaginatedResponse<UserDetails>>

        return data.users.data.map((user) => ({
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

    const response = await fetch(url)

    if (!response.ok) {
        throw new Error("Failed to fetch settlements")
    }

    const data = (await response.json()) as ApiResponse<PaginatedResponse<Settlement>>
    return data.settlements
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

    const response = await fetch(url)

    if (!response.ok) {
        throw new Error("Failed to fetch customers")
    }

    const data = (await response.json()) as ApiResponse<PaginatedResponse<Customer>>
    return data.customers
}

export async function addCustomer(
    alias: string,
    customerData: Omit<Customer, "id">,
): Promise<{ success: boolean; message: string; customer?: Customer }> {
    try {
        // Format the request according to the API requirements
        const requestBody = {
            alias,
            sheet: "customers",
            action: "add",
            key: "74792ffbf37a3ddcb4dff279c7ef7ffc",
            data: customerData,
        }

        console.log("Adding customer with data:", JSON.stringify(requestBody, null, 2))

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
        console.log("API response:", result)

        if (!response.ok) {
            throw new Error(result.message || "Failed to add customer")
        }

        return {
            success: true,
            message: result.message || "Customer added successfully",
            customer: result.customer,
        }
    } catch (error) {
        console.error("Error adding customer:", error)
        return {
            success: false,
            message: error instanceof Error ? error.message : "Failed to add customer",
        }
    }
}

export async function updateCustomer(
    alias: string,
    customerData: Partial<Customer> & { id: number },
): Promise<{ success: boolean; message: string; customer?: Customer }> {
    try {
        // Format the request according to the API requirements
        const requestBody = {
            alias,
            sheet: "customers",
            action: "update",
            key: "74792ffbf37a3ddcb4dff279c7ef7ffc",
            data: customerData,
        }

        console.log("Updating customer with data:", JSON.stringify(requestBody, null, 2))

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
        console.log("API response:", result)

        if (!response.ok) {
            throw new Error(result.message || "Failed to update customer")
        }

        return {
            success: true,
            message: result.message || "Customer updated successfully",
            customer: result.customer,
        }
    } catch (error) {
        console.error("Error updating customer:", error)
        return {
            success: false,
            message: error instanceof Error ? error.message : "Failed to update customer",
        }
    }
}

export async function fetchUserById(alias: string, userId: number): Promise<UserDetails | null> {
    try {
        const response = await fetch(
            `https://script.google.com/macros/s/AKfycbyb-rUF-dPBjWyYZobtChUaRC4ppv0IU_UKTeNTI1Af3msJIUeaxbzzKDVGFt0mfZv-/exec?alias=${alias}&sheet=users&id=${userId}&key=74792ffbf37a3ddcb4dff279c7ef7ffc`,
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

export function parseTicketNotes(notesJson: string): TicketNote[] {
    try {
        const parsed = JSON.parse(notesJson)
        // Ensure we always return an array
        return Array.isArray(parsed) ? parsed : []
    } catch (error) {
        console.error("Failed to parse ticket notes:", error)
        return []
    }
}

export function parseTicketActivity(activityJson: string): TicketActivity[] {
    try {
        const parsed = JSON.parse(activityJson)
        // Ensure we always return an array
        return Array.isArray(parsed) ? parsed : []
    } catch (error) {
        console.error("Failed to parse ticket activity:", error)
        return []
    }
}

export function parseSettlementData(dataJson: string): SettlementData[] {
    try {
        const parsed = JSON.parse(dataJson)
        // Ensure we always return an array
        return Array.isArray(parsed) ? parsed : []
    } catch (error) {
        console.error("Failed to parse settlement data:", error)
        return []
    }
}

export function parseSettlementActivity(activityJson: string): SettlementActivity[] {
    try {
        const parsed = JSON.parse(activityJson)
        // Ensure we always return an array
        return Array.isArray(parsed) ? parsed : []
    } catch (error) {
        console.error("Failed to parse settlement activity:", error)
        return []
    }
}

// Helper function to create a new activity entry
export function createActivityEntry(action: string, user: string, details: string): TicketActivity {
    return {
        timestamp: new Date().toISOString(),
        action,
        user,
        details,
    }
}

// Helper function to create a new note entry
export function createNoteEntry(user: string, content: string): TicketNote {
    return {
        id: Date.now(), // Use timestamp as a simple ID
        user,
        content,
        created_at: new Date().toISOString(),
    }
}

// Add these functions for settlements API calls

export async function addSettlement(
    alias: string,
    settlementData: {
        ticket_id: number
        user_id: number
        data: SettlementData[]
        activity: SettlementActivity[]
    },
): Promise<{ success: boolean; message: string; settlement?: Settlement }> {
    try {
        // Format the data according to the API requirements
        const requestBody = {
            alias,
            sheet: "settlements",
            action: "add",
            key: "74792ffbf37a3ddcb4dff279c7ef7ffc",
            data: {
                ticket_id: settlementData.ticket_id,
                user_id: settlementData.user_id,
                data: JSON.stringify(settlementData.data),
                activity: JSON.stringify(settlementData.activity),
            },
        }

        console.log("Adding settlement with data:", JSON.stringify(requestBody, null, 2))

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
        console.log("API response:", result)

        if (!response.ok) {
            throw new Error(result.message || "Failed to add settlement")
        }

        return {
            success: true,
            message: result.message || "Settlement added successfully",
            settlement: result.settlement,
        }
    } catch (error) {
        console.error("Error adding settlement:", error)
        return {
            success: false,
            message: error instanceof Error ? error.message : "Failed to add settlement",
        }
    }
}

export async function updateSettlement(
    alias: string,
    settlementData: {
        id: number
        ticket_id?: number
        user_id?: number
        data?: SettlementData[]
        activity?: SettlementActivity[]
    },
): Promise<{ success: boolean; message: string; settlement?: Settlement }> {
    try {
        // Prepare the data for the API
        const dataToSend: Settlement = {
            id: settlementData.id,
        }

        if (settlementData.ticket_id !== undefined) {
            dataToSend.ticket_id = settlementData.ticket_id
        }

        if (settlementData.user_id !== undefined) {
            dataToSend.user_id = settlementData.user_id
        }

        if (settlementData.data !== undefined) {
            dataToSend.data = JSON.stringify(settlementData.data)
        }

        if (settlementData.activity !== undefined) {
            dataToSend.activity = JSON.stringify(settlementData.activity)
        }

        // Format the request according to the API requirements
        const requestBody = {
            alias,
            sheet: "settlements",
            action: "update",
            key: "74792ffbf37a3ddcb4dff279c7ef7ffc",
            data: dataToSend,
        }

        console.log("Updating settlement with data:", JSON.stringify(requestBody, null, 2))

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
        console.log("API response:", result)

        if (!response.ok) {
            throw new Error(result.message || "Failed to update settlement")
        }

        return {
            success: true,
            message: result.message || "Settlement updated successfully",
            settlement: result.settlement,
        }
    } catch (error) {
        console.error("Error updating settlement:", error)
        return {
            success: false,
            message: error instanceof Error ? error.message : "Failed to update settlement",
        }
    }
}  