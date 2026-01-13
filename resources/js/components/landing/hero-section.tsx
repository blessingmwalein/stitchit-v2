"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { IsometricCube } from "./isometric-cube"

export function HeroSection() {
  const benefits = [
    "Real-time production tracking & monitoring",
    "Automated inventory management alerts",
    "Complete order-to-delivery visibility",
    "Multi-user role-based access control",
  ]

  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 grid-pattern opacity-50" />

      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />

      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
      <div
        className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse-glow"
        style={{ animationDelay: "1.5s" }}
      />

      <div className="container mx-auto px-6 relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">#1 ERP for Manufacturing SMBs</span>
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-balance text-foreground">
                Streamline Production. <span className="text-primary">Scale with Confidence.</span>
              </h1>
              <p className="text-lg lg:text-xl text-muted-foreground max-w-xl leading-relaxed">
                The complete ERP solution built for small to medium manufacturing businesses. Manage orders, production,
                inventory, and finances in one powerful platform.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 h-14 text-base font-semibold group"
              >
                Book a Demo
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-8 h-14 text-base font-semibold border-border hover:bg-secondary text-foreground bg-transparent"
              >
                Watch Video
              </Button>
            </div>

            {/* Benefits List */}
            <div className="space-y-3 pt-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3 text-muted-foreground">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - 3D Visualization */}
          <div className="relative lg:h-[600px] flex items-center justify-center">
            <IsometricCube />
          </div>
        </div>
      </div>
    </section>
  )
}
