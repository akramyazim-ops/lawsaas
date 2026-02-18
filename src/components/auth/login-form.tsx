"use client"

import { useState } from "react"
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
    email: z.string().email(),
    password: z.string().min(6),
})

export function LoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const plan = searchParams.get("plan")
    const [loading, setLoading] = useState(false)

    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    async function onSubmit(data: z.infer<typeof schema>) {
        setLoading(true)
        const { error } = await supabase.auth.signInWithPassword(data)
        setLoading(false)

        if (error) {
            toast.error(error.message)
            return
        }

        toast.success("Logged in successfully")
        if (plan && plan !== 'free') {
            router.push(`/pricing?plan=${plan}`)
        } else {
            router.push("/dashboard")
        }
    }

    return (
        <Card className="w-[400px] border-border bg-card shadow-xl overflow-hidden">
            <div className="h-1.5 w-full bg-primary font-bold"></div>
            <CardHeader className="space-y-2 pb-6 pt-8 text-center">
                <CardTitle className="text-3xl font-extrabold text-card-foreground tracking-tight">Welcome Back</CardTitle>
                <CardDescription className="text-muted-foreground font-medium">
                    Enter your credentials to access your legal workspace
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem className="space-y-2">
                                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email Address</FormLabel>
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
                            name="password"
                            render={({ field }) => (
                                <FormItem className="space-y-2">
                                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Password</FormLabel>
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
                            {loading ? "Authenticating..." : "Secure Login"}
                        </Button>
                        <div className="text-center text-xs font-medium text-muted-foreground pt-2">
                            Don&apos;t have an account?{" "}
                            <Link href="/register" className="text-primary hover:underline underline-offset-4 font-bold">
                                Create an account
                            </Link>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
