"use client"

import { TrendingUp, Shield, Zap, Globe } from "lucide-react"

export function BentoSection() {
  return (
    <section className="py-24 lg:py-32">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold mb-4 text-balance text-foreground">
            Built for the Modern Manufacturer
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to run your manufacturing business efficiently
          </p>
        </div>

        {/* Bento Grid - Light theme with orange accents */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Large Card - Trust */}
          <div className="lg:col-span-2 p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 group">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <div className="flex-1 space-y-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/20">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Trust Your Data Again</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We deliver the highest-quality tracking for your business. With compliant tracking and real-time
                  updates, you always know exactly where every order and material is at any moment.
                </p>
              </div>
              <div className="flex-shrink-0 p-6 rounded-xl bg-card border border-border shadow-sm">
                <div className="text-4xl font-bold text-primary mb-2">22%</div>
                <p className="text-sm text-muted-foreground">Average cost reduction</p>
              </div>
            </div>
          </div>

          {/* Small Card - Security */}
          <div className="p-8 rounded-2xl bg-card border border-border group hover:border-primary/50 hover:shadow-md transition-all">
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-secondary">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Enterprise Security</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Bank-level encryption, role-based access, and complete audit trails keep your data safe and compliant.
              </p>
            </div>
          </div>

          {/* Small Card - Speed */}
          <div className="p-8 rounded-2xl bg-card border border-border group hover:border-primary/50 hover:shadow-md transition-all">
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-secondary">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Lightning Fast</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Optimized for speed with instant updates and real-time synchronization across all your devices.
              </p>
            </div>
          </div>

          {/* Large Card - Cloud */}
          <div className="lg:col-span-2 p-8 rounded-2xl bg-card border border-border group hover:border-primary/50 hover:shadow-md transition-all">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <div className="flex-1 space-y-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-secondary">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Cloud-Native Platform</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Access your ERP from anywhere, on any device. Our cloud infrastructure ensures 99.9% uptime and
                  automatic backups so you never lose critical business data.
                </p>
              </div>
              <div className="flex gap-4">
                {["99.9%", "24/7", "Auto"].map((stat, i) => (
                  <div key={i} className="p-4 rounded-xl bg-secondary text-center">
                    <div className="text-lg font-bold text-primary">{stat}</div>
                    <p className="text-xs text-muted-foreground">
                      {i === 0 ? "Uptime" : i === 1 ? "Support" : "Backup"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
