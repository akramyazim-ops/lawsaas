import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Clock, Users, FileText } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-[url('/grid.svg')] bg-center">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-500">
                  Manage Your Law Firm <br /> With Confidence
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  The all-in-one platform for case management, client communication, and document automation. Built for modern legal professionals.
                </p>
              </div>
              <div className="space-x-4">
                <Button asChild size="lg" className="h-11 px-8">
                  <Link href="/register">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-11 px-8">
                  <Link href="/pricing">View Pricing</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900/50">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Everything you need</h2>
              <p className="mx-auto max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400 mt-4">
                Streamline your operations with our comprehensive suite of tools.
              </p>
            </div>
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 text-center p-6 bg-background rounded-lg shadow-sm border">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Client Management</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Keep track of all client details, communications, and history in one secure place.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center p-6 bg-background rounded-lg shadow-sm border">
                <div className="p-3 bg-violet-500/10 rounded-full">
                  <FileText className="h-8 w-8 text-violet-500" />
                </div>
                <h3 className="text-xl font-bold">Document Automation</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Generate and organize legal documents with ease. Drag-and-drop support included.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center p-6 bg-background rounded-lg shadow-sm border">
                <div className="p-3 bg-emerald-500/10 rounded-full">
                  <Clock className="h-8 w-8 text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold">Time & Billing</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Track billable hours effortlessly and generate professional invoices in seconds.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">© 2024 LegalFlow Inc. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}
