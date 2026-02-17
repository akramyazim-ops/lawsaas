"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { Client } from "@/types/client"
import { ClientService } from "@/services/client-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Edit, Mail, MapPin, Phone, Trash2 } from "lucide-react"
import Link from "next/link"

export default function ClientDetailPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string
    const [client, setClient] = useState<Client | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchClient() {
            try {
                const { data, error } = await ClientService.getById(id)
                if (error) throw error
                setClient(data)
            } catch (error: any) {
                toast.error("Failed to load client details")
                router.push("/clients")
            } finally {
                setLoading(false)
            }
        }
        if (id) {
            fetchClient()
        }
    }, [id, router])

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this client?")) return
        try {
            const { error } = await ClientService.delete(id)
            if (error) throw error
            toast.success("Client deleted")
            router.push("/clients")
        } catch (error) {
            toast.error("Failed to delete client")
        }
    }

    if (loading) return <div className="p-8">Loading...</div>
    if (!client) return <div className="p-8">Client not found</div>

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/clients">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <h2 className="text-3xl font-bold tracking-tight">{client.name}</h2>
                <div className="ml-auto flex gap-2">
                    {/* Placeholder for Edit Dialog */}
                    <Button variant="outline" size="sm">
                        <Edit className="mr-2 h-4 w-4" /> Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={handleDelete}>
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{client.email || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{client.phone || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{client.address || "N/A"}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Active Cases</CardTitle>
                        <CardDescription>Cases associated with this client.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground text-sm">No active cases found.</p>
                        {/* TODO: List cases here */}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
