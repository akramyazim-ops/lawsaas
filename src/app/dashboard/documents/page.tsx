"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Document } from "@/types/document"
import { DocumentService } from "@/services/document-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DocumentList } from "@/components/documents/document-list"
import { FileText, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

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
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="p-8 space-y-10 selection:bg-primary/30 min-h-screen">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col gap-2"
            >
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">Digital Archive</span>
                <h2 className="text-4xl font-black tracking-tighter text-foreground uppercase italic leading-none">Evidence Repository</h2>
                <p className="text-muted-foreground font-medium text-lg max-w-2xl">
                    View and manage the firm&apos;s digital asset library across all active matter engagements.
                </p>
            </motion.div>

            <Card className="architectural-border bg-muted/5 border-muted/20 shadow-none rounded-none overflow-hidden">
                <CardHeader className="border-b border-muted/20 bg-muted/10 pb-8 px-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <FileText className="h-6 w-6 text-primary gold-glow" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-black text-foreground tracking-tighter uppercase italic">Institutional Document Registry</CardTitle>
                            <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                                A consolidated ledger of all evidence and legal documentation.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="p-8">
                        <DocumentList documents={documents} onDocumentDeleted={fetchDocuments} />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
