"use client"

import { AlertTriangle, Layers, TrendingDown } from "lucide-react"

export function ProblemSection() {
  const problems = [
    {
      icon: AlertTriangle,
      number: "[1]",
      title: "Scattered Operations",
      description:
        "Most small manufacturers rely on spreadsheets and disconnected tools. This leads to data silos, miscommunication, and costly errors that slow production and hurt margins.",
    },
    {
      icon: Layers,
      number: "[2]",
      title: "Complex ERP Systems",
      description:
        "Traditional ERP solutions are built for enterprises—expensive, complex, and requiring dedicated IT teams. Small businesses need something simpler and more affordable.",
    },
    {
      icon: TrendingDown,
      number: "[3]",
      title: "Limited Visibility",
      description:
        "Without real-time data, manufacturers can't see bottlenecks, track true costs, or make informed decisions. Every day without visibility is a day of lost opportunity.",
    },
  ]

  return (
    <section className="py-24 lg:py-32 relative" id="how-it-works">
      <div className="absolute left-1/2 top-0 w-px h-20 bg-gradient-to-b from-transparent via-primary/50 to-primary" />

      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border mb-6">
            <span className="text-sm font-medium text-muted-foreground">THE PROBLEM</span>
          </div>
          <h2 className="text-3xl lg:text-5xl font-bold mb-4 text-balance text-foreground">
            The Current State of Manufacturing <span className="text-primary">No Longer Works</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We&apos;re here to solve the problems every growing manufacturer faces today
          </p>
        </div>

        {/* Problem Cards - Light theme cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((problem, index) => {
            const Icon = problem.icon
            return (
              <div
                key={index}
                className="group relative p-8 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-md transition-all duration-300"
              >
                {/* Number Badge */}
                <span className="absolute top-6 right-6 text-sm font-mono text-muted-foreground">{problem.number}</span>

                <h3 className="text-xl font-semibold mb-4 text-foreground">{problem.title}</h3>

                {/* Animated illustration placeholder */}
                <div className="h-40 mb-6 rounded-xl bg-secondary/50 flex items-center justify-center overflow-hidden">
                  <div className="relative">
                    <Icon className="h-16 w-16 text-primary/30 group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                  </div>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">{problem.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
