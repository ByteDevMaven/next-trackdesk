"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import Link from "next/link"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import {
    type User,
    parseTicketNotes,
    parseTicketActivity,
    updateTicket,
    createNoteEntry,
    createActivityEntry,
    type Ticket,
} from "@/lib/api"
import { ExternalLink, PlusCircle, Edit } from "lucide-react"

interface TicketDetailsProps {
    ticket: Ticket | null
    isOpen: boolean
    onClose: () => void
    onEdit: () => void
    user: User
    onTicketUpdated?: (ticket: Ticket) => void
}

export function TicketDetails({ ticket, isOpen, onClose, onEdit, user, onTicketUpdated }: TicketDetailsProps) {
    const [newNote, setNewNote] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [localTicket, setLocalTicket] = useState<Ticket | null>(null)
    const { toast } = useToast()

    // Update local ticket when the prop changes
    useEffect(() => {
        if (ticket) {
            setLocalTicket(ticket)
        }
    }, [ticket])

    // Reset note input when ticket changes
    useEffect(() => {
        setNewNote("")
    }, [ticket])

    if (!localTicket) return null

    // Parse ticket data
    const notes = parseTicketNotes(localTicket.notes)
    const activities = parseTicketActivity(localTicket.activity)

    function getPriorityBadgeVariant(priority: string) {
        switch (priority) {
            case "high":
                return "destructive"
            case "med":
                return "warning"
            case "low":
                return "secondary"
            default:
                return "secondary"
        }
    }

    function getStatusBadgeVariant(status: string) {
        switch (status) {
            case "open":
                return "default"
            case "pending":
                return "warning"
            case "closed":
                return "secondary"
            default:
                return "secondary"
        }
    }

    async function handleAddNote() {
        if (!newNote.trim()) return

        setIsSubmitting(true)
        try {
            // Create a new note entry
            const newNoteEntry = createNoteEntry(user.name, newNote.trim())

            // Create a new activity entry for the note
            const newActivityEntry = createActivityEntry(
                "note_added",
                user.name,
                `Added a note: "${newNote.trim().substring(0, 30)}${newNote.trim().length > 30 ? "..." : ""}"`,
            )

            // Create updated arrays with the new entries
            const updatedNotes = [...notes, newNoteEntry]
            const updatedActivities = [...activities, newActivityEntry]

            // Create updated ticket object
            const updatedTicket = {
                ...localTicket,
                notes: JSON.stringify(updatedNotes),
                activity: JSON.stringify(updatedActivities),
                updated_at: new Date().toISOString(),
            }

            // Update the API
            const result = await updateTicket(user.alias, updatedTicket)

            if (result.success) {
                toast({
                    title: "Note added",
                    description: "Your note has been added to the ticket",
                })

                // Clear the note input
                setNewNote("")

                // Update the local state directly with the updated ticket
                setLocalTicket(updatedTicket)

                // If onTicketUpdated callback exists, call it with the updated ticket
                if (onTicketUpdated) {
                    onTicketUpdated(updatedTicket)
                }
            } else {
                throw new Error(result.message)
            }
        } catch (error) {
            console.error("Error adding note:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to add note",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="sm:max-w-md md:max-w-lg lg:max-w-xl h-full flex flex-col">
                <SheetHeader className="space-y-1">
                    <SheetTitle className="text-xl flex items-center gap-2">
                        #{localTicket.id} {localTicket.title}
                    </SheetTitle>
                    {/* Fix: Replace <SheetDescription> (which renders as <p>) with a <div> */}
                    <div className="text-sm text-muted-foreground flex flex-wrap gap-2">
                        <Badge variant={getStatusBadgeVariant(localTicket.status)}>{localTicket.status}</Badge>
                        <Badge variant={getPriorityBadgeVariant(localTicket.priority)}>{localTicket.priority}</Badge>
                        {localTicket.tags.split(",").map((tag) => (
                            <Badge key={tag} variant="outline">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                </SheetHeader>

                <div className="mt-6 flex-1 overflow-y-auto pr-1">
                    <Tabs defaultValue="details">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="details">Details</TabsTrigger>
                            <TabsTrigger value="notes">Notes</TabsTrigger>
                            <TabsTrigger value="activity">Activity</TabsTrigger>
                            <TabsTrigger value="settlements">Settlements</TabsTrigger>
                        </TabsList>

                        <TabsContent value="details" className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <h3 className="text-sm font-medium">Ticket Information</h3>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="text-muted-foreground">Created</div>
                                    <div>{format(new Date(localTicket.created_at), "PPP p")}</div>

                                    <div className="text-muted-foreground">Updated</div>
                                    <div>{format(new Date(localTicket.updated_at), "PPP p")}</div>

                                    <div className="text-muted-foreground">Assignee</div>
                                    <div>{localTicket.user ? localTicket.user.name : `User #${localTicket.user_id}`}</div>

                                    <div className="text-muted-foreground">Customer</div>
                                    <div>
                                        {localTicket.customer
                                            ? `${localTicket.customer.title} ${localTicket.customer.name}`
                                            : `Customer #${localTicket.customer_id}`}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="notes" className="space-y-4 mt-4">
                            <div className="space-y-4">
                                {notes.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No notes yet.</p>
                                ) : (
                                    notes.map((note) => (
                                        <div key={note.id} className="border rounded-md p-3 space-y-1">
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium">{note.user}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {format(new Date(note.created_at), "PPP p")}
                                                </span>
                                            </div>
                                            <p className="text-sm">{note.content}</p>
                                        </div>
                                    ))
                                )}
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <h3 className="text-sm font-medium">Add Note</h3>
                                <Textarea
                                    placeholder="Type your note here..."
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                />
                                <Button onClick={handleAddNote} disabled={!newNote.trim() || isSubmitting}>
                                    {isSubmitting ? "Adding..." : "Add Note"}
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="activity" className="space-y-4 mt-4">
                            <div className="space-y-4">
                                {activities.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No activity yet.</p>
                                ) : (
                                    activities.map((activity, index) => (
                                        <div key={index} className="border rounded-md p-3 space-y-1">
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium">{activity.user}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {format(new Date(activity.timestamp), "PPP p")}
                                                </span>
                                            </div>
                                            <p className="text-sm">
                                                <span className="font-medium capitalize">{activity.action.replace("_", " ")}</span>:{" "}
                                                {activity.details}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="settlements" className="space-y-4 mt-4">
                            {localTicket.settlements && localTicket.settlements.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-sm font-medium">Settlements ({localTicket.settlements.length})</h3>
                                        <Button asChild size="sm">
                                            <Link href={`/settlements?ticket_id=${localTicket.id}`}>
                                                <ExternalLink className="h-4 w-4 mr-2" />
                                                View All Settlements
                                            </Link>
                                        </Button>
                                    </div>

                                    <div className="space-y-4">
                                        {localTicket.settlements.slice(0, 5).map((settlement) => (
                                            <div key={settlement.id} className="border rounded-md p-3 space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-medium">Settlement #{settlement.id}</span>
                                                    <Button asChild size="sm" variant="outline">
                                                        <Link href={`/settlements?settlement_id=${settlement.id}`}>
                                                            <Edit className="h-4 w-4 mr-2" />
                                                            Edit
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                        {localTicket.settlements.length > 5 && (
                                            <p className="text-sm text-center text-muted-foreground">
                                                Showing 5 of {localTicket.settlements.length} settlements.{" "}
                                                <Link
                                                    href={`/settlements?ticket_id=${localTicket.id}`}
                                                    className="text-primary hover:underline"
                                                >
                                                    View all
                                                </Link>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <p className="text-sm text-muted-foreground">No settlement data available for this ticket.</p>
                                    <Button asChild>
                                        <Link href={`/settlements?ticket_id=${localTicket.id}`}>
                                            <PlusCircle className="h-4 w-4 mr-2" />
                                            Create Settlement
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>

                <SheetFooter className="mt-6">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                    <Button onClick={onEdit}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Ticket
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}