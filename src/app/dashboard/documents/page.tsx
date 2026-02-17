"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Document } from "@/types/document"
import { DocumentService } from "@/services/document-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DocumentList } from "@/components/documents/document-list"
import { FileText } from "lucide-react"

export default function DocumentsPage() {
    const [documents, setDocuments] = useState<Document[]>([])
    const [loading, setLoading] = useState(true)

    const fetchDocuments = async () => {
        try {
            const { data, error } = await DocumentService.getAll()
            if (error) throw error
            setDocuments(data || [])
        } catch (error: any) {
            toast.error("Failed to load documents")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDocuments()
    }, [])

    if (loading) {
        return <div className="p-8">Loading...</div>
    }

    return (
        <div className="p-8 space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Documents</h2>
                <p className="text-muted-foreground mt-2">
                    View and manage all documents across all cases.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        All Documents
                    </CardTitle>
                    <CardDescription>
                        A list of all documents uploaded across all cases.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DocumentList documents={documents} onDocumentDeleted={fetchDocuments} />
                </CardContent>
            </Card>
        </div>
    )
}
