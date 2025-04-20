"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const router = useRouter()
    const searchParams = useSearchParams()
    const alias = searchParams.get("alias") || ""

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (!alias) {
            setError("Alias parameter is missing from the URL")
            return
        }

        setLoading(true)
        setError("")

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password, alias }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || "Authentication failed")
            }

            // Redirect to dashboard on successful login
            router.push("/dashboard")
        } catch (err) {
            setError(err instanceof Error ? err.message : "Login failed. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 flex flex-col items-center">
                    <div className="w-16 h-16 mb-4 relative">
                        <Image src="/trackdesk.jpg" alt="TrackDesk Logo" fill className="object-contain" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-center">TrackDesk</CardTitle>
                    <CardDescription className="text-center">Enter your credentials to access your account</CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {!alias && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Alias parameter is missing. Please include it in the URL (e.g., ?alias=yourcompany)
                            </AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Signing in..." : "Sign in"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-muted-foreground">
                        Company alias: <span className="font-medium">{alias || "Not provided"}</span>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}