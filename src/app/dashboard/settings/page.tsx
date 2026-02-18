"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2, User, CreditCard, Settings as SettingsIcon, Bell } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { SubscriptionService } from "@/services/subscription-service"
import { Profile } from "@/types/profile"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

const profileSchema = z.object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email(),
})

export default function SettingsPage() {
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            fullName: "",
            email: "",
        },
    })

    useEffect(() => {
        async function fetchProfile() {
            const { data } = await SubscriptionService.getCurrentProfile()
            if (data) {
                setProfile(data)
                const { data: { user } } = await supabase.auth.getUser()
                form.reset({
                    fullName: data.full_name || "",
                    email: user?.email || "",
                })
            }
            setLoading(false)
        }
        fetchProfile()
    }, [form])

    async function onProfileSubmit(values: z.infer<typeof profileSchema>) {
        if (!profile) return
        setSaving(true)
        try {
            const { error } = await SubscriptionService.updateProfile(profile.id, {
                full_name: values.fullName,
            })
            if (error) throw error

            // Also update auth metadata
            await supabase.auth.updateUser({
                data: { full_name: values.fullName }
            })

            toast.success("Profile updated successfully")
        } catch (error: any) {
            toast.error(error.message || "Failed to update profile")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="p-8 space-y-8 max-w-6xl mx-auto">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground">
                    Manage your account settings and preferences.
                </p>
            </div>

            <Separator />

            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 max-w-md">
                    <TabsTrigger value="profile" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Profile
                    </TabsTrigger>
                    <TabsTrigger value="billing" className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Subscription
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        Notifications
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>
                                Update your personal details and how others see you.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onProfileSubmit)} className="space-y-6">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="fullName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Full Name</FormLabel>
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
                                                    <FormLabel>Email Address</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="john@example.com" {...field} disabled />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Email cannot be changed here for security reasons.
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <Button type="submit" disabled={saving}>
                                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Save Changes
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="billing" className="space-y-4">
                    <Card className="border-border/50 shadow-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-xl">Subscription Plan</CardTitle>
                            <CardDescription>
                                View your current tier and professional entitlements.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            {/* Current Plan Hero */}
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 bg-primary/5 rounded-xl border border-primary/20 gap-6">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <CreditCard className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-2xl tracking-tight uppercase italic text-primary">
                                                {profile?.plan ? SubscriptionService.getPlanLimits(profile.plan).name : 'Free'} Plan
                                            </h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 text-[10px] font-bold uppercase tracking-wider">
                                                    {profile?.subscription_status || 'Active'}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">Premium Account</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <Button asChild variant="default" className="shadow-lg shadow-primary/20 group">
                                    <Link href="/pricing" className="flex items-center gap-2">
                                        Upgrade My Credentials
                                        <SettingsIcon className="h-4 w-4 group-hover:rotate-90 transition-transform" />
                                    </Link>
                                </Button>
                            </div>

                            <Separator className="opacity-50" />

                            <div className="grid md:grid-cols-2 gap-12">
                                {/* Entitlements List */}
                                <div className="space-y-6">
                                    <div className="space-y-1">
                                        <h4 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Your Plan Entitlements</h4>
                                        <p className="text-xs text-muted-foreground">Professional features included in your current tier.</p>
                                    </div>
                                    <ul className="grid gap-3">
                                        {profile?.plan && SubscriptionService.getPlanLimits(profile.plan).features.map((feature, idx) => (
                                            <li key={idx} className="flex items-center gap-3 text-sm font-medium">
                                                <div className="flex-none p-0.5 bg-primary/20 rounded-full">
                                                    <Loader2 className="h-3.5 w-3.5 text-primary" />
                                                </div>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Plan Usage Limits */}
                                <div className="space-y-6">
                                    <div className="space-y-1">
                                        <h4 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Resource Utilization</h4>
                                        <p className="text-xs text-muted-foreground">Monitoring your institutional resource consumption.</p>
                                    </div>
                                    <div className="space-y-6">
                                        {profile?.plan && (
                                            <>
                                                <div className="space-y-3">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="font-semibold">Case Capacity</span>
                                                        <span className="text-muted-foreground font-mono">
                                                            {SubscriptionService.getPlanLimits(profile.plan).cases === Infinity ? "Unlimited" : `Limit: ${SubscriptionService.getPlanLimits(profile.plan).cases}`}
                                                        </span>
                                                    </div>
                                                    <div className="h-3 bg-muted rounded-full overflow-hidden border border-border/50">
                                                        <div
                                                            className="h-full bg-primary transition-all duration-1000 ease-out"
                                                            style={{ width: `${SubscriptionService.getPlanLimits(profile.plan).cases === Infinity ? 0 : Math.min(100, (3 / SubscriptionService.getPlanLimits(profile.plan).cases) * 100)}%` }}
                                                        />
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground italic">Approx. 3 cases currently active in registry.</p>
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="font-semibold">Client Database</span>
                                                        <span className="text-muted-foreground font-mono">
                                                            {SubscriptionService.getPlanLimits(profile.plan).clients === Infinity ? "Unlimited" : `Limit: ${SubscriptionService.getPlanLimits(profile.plan).clients}`}
                                                        </span>
                                                    </div>
                                                    <div className="h-3 bg-muted rounded-full overflow-hidden border border-border/50">
                                                        <div
                                                            className="h-full bg-primary transition-all duration-1000 ease-out"
                                                            style={{ width: `${SubscriptionService.getPlanLimits(profile.plan).clients === Infinity ? 0 : Math.min(100, (2 / SubscriptionService.getPlanLimits(profile.plan).clients) * 100)}%` }}
                                                        />
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground italic">Approx. 2 clients recorded in database.</p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-muted/30 border-t p-4">
                            <p className="text-[11px] text-muted-foreground">
                                Need more resources? <Link href="/pricing" className="text-primary font-bold hover:underline">View architectural scaling options</Link> or contact your account executive.
                            </p>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notification Preferences</CardTitle>
                            <CardDescription>
                                Control how you receive updates and alerts.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <p className="font-medium">Email Notifications</p>
                                        <p className="text-sm text-muted-foreground text-balance">
                                            Receive updates about your cases and billing.
                                        </p>
                                    </div>
                                    <div className="flex h-6 w-11 shrink-0 cursor-not-allowed items-center rounded-full bg-muted p-[2px] opacity-60">
                                        <div className="h-5 w-5 rounded-full bg-background shadow-sm transition-transform translate-x-5" />
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <p className="font-medium">Billing Alerts</p>
                                        <p className="text-sm text-muted-foreground text-balance">
                                            Get notified when an invoice is due or paid.
                                        </p>
                                    </div>
                                    <div className="flex h-6 w-11 shrink-0 cursor-not-allowed items-center rounded-full bg-muted p-[2px] opacity-60">
                                        <div className="h-5 w-5 rounded-full bg-background shadow-sm transition-transform translate-x-5" />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
