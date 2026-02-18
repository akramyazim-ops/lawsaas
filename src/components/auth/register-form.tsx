"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { supabase } from "@/lib/supabase"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

const schema = z.object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    phone: z.string().optional(),
})

export function RegisterForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const plan = searchParams.get("plan") || "free"
    const sessionId = searchParams.get("session_id")
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                router.push(sessionId ? `/pricing?session_id=${sessionId}&plan=${plan}` : "/dashboard")
            }
        }
        checkUser()
    }, [router, sessionId, plan])

    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: {
            fullName: "",
            email: "",
            password: "",
            phone: "",
        },
    })

    useEffect(() => {
        const fetchSessionData = async () => {
            if (!sessionId) return
            try {
                const response = await fetch(`/api/checkout/session?session_id=${sessionId}`)
                const data = await response.json()
                if (data.email) form.setValue("email", data.email)
                if (data.name) form.setValue("fullName", data.name)
                if (data.phone) form.setValue("phone", data.phone)
            } catch (error) {
                console.error("Failed to fetch session data", error)
            }
        }
        fetchSessionData()
    }, [sessionId, form])

    async function onSubmit(data: z.infer<typeof schema>) {
        setLoading(true)
        const { error } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
                data: {
                    full_name: data.fullName,
                    plan: plan, // Use the selected plan (e.g., 'pro' for trials)
                    billing_interval: searchParams.get('interval') || 'month',
                    phone: data.phone,
                },
            },
        })
        setLoading(false)

        if (error) {
            toast.error(error.message)
            return
        }

        toast.success("Registration successful! Check your email to verify.")
        router.push(`/login?plan=${plan}`)
    }

    return (
        <Card className="w-[450px] border-border bg-card shadow-xl overflow-hidden">
            <div className="h-1.5 w-full bg-primary"></div>
            <CardHeader className="space-y-2 pb-6 pt-8 text-center">
                <CardTitle className="text-3xl font-extrabold text-card-foreground tracking-tight">
                    {sessionId ? "Complete Your Registration" : "Create Account"}
                </CardTitle>
                <CardDescription className="text-muted-foreground font-medium">
                    {sessionId ? "Finalize your account to start your 14-day trial" : "Join LegalFlow and streamline your practice today"}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem className="space-y-2">
                                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Full Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Counsel Name"
                                            {...field}
                                            className="bg-white border-border h-12 px-4 focus:ring-primary/20 transition-all rounded-xl text-card-foreground"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-[10px] font-bold" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem className="space-y-2">
                                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Work Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="name@firm.com"
                                            {...field}
                                            className="bg-white border-border h-12 px-4 focus:ring-primary/20 transition-all rounded-xl text-card-foreground"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-[10px] font-bold" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem className="space-y-2">
                                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Phone Number</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="+60..."
                                            {...field}
                                            className="bg-white border-border h-12 px-4 focus:ring-primary/20 transition-all rounded-xl text-card-foreground"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-[10px] font-bold" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem className="space-y-2">
                                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Security Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            {...field}
                                            className="bg-white border-border h-12 px-4 focus:ring-primary/20 transition-all rounded-xl text-card-foreground"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-[10px] font-bold" />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full h-12 text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all rounded-xl shadow-md active:scale-[0.98] border-none" disabled={loading}>
                            {loading ? "Initializing Workspace..." : (sessionId || ['starter', 'growth', 'pro_firm'].includes(plan) ? "Start 14-Day Free Trial" : "Create Account")}
                        </Button>
                        <div className="text-center text-xs font-medium text-muted-foreground pt-2">
                            Already part of a firm?{" "}
                            <Link href="/login" className="text-primary hover:underline underline-offset-4 font-bold">
                                Log in
                            </Link>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
