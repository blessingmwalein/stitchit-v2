"use client"

import { Package, ClipboardList, BarChart3, Users, Truck, Calculator } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      number: "1.",
      title: "Production Tracking",
      description: "Monitor every production job in real-time with live status updates and progress tracking.",
      icon: Package,
    },
    {
      number: "2.",
      title: "Order Management",
      description: "Handle orders from quote to delivery with complete visibility at every stage.",
      icon: ClipboardList,
    },
    {
      number: "3.",
      title: "Inventory Control",
      description: "Track materials, get low-stock alerts, and optimize your supply chain automatically.",
      icon: Truck,
    },
    {
      number: "4.",
      title: "Smart Analytics",
      description: "Get insights that matter with production reports, cost analysis, and trend forecasting.",
      icon: BarChart3,
    },
    {
      number: "5.",
      title: "Team Management",
      description: "Assign tasks, track performance, and keep your entire team aligned and productive.",
      icon: Users,
    },
    {
      number: "6.",
      title: "Financial Overview",
      description: "Track costs, revenue, and profitability with integrated financial reporting.",
      icon: Calculator,
    },
  ]

  return (
    <section className="py-24 lg:py-32 bg-secondary/50" id="features">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <span className="text-sm font-medium text-primary">OUR FEATURES</span>
          </div>
          <h2 className="text-3xl lg:text-5xl font-bold mb-4 text-balance text-foreground">
            A New Era of Manufacturing <span className="text-primary">for Serious Operators</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            One performance layer. Every signal. True control. Clear growth.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Feature List */}
          <div className="space-y-1">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="group flex items-start gap-4 p-4 rounded-xl hover:bg-card hover:shadow-sm transition-all cursor-default"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-foreground group-hover:text-primary transition-colors">
                      {feature.number} {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="sticky top-32">
              <div className="relative rounded-2xl border border-border bg-card p-8 overflow-hidden shadow-sm">
                {/* Decorative gradient */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />

                <div className="relative space-y-6">
                  {/* Mini chart visualization */}
                  <div className="flex items-end justify-between h-48 gap-3">
                    {[40, 65, 45, 80, 55, 70, 85, 60, 90].map((height, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t-lg bg-gradient-to-t from-primary/80 to-primary/40 transition-all hover:from-primary hover:to-primary/60"
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>

                  {/* Labels */}
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Analyze</span>
                    <span>Optimize</span>
                    <span>Track</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
