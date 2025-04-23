import type React from "react"
import Image from "next/image"
import Link from "next/link"
import { AppSidebar } from "@/components/app-sidebar"
import { getUser } from "@/lib/server-api"
import { LogoutButton } from "@/components/logout-button"
import { Toaster } from "@/components/ui/toaster"
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // Get user data from cookie
    const user = await getUser()

    return (
        <div className="min-h-screen flex">
            <AppSidebar />
            <div className="flex-1 flex flex-col">
                <header className="border-b bg-background z-10">
                    <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                        <Link href="/dashboard" className="flex items-center gap-2 md:hidden">
                            <Image src="/trackdesk.webp" alt="TrackDesk Logo" width={32} height={32} />
                            <span className="font-bold text-xl">TrackDesk</span>
                        </Link>
                        <div className="flex-1 md:flex-none"></div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">
                                {user?.name} ({user?.alias})
                            </span>
                            <LanguageSwitcher />
                            <LogoutButton />
                        </div>
                    </div>
                </header>
                <main className="flex-1 container mx-auto px-4 py-6 overflow-auto">
                    {children}
                    <Toaster />
                </main>
            </div>
        </div>
    )
}