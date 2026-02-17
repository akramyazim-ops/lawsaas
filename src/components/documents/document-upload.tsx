"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { toast } from "sonner"
import { Upload, File, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DocumentService } from "@/services/document-service"
import { cn } from "@/lib/utils"

interface DocumentUploadProps {
    caseId: string
    onUploadComplete: () => void
}

export function DocumentUpload({ caseId, onUploadComplete }: DocumentUploadProps) {
    const [uploading, setUploading] = useState(false)
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setSelectedFiles(prev => [...prev, ...acceptedFiles])
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: true,
    })

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    }

    const handleUpload = async () => {
        if (selectedFiles.length === 0) {
            toast.error("Please select at least one file")
            return
        }

        setUploading(true)
        try {
            for (const file of selectedFiles) {
                // Upload file to storage
                const { data, error: uploadError, fileName } = await DocumentService.uploadFile(file, caseId)

                if (uploadError) {
                    throw uploadError
                }

                // Create document record
                const { error: dbError } = await DocumentService.create({
                    name: file.name,
                    file_path: fileName,
                    file_type: file.type,
                    size_bytes: file.size,
                    case_id: caseId,
                    uploaded_by: null, // TODO: Get current user ID
                })

                if (dbError) {
                    throw dbError
                }
            }

            toast.success(`${selectedFiles.length} file(s) uploaded successfully`)
            setSelectedFiles([])
            onUploadComplete()
        } catch (error: any) {
            toast.error(error.message || "Failed to upload files")
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="space-y-4">
            <Card>
                <CardContent className="pt-6">
                    <div
                        {...getRootProps()}
                        className={cn(
                            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                            isDragActive
                                ? "border-primary bg-primary/5"
                                : "border-muted-foreground/25 hover:border-primary/50"
                        )}
                    >
                        <input {...getInputProps()} />
                        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        {isDragActive ? (
                            <p className="text-sm text-muted-foreground">Drop the files here...</p>
                        ) : (
                            <div>
                                <p className="text-sm font-medium">
                                    Drag & drop files here, or click to select
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Upload documents, images, PDFs, etc.
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {selectedFiles.length > 0 && (
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-2">
                            <p className="text-sm font-medium mb-3">
                                Selected Files ({selectedFiles.length})
                            </p>
                            {selectedFiles.map((file, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-2 bg-muted rounded-lg"
                                >
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                        <span className="text-sm truncate">{file.name}</span>
                                        <span className="text-xs text-muted-foreground flex-shrink-0">
                                            ({(file.size / 1024).toFixed(1)} KB)
                                        </span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeFile(index)}
                                        disabled={uploading}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <Button
                            onClick={handleUpload}
                            disabled={uploading}
                            className="w-full mt-4"
                        >
                            {uploading ? "Uploading..." : `Upload ${selectedFiles.length} file(s)`}
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
