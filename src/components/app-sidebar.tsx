"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Settings, Ticket, Home, Users, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useTranslations } from 'next-intl'

type NavItem = {
    title: string
    href: string
    icon: React.ElementType
}

export function AppSidebar() {
    const pathname = usePathname()

    const t = useTranslations('Sidebar');

    const navItems: NavItem[] = [
        {
            title: t('dashboard'),
            href: "/dashboard",
            icon: Home,
        },
        {
            title: t('tickets'),
            href: "/tickets",
            icon: Ticket,
        },
        {
            title: t('customers'),
            href: "/customers",
            icon: Users,
        },
        {
            title: t('settings'),
            href: "/settings",
            icon: Settings,
        },
    ]

    return (
        <>
            {/* Mobile Sidebar */}
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="md:hidden">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                    <div className="flex flex-col h-full">
                        <div className="p-4 font-semibold text-lg border-b">TrackDesk</div>
                        <nav className="flex-1 p-2">
                            <ul className="space-y-1">
                                {navItems.map((item) => (
                                    <li key={item.href}>
                                        <Link href={item.href}>
                                            <Button variant={pathname === item.href ? "secondary" : "ghost"} className="w-full justify-start">
                                                <item.icon className="mr-2 h-4 w-4" />
                                                {item.title}
                                            </Button>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Desktop Sidebar - Made sticky */}
            <div className="hidden md:flex h-screen w-64 flex-col border-r bg-background sticky top-0 left-0">
                <div className="p-4 font-semibold text-lg border-b">TrackDesk</div>
                <nav className="flex-1 p-2 overflow-y-auto">
                    <ul className="space-y-1">
                        {navItems.map((item) => (
                            <li key={item.href}>
                                <Link href={item.href}>
                                    <Button
                                        variant={
                                            pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
                                                ? "secondary"
                                                : "ghost"
                                        }
                                        className="w-full justify-start"
                                    >
                                        <item.icon className="mr-2 h-4 w-4" />
                                        {item.title}
                                    </Button>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </>
    )
}
