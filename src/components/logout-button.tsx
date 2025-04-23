"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { clearUserCache } from "@/lib/client-auth"
import { useTranslations } from 'next-intl'

export function LogoutButton() {
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const router = useRouter()
    const t = useTranslations('Signout');

    async function handleLogout() {
        setIsLoggingOut(true)
        try {
            const response = await fetch("/api/auth/logout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            })

            if (response.ok) {
                // Clear the cached user data
                clearUserCache()
                router.push("/login")
                router.refresh()
            } else {
                console.error("Logout failed")
            }
        } catch (error) {
            console.error("Logout error:", error)
        } finally {
            setIsLoggingOut(false)
        }
    }

    return (
        <Button variant="outline" size="sm" onClick={handleLogout} disabled={isLoggingOut}>
            {isLoggingOut ? (
                t('loading')
            ) : (
                <>
                    <LogOut className="h-4 w-4 mr-2" />
                    {t('title')}
                </>
            )}
        </Button>
    )
}