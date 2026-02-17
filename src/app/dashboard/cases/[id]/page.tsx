"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { CaseWithClient } from "@/types/case"
import { Document } from "@/types/document"
import { CaseService } from "@/services/case-service"
import { DocumentService } from "@/services/document-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Edit, Trash2, User, FileText } from "lucide-react"
import Link from "next/link"
import { DocumentUpload } from "@/components/documents/document-upload"
import { DocumentList } from "@/components/documents/document-list"

export default function CaseDetailPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string
    const [caseData, setCaseData] = useState<CaseWithClient | null>(null)
    const [documents, setDocuments] = useState<Document[]>([])
    const [loading, setLoading] = useState(true)

    const fetchDocuments = async () => {
        try {
            const { data, error } = await DocumentService.getByCaseId(id)
            if (error) throw error
            setDocuments(data || [])
        } catch (error: any) {
            console.error("Error fetching documents:", error)
        }
    }

    useEffect(() => {
        async function fetchCase() {
            try {
                const { data, error } = await CaseService.getById(id)
                if (error) throw error
                setCaseData(data)
                await fetchDocuments()
            } catch (error: any) {
                toast.error("Failed to load case details")
                router.push("/dashboard/cases")
            } finally {
                setLoading(false)
            }
        }
        if (id) {
            fetchCase()
        }
    }, [id, router])

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this case?")) return
        try {
            const { error } = await CaseService.delete(id)
            if (error) throw error
            toast.success("Case deleted")
            router.push("/dashboard/cases")
        } catch (error) {
            toast.error("Failed to delete case")
        }
    }

    const getStatusBadge = (status: string) => {
        const variants: Record<string, "default" | "secondary" | "destructive"> = {
            open: "default",
            pending: "secondary",
            closed: "destructive",
        }
        return (
            <Badge variant={variants[status] || "default"}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        )
    }

    if (loading) return <div className="p-8">Loading...</div>
    if (!caseData) return <div className="p-8">Case not found</div>

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/cases">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <h2 className="text-3xl font-bold tracking-tight">{caseData.title}</h2>
                    <div className="mt-2">{getStatusBadge(caseData.status)}</div>
                </div>
                <div className="flex gap-2">
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
                        <CardTitle>Case Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Description</p>
                            <p className="mt-1">{caseData.description || "No description provided"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Created</p>
                            <p className="mt-1">{new Date(caseData.created_at).toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Last Updated</p>
                            <p className="mt-1">{new Date(caseData.updated_at).toLocaleString()}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Client Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {caseData.clients ? (
                            <div className="space-y-2">
                                <div>
                                    <p className="text-sm text-muted-foreground">Name</p>
                                    <p className="mt-1 font-medium">{caseData.clients.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="mt-1">{caseData.clients.email || "N/A"}</p>
                                </div>
                                <Button variant="outline" size="sm" asChild className="mt-4">
                                    <Link href={`/dashboard/clients/${caseData.clients.id}`}>View Client Profile</Link>
                                </Button>
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-sm">No client assigned to this case.</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Documents
                    </CardTitle>
                    <CardDescription>Upload and manage case documents.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="list" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="list">Documents ({documents.length})</TabsTrigger>
                            <TabsTrigger value="upload">Upload</TabsTrigger>
                        </TabsList>
                        <TabsContent value="list" className="mt-4">
                            <DocumentList documents={documents} onDocumentDeleted={fetchDocuments} />
                        </TabsContent>
                        <TabsContent value="upload" className="mt-4">
                            <DocumentUpload caseId={id} onUploadComplete={fetchDocuments} />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    )
}
