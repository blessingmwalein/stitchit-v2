export function StatsSection() {
  const stats = [
    { value: "500+", label: "Manufacturing Partners" },
    { value: "2M+", label: "Orders Processed" },
    { value: "35%", label: "Efficiency Increase" },
    { value: "99.9%", label: "Uptime Guarantee" },
  ]

  return (
    <section className="py-24 bg-secondary/50 border-y border-border">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-primary mb-2">{stat.value}</div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
