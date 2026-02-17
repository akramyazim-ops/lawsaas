"use client"

import { useState } from "react"
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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ClientService } from "@/services/client-service"
import { SubscriptionService } from "@/services/subscription-service"
import { Profile } from "@/types/profile"
import Link from "next/link"
import { AlertCircle, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useEffect } from "react"

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().optional(),
    address: z.string().optional(),
})

interface AddClientDialogProps {
    onClientAdded: () => void
}

export function AddClientDialog({ onClientAdded }: AddClientDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [clientCount, setClientCount] = useState(0)
    const [isAtLimit, setIsAtLimit] = useState(false)

    useEffect(() => {
        async function fetchData() {
            setLoading(true)
            const [profileRes, countRes] = await Promise.all([
                SubscriptionService.getCurrentProfile(),
                ClientService.getAll() // Reusing getAll to get count for now, or add a getCount to ClientService
            ])

            setProfile(profileRes.data)
            const count = countRes.data?.length || 0
            setClientCount(count)

            if (profileRes.data) {
                const limits = SubscriptionService.getPlanLimits(profileRes.data.plan)
                setIsAtLimit(count >= limits.clients)
            }
            setLoading(false)
        }
        if (open) {
            fetchData()
        }
    }, [open])

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            address: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)
        try {
            const { error } = await ClientService.create({
                name: values.name,
                email: values.email || null,
                phone: values.phone || null,
                address: values.address || null,
            })

            if (error) {
                throw error
            }

            toast.success("Client added successfully")
            setOpen(false)
            form.reset()
            onClientAdded()
        } catch (error: any) {
            toast.error(error.message || "Failed to add client")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Client
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Client</DialogTitle>
                    <DialogDescription>
                        {isAtLimit ? (
                            "You have reached the maximum number of clients for your plan."
                        ) : (
                            "Enter the details of the new client here. Click save when you're done."
                        )}
                    </DialogDescription>
                </DialogHeader>

                {isAtLimit && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Limit Reached</AlertTitle>
                        <AlertDescription className="flex flex-col gap-2">
                            <span>Your current {profile?.plan} plan is limited to {SubscriptionService.getPlanLimits(profile?.plan || 'free').clients} clients.</span>
                            <Link href="/pricing" onClick={() => setOpen(false)} className="underline font-bold">
                                Upgrade to Pro for more clients
                            </Link>
                        </AlertDescription>
                    </Alert>
                )}

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="john@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone</FormLabel>
                                    <FormControl>
                                        <Input placeholder="+1 234 567 890" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="123 Main St, City, Country" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={loading || isAtLimit}>
                            {loading ? "Saving..." : isAtLimit ? "Plan Limit Reached" : "Save Client"}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
