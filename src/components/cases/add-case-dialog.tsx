"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CaseService } from "@/services/case-service"
import { ClientService } from "@/services/client-service"
import { SubscriptionService } from "@/services/subscription-service"
import { Client } from "@/types/client"
import { Profile } from "@/types/profile"
import Link from "next/link"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const formSchema = z.object({
    title: z.string().min(2, "Title must be at least 2 characters"),
    description: z.string().optional(),
    status: z.enum(['open', 'closed', 'pending']),
    clientId: z.string().min(1, "Please select a client"),
    dueDate: z.string().optional(),
})

interface AddCaseDialogProps {
    onCaseAdded: () => void
}

export function AddCaseDialog({ onCaseAdded }: AddCaseDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [clients, setClients] = useState<Client[]>([])
    const [profile, setProfile] = useState<Profile | null>(null)
    const [caseCount, setCaseCount] = useState(0)
    const [isAtLimit, setIsAtLimit] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            status: "open",
            clientId: "",
            dueDate: "",
        },
    })

    useEffect(() => {
        async function fetchData() {
            setLoading(true)
            const [clientsRes, profileRes, countRes] = await Promise.all([
                ClientService.getAll(),
                SubscriptionService.getCurrentProfile(),
                CaseService.getCount()
            ])

            setClients(clientsRes.data || [])
            setProfile(profileRes.data)

            const count = countRes.count || 0
            setCaseCount(count)

            if (profileRes.data) {
                const limits = SubscriptionService.getPlanLimits(profileRes.data.plan)
                setIsAtLimit(count >= limits.cases)
            }
            setLoading(false)
        }
        if (open) {
            fetchData()
        }
    }, [open])

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)
        try {
            const { error } = await CaseService.create({
                title: values.title,
                description: values.description || null,
                status: "open",
                client_id: values.clientId,
                due_date: values.dueDate || null,
            })

            if (error) {
                throw error
            }

            toast.success("Case added successfully")
            setOpen(false)
            form.reset()
            onCaseAdded()
        } catch (error: any) {
            toast.error(error.message || "Failed to add case")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Case
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Case</DialogTitle>
                    <DialogDescription>
                        {isAtLimit ? (
                            "You have reached the maximum number of cases for your plan."
                        ) : (
                            "Enter the details of the new case here. Click save when you're done."
                        )}
                    </DialogDescription>
                </DialogHeader>

                {isAtLimit && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Limit Reached</AlertTitle>
                        <AlertDescription className="flex flex-col gap-2">
                            <span>Your current {profile?.plan} plan is limited to {SubscriptionService.getPlanLimits(profile?.plan || 'free').cases} cases.</span>
                            <Link href="/pricing" onClick={() => setOpen(false)} className="underline font-bold">
                                Upgrade to Pro for more cases
                            </Link>
                        </AlertDescription>
                    </Alert>
                )}

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Smith v. Jones" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Case details..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="open">Open</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="closed">Closed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="clientId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Client (Optional)</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select client" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {clients.map((client) => (
                                                <SelectItem key={client.id} value={client.id}>
                                                    {client.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="dueDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Due Date</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={loading || isAtLimit}>
                            {loading ? "Saving..." : isAtLimit ? "Plan Limit Reached" : "Save Case"}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
