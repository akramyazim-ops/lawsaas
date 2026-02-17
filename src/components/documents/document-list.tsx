"use client"

import { useState } from "react"
import { Document } from "@/types/document"
import { DocumentService } from "@/services/document-service"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { File, Download, Trash2, FileText, Image, FileArchive } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

interface DocumentListProps {
    documents: Document[]
    onDocumentDeleted: () => void
}

export function DocumentList({ documents, onDocumentDeleted }: DocumentListProps) {
    const [deleting, setDeleting] = useState<string | null>(null)

    const getFileIcon = (fileType: string | null) => {
        if (!fileType) return <File className="h-4 w-4" />

        if (fileType.startsWith("image/")) return <Image className="h-4 w-4" />
        if (fileType === "application/pdf") return <FileText className="h-4 w-4" />
        if (fileType.includes("zip") || fileType.includes("rar")) return <FileArchive className="h-4 w-4" />

        return <File className="h-4 w-4" />
    }

    const handleDownload = async (document: Document) => {
        try {
            const { data, error } = await DocumentService.downloadFile(document.file_path)

            if (error) throw error
            if (!data) throw new Error("No file data")

            // Create download link
            const url = URL.createObjectURL(data)
            const a = window.document.createElement('a')
            a.href = url
            a.download = document.name
            window.document.body.appendChild(a)
            a.click()
            window.document.body.removeChild(a)
            URL.revokeObjectURL(url)

            toast.success("Download started")
        } catch (error: any) {
            toast.error(error.message || "Failed to download file")
        }
    }

    const handleDelete = async (document: Document) => {
        if (!confirm(`Are you sure you want to delete "${document.name}"?`)) return

        setDeleting(document.id)
        try {
            // Delete from storage
            const { error: storageError } = await DocumentService.deleteFile(document.file_path)
            if (storageError) throw storageError

            // Delete from database
            const { error: dbError } = await DocumentService.delete(document.id)
            if (dbError) throw dbError

            toast.success("Document deleted")
            onDocumentDeleted()
        } catch (error: any) {
            toast.error(error.message || "Failed to delete document")
        } finally {
            setDeleting(null)
        }
    }

    const formatFileSize = (bytes: number | null) => {
        if (!bytes) return "Unknown"
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }

    if (documents.length === 0) {
        return (
            <div className="text-center p-8 text-muted-foreground">
                No documents uploaded yet.
            </div>
        )
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {documents.map((document) => (
                    <TableRow key={document.id}>
                        <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                                {getFileIcon(document.file_type)}
                                <span className="truncate max-w-[300px]">{document.name}</span>
                            </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                            {document.file_type?.split('/')[1]?.toUpperCase() || "Unknown"}
                        </TableCell>
                        <TableCell>{formatFileSize(document.size_bytes)}</TableCell>
                        <TableCell>{new Date(document.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDownload(document)}
                                >
                                    <Download className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(document)}
                                    disabled={deleting === document.id}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
