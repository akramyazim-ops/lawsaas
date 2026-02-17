"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { CaseWithClient } from "@/types/case"
import { CaseService } from "@/services/case-service"
import { AddCaseDialog } from "@/components/cases/add-case-dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function CasesPage() {
    const [cases, setCases] = useState<CaseWithClient[]>([])
    const [loading, setLoading] = useState(true)

    const fetchCases = async () => {
        setLoading(true)
        try {
            const { data, error } = await CaseService.getAll()
            if (error) throw error
            setCases(data || [])
        } catch (error: any) {
            console.error("Error fetching cases:", error)
            toast.error("Failed to load cases. Please ensure the database is set up.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCases()
    }, [])

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

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Cases</h2>
                    <p className="text-muted-foreground">
                        Manage your legal cases and matters.
                    </p>
                </div>
                <AddCaseDialog onCaseAdded={fetchCases} />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Cases</CardTitle>
                    <CardDescription>
                        A list of all cases currently being handled by your firm.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : cases.length === 0 ? (
                        <div className="text-center p-8 text-muted-foreground">
                            No cases found. Add one to get started.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Client</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {cases.map((caseItem) => (
                                    <TableRow key={caseItem.id}>
                                        <TableCell className="font-medium">{caseItem.title}</TableCell>
                                        <TableCell>{caseItem.clients?.name || "-"}</TableCell>
                                        <TableCell>{getStatusBadge(caseItem.status)}</TableCell>
                                        <TableCell>{new Date(caseItem.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/dashboard/cases/${caseItem.id}`}>View</Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
