"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Clock, Users, FileText, Scale, Shield, Zap } from "lucide-react"
import { motion, useScroll, useTransform, useSpring } from "framer-motion"
import { useRef } from "react"

export default function Home() {
  const targetRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"]
  })

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8])
  const y = useTransform(scrollYProgress, [0, 0.5], [0, -100])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.33, 1, 0.68, 1] as const }
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary overflow-x-hidden">
      <main className="flex-1">
        {/* Hero Section */}
        <section ref={targetRef} className="relative h-screen flex items-center justify-center overflow-hidden border-b border-white/5">
          {/* Architectural Background */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]"></div>
            <motion.div
              style={{ y: useTransform(scrollYProgress, [0, 1], [0, 200]) }}
              className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background via-background/80 to-transparent z-10"
            />
            {/* Subtle Gold Glows */}
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
          </div>

          <motion.div
            style={{ opacity, scale, y }}
            className="container relative z-20 mx-auto px-4 text-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="inline-block px-4 py-1.5 mb-6 text-sm font-bold tracking-widest uppercase border border-primary/30 bg-primary/5 text-primary rounded-full"
            >
              The Gold Standard in Legal Tech
            </motion.div>
            <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-bold tracking-tighter leading-[0.9] text-white">
              LEGAL<span className="text-primary italic font-serif">FLOW</span>
            </h1>
            <p className="mx-auto mt-8 max-w-[700px] text-lg md:text-2xl text-muted-foreground font-medium leading-relaxed">
              Engineered for high-performance firms. Elevate your practice with the all-in-one platform built for legal pioneers.
            </p>
            <div className="mt-12 flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button asChild size="lg" className="h-16 px-12 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-none transition-all hover:tracking-wider">
                <Link href="/register">
                  START YOUR LEGACY <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="ghost" size="lg" className="h-16 px-12 text-lg font-bold border border-white/10 hover:bg-white/5 text-white rounded-none">
                <Link href="/pricing">VIEW PRICING</Link>
              </Button>
            </div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50"
          >
            <span className="text-[10px] uppercase tracking-widest font-bold">Scroll to Explore</span>
            <div className="w-[1px] h-12 bg-gradient-to-b from-primary to-transparent"></div>
          </motion.div>
        </section>

        {/* Marquee Section */}
        <div className="w-full py-12 bg-white/5 border-b border-white/5 overflow-hidden">
          <div className="flex whitespace-nowrap animate-marquee">
            {[1, 2, 3, 4].map((_, i) => (
              <div key={i} className="flex gap-24 px-12 items-center">
                <span className="text-2xl md:text-4xl font-black text-white/20 tracking-tighter uppercase italic">TRUSTED BY GLOBAL PARTNERS</span>
                <Scale className="h-8 w-8 text-primary/30" />
                <span className="text-2xl md:text-4xl font-black text-white/20 tracking-tighter uppercase italic">LEADERS IN LITIGATION</span>
                <Shield className="h-8 w-8 text-primary/30" />
                <span className="text-2xl md:text-4xl font-black text-white/20 tracking-tighter uppercase italic">ARCHITECTURE OF EXCELLENCE</span>
                <Zap className="h-8 w-8 text-primary/30" />
              </div>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="py-32 md:py-48">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-24 lg:grid-cols-2 items-center">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={containerVariants}
                className="space-y-12"
              >
                <motion.div variants={itemVariants}>
                  <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-white">Built for <br /><span className="text-primary italic">Performance</span></h2>
                  <p className="mt-6 text-xl text-muted-foreground leading-relaxed max-w-xl">
                    LegalFlow isn&apos;t just software. It&apos;s an operating system for elite firms that refuse to compromise on quality and efficiency.
                  </p>
                </motion.div>

                <div className="space-y-8">
                  {[
                    { title: "Ultimate Client Insight", icon: Users, desc: "A 360-degree view of every engagement, every communication, and every milestone." },
                    { title: "Precision Billing", icon: Clock, desc: "Automated MYR conversion and high-fidelity invoicing that commands respect." },
                    { title: "Secure Repository", icon: Shield, desc: "Bank-grade encryption for your firm's most sensitive digital assets." }
                  ].map((feature, i) => (
                    <motion.div key={i} variants={itemVariants} className="flex gap-6 items-start group">
                      <div className="p-3 bg-white/5 border border-white/10 group-hover:border-primary/50 transition-colors">
                        <feature.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{feature.title}</h4>
                        <p className="text-muted-foreground mt-1">{feature.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 1 }}
                className="relative aspect-square bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden"
              >
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center grayscale opacity-20 hover:opacity-40 transition-opacity duration-700"></div>
                <div className="relative z-10 p-12 text-center">
                  <div className="text-8xl font-black text-primary/20 absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 select-none">EST.</div>
                  <h3 className="text-4xl md:text-6xl font-bold text-white italic tracking-tighter">ESTABLISHED <br /> IN EXCELLENCE</h3>
                  <div className="mt-8 h-1 w-24 bg-primary mx-auto"></div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Excellence Showcase */}
        <section className="py-24 bg-primary text-primary-foreground overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-12">
              <div className="text-center md:text-left">
                <h2 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase italic">Join the Elite</h2>
                <p className="mt-2 text-xl font-medium opacity-80">Stop managing. Start leading with LegalFlow.</p>
              </div>
              <Button asChild size="lg" className="h-20 px-12 text-xl font-black bg-background text-foreground hover:bg-background/90 rounded-none tracking-widest uppercase">
                <Link href="/register">GET STARTED NOW</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-20 border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="h-8 w-8 bg-primary rounded-none"></div>
                <span className="text-2xl font-black tracking-tighter text-white uppercase italic">LEGALFLOW</span>
              </div>
              <p className="max-w-sm text-lg text-muted-foreground font-medium">
                Redefining the architecture of legal practice for the high-performance firms of tomorrow.
              </p>
            </div>
            <div>
              <h5 className="font-bold text-white uppercase tracking-widest mb-6 text-sm">Product</h5>
              <ul className="space-y-4 text-muted-foreground font-medium">
                <li><Link href="#features" className="hover:text-primary transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Roadmap</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-white uppercase tracking-widest mb-6 text-sm">Legal</h5>
              <ul className="space-y-4 text-muted-foreground font-medium">
                <li><Link href="#" className="hover:text-primary transition-colors">Privacy</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Terms</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Security</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold">© 2024 LegalFlow. Built for Pioneers.</p>
            <div className="flex gap-8">
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors font-bold uppercase text-xs tracking-widest">Twitter</Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors font-bold uppercase text-xs tracking-widest">LinkedIn</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
