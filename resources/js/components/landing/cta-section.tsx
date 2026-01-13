"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-24 lg:py-32">
      <div className="container mx-auto px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-card to-primary/5 border border-primary/20 p-12 lg:p-20">
          {/* Background Effects */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />

          <div className="relative text-center max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-5xl font-bold mb-6 text-balance text-foreground">
              Ready to Transform Your Manufacturing?
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              Join hundreds of manufacturers using Stitchit ERP to streamline operations and scale their businesses with
              confidence.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
                Contact Sales
              </Button>
            </div>

            {/* Trust Badge */}
            <p className="mt-8 text-sm text-muted-foreground">
              No credit card required • Free 14-day trial • Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
