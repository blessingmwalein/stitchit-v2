export function LogoCloud() {
  const logos = ["FabriTech", "MetalWorks", "TextilePro", "CraftMaster", "ProdFlow", "ManuSmart"]

  return (
    <section className="py-16 border-y border-border bg-secondary/30">
      <div className="container mx-auto px-6">
        <p className="text-center text-sm text-muted-foreground mb-8">Trusted by manufacturing leaders worldwide</p>
        <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16">
          {logos.map((logo, index) => (
            <div
              key={index}
              className="text-xl font-bold text-muted-foreground/40 hover:text-muted-foreground transition-colors cursor-default"
            >
              {logo}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
