"use client"

import { Star } from "lucide-react"

export function TestimonialsSection() {
  const testimonials = [
    {
      quote: "Stitchit ERP transformed how we manage production. We went from chaos to complete visibility in weeks.",
      author: "Sarah Chen",
      role: "Operations Director",
      company: "Pacific Textiles",
    },
    {
      quote: "Finally, an ERP that understands small manufacturers. No bloat, just the features we actually need.",
      author: "Marcus Rodriguez",
      role: "Founder & CEO",
      company: "MetalCraft Industries",
    },
    {
      quote: "Our inventory accuracy went from 85% to 99.5%. The ROI was visible within the first month.",
      author: "Emily Watson",
      role: "Production Manager",
      company: "FabriTech Solutions",
    },
  ]

  return (
    <section className="py-24 lg:py-32" id="testimonials">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold mb-4 text-balance text-foreground">
            Loved by Manufacturing Teams
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See what our customers have to say about Stitchit ERP
          </p>
        </div>

        {/* Testimonials Grid - Light theme cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="p-8 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-md transition-all"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-foreground mb-8 leading-relaxed">&quot;{testimonial.quote}&quot;</p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-semibold">{testimonial.author.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
