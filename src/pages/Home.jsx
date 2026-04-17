import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import mensCollectionBanner from "../assets/images/atelier-craft.jpeg";
import womensCollectionBanner from "../assets/images/atelier-fitting.jpeg";
import sustainableFabric from "../assets/images/atelier-craft.jpeg";
import customEmbroidery from "../assets/images/atelier-fitting.jpeg";
import ScrollReveal from "../components/ScrollReveal";

const heroMetrics = [
  { value: "Curated", label: "designer directory" },
  { value: "Material-first", label: "studio workflow" },
  { value: "Trackable", label: "production journey" },
];

const studioHighlights = [
  {
    icon: "fa-ruler-combined",
    title: "Fit starts with the garment, not the effect",
    copy:
      "Choose silhouette, fabric, pattern, and graphic decisions in an order that mirrors real apparel work.",
  },
  {
    icon: "fa-file-invoice",
    title: "Pricing stays legible",
    copy:
      "Customers can see how fabric and designer decisions shape cost instead of guessing behind a decorative interface.",
  },
  {
    icon: "fa-user-check",
    title: "Designers remain visible",
    copy:
      "Profiles, ratings, and specialization cues are treated like editorial identity, not anonymous marketplace cards.",
  },
];

const processSteps = [
  {
    number: "01",
    title: "Start with the brief",
    copy:
      "Browse designers or open the studio with a clear garment intent, material preference, and delivery context.",
  },
  {
    number: "02",
    title: "Shape the piece",
    copy:
      "Choose fabric, fit, color, and graphics with a live 3D preview and pricing guidance that stays easy to compare.",
  },
  {
    number: "03",
    title: "Track the making",
    copy:
      "Move from order to delivery with clearer order details, designer communication, and more confidence in the process.",
  },
];

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="editorial-home">
      <section className="atelier-hero">
        <div className="container">
          <div className="row g-4 align-items-end">
            <div className="col-lg-6">
              <ScrollReveal className="hero-copy">
                <span className="hero-eyebrow">
                  <i className="fas fa-scissors"></i>
                  Custom clothing, handled with care
                </span>
                <h1 className="hero-title">
                  Work with designers who understand fabric, fit, and finish.
                </h1>
                <p>
                  DesignDen connects customers with fashion designers through a
                  calmer, more material-aware experience. The platform is built
                  to make garment decisions feel intentional instead of
                  overwhelming.
                </p>

                <div className="hero-actions">
                  <Link to="/marketplace" className="btn btn-primary btn-lg">
                    Browse designers
                  </Link>
                  <Link
                    to={user ? "/customer/design-studio" : "/signup"}
                    className="btn btn-outline-primary btn-lg"
                  >
                    Open design studio
                  </Link>
                  {!user && (
                    <Link
                      to="/signup?role=designer"
                      className="btn btn-light btn-lg"
                    >
                      Join as designer
                    </Link>
                  )}
                </div>

                <div className="hero-metrics">
                  {heroMetrics.map((metric) => (
                    <div key={metric.label} className="hero-metric">
                      <dt>{metric.value}</dt>
                      <dd>{metric.label}</dd>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            </div>

            <div className="col-lg-6">
              <ScrollReveal delay="delay-1">
                <div className="hero-visual-grid">
                  <article className="atelier-photo-card atelier-photo-card--tall">
                    <img src={womensCollectionBanner} alt="Women's custom collection" />
                    <div className="atelier-photo-card__body">
                      <strong>Women&apos;s custom collection</strong>
                      <p>
                        Softer editorial presentation, stronger garment focus,
                        and clearer seasonal direction.
                      </p>
                    </div>
                  </article>

                  <div className="d-grid gap-3">
                    <article className="atelier-photo-card">
                      <img src={mensCollectionBanner} alt="Men's custom collection" />
                      <div className="atelier-photo-card__body">
                        <strong>Men&apos;s custom collection</strong>
                        <p>
                          Tailored around wardrobe staples, teamwear, and
                          cleaner designer collaboration.
                        </p>
                      </div>
                    </article>

                    <article className="atelier-note-card">
                      <div className="atelier-note-card__body">
                        <span className="editorial-kicker">Atelier note</span>
                        <strong>Less startup polish. More garment confidence.</strong>
                        <p>
                          The new direction removes the usual glowing AI-era UI
                          patterns and brings the product closer to a modern
                          fashion showroom.
                        </p>
                      </div>
                    </article>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      <section className="editorial-section">
        <div className="container">
          <ScrollReveal>
            <div className="editorial-section__intro">
              <span className="editorial-kicker">Why this feels different</span>
              <h2>A custom clothing experience that reads as crafted, not generated.</h2>
              <p>
                The strongest digital fashion products make decisions feel
                guided. Typography carries the identity, imagery carries the
                mood, and the interface keeps the garment in focus.
              </p>
            </div>
          </ScrollReveal>

          <div className="atelier-grid atelier-grid--three">
            {studioHighlights.map((item, index) => (
              <ScrollReveal key={item.title} delay={`delay-${Math.min(index + 1, 3)}`}>
                <article className="atelier-panel">
                  <span className="atelier-panel__icon">
                    <i className={`fas ${item.icon}`}></i>
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.copy}</p>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="editorial-section">
        <div className="container">
          <div className="atelier-proof-grid">
            <ScrollReveal>
              <article className="atelier-proof-card">
                <span className="editorial-kicker">Studio-led interface</span>
                <h2>The platform now speaks in fabric, silhouette, and production language.</h2>
                <p>
                  Instead of relying on gradients and floating decoration,
                  DesignDen can lean on tangible cues: swatches, materials,
                  profile credibility, and stronger order clarity.
                </p>
                <img src={customEmbroidery} alt="Custom embroidery detail" />
              </article>
            </ScrollReveal>

            <div className="atelier-proof-list">
              <ScrollReveal delay="delay-1">
                <article className="atelier-proof-item">
                  <strong>Designer profiles feel curated</strong>
                  <p>
                    Ratings, specialization, price range, and turnaround are
                    easier to scan without turning every detail into a badge.
                  </p>
                </article>
              </ScrollReveal>
              <ScrollReveal delay="delay-2">
                <article className="atelier-proof-item">
                  <strong>Studio controls stay task-first</strong>
                  <p>
                    The customer should move from garment to material to
                    embellishment in a sequence that makes sense.
                  </p>
                </article>
              </ScrollReveal>
              <ScrollReveal delay="delay-3">
                <article className="atelier-proof-item">
                  <strong>Light mode strengthens trust</strong>
                  <p>
                    Warm neutrals, ink text, and restrained accent colors create
                    a calmer shopping and ordering environment.
                  </p>
                </article>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      <section className="editorial-section">
        <div className="container">
          <ScrollReveal>
            <div className="editorial-section__intro">
              <span className="editorial-kicker">How it works</span>
              <h2>A clearer flow from brief to garment.</h2>
            </div>
          </ScrollReveal>

          <div className="atelier-process-grid">
            {processSteps.map((step, index) => (
              <ScrollReveal key={step.number} delay={`delay-${Math.min(index + 1, 3)}`}>
                <article className="atelier-step">
                  <span className="atelier-step__number">{step.number}</span>
                  <h3>{step.title}</h3>
                  <p>{step.copy}</p>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="editorial-section">
        <div className="container">
          <ScrollReveal>
            <div className="editorial-section__intro">
              <span className="editorial-kicker">Collections</span>
              <h2>Start from a ready direction, then personalize the piece.</h2>
            </div>
          </ScrollReveal>

          <div className="atelier-collections">
            <ScrollReveal delay="delay-1">
              <article className="atelier-collection-card">
                <img src={mensCollectionBanner} alt="Men's collection" />
                <div className="atelier-collection-card__body">
                  <p className="editorial-kicker">For men</p>
                  <h3>Sharper essentials and everyday custom pieces</h3>
                  <p>
                    Teamwear, statement graphics, and made-to-order staples with
                    cleaner browsing and pricing.
                  </p>
                  <Link to="/shop?gender=Men" className="btn btn-light mt-2 align-self-start">
                    Shop men
                  </Link>
                </div>
              </article>
            </ScrollReveal>

            <ScrollReveal delay="delay-2">
              <article className="atelier-collection-card">
                <img src={womensCollectionBanner} alt="Women's collection" />
                <div className="atelier-collection-card__body">
                  <p className="editorial-kicker">For women</p>
                  <h3>Designer-led custom clothing with softer editorial cues</h3>
                  <p>
                    Move from inspiration to garment details with a calmer
                    studio flow and stronger visual hierarchy.
                  </p>
                  <Link
                    to="/shop?gender=Women"
                    className="btn btn-light mt-2 align-self-start"
                  >
                    Shop women
                  </Link>
                </div>
              </article>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="editorial-section">
        <div className="container">
          <ScrollReveal>
            <div className="editorial-section__intro">
              <span className="editorial-kicker">Material cues</span>
              <h2>Texture, sustainability, and detail should carry the mood.</h2>
            </div>
          </ScrollReveal>

          <div className="atelier-material-grid">
            <ScrollReveal delay="delay-1">
              <article className="atelier-material-card">
                <img src={sustainableFabric} alt="Sustainable fabrics" />
                <div className="atelier-material-card__body">
                  <h3>Sustainable fabrics</h3>
                  <p>
                    Sustainability works better when it is visible in the
                    interface and easy to compare during design decisions.
                  </p>
                </div>
              </article>
            </ScrollReveal>

            <ScrollReveal delay="delay-2">
              <article className="atelier-material-card">
                <img src={customEmbroidery} alt="Embroidery detail" />
                <div className="atelier-material-card__body">
                  <h3>Craft details</h3>
                  <p>
                    Embroidery, print placement, and embellishment choices
                    deserve a more tactile presentation than generic cards.
                  </p>
                </div>
              </article>
            </ScrollReveal>

            <ScrollReveal delay="delay-3">
              <article className="atelier-panel h-100">
                <span className="editorial-kicker">Trend signal</span>
                <h3>Warm, human, and materially specific.</h3>
                <p>
                  That is the direction standing apart from the flattened AI
                  look in 2026. It fits custom fashion far better than cold
                  futuristic UI tropes.
                </p>
              </article>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="editorial-section">
        <div className="container">
          <ScrollReveal>
            <div className="atelier-cta">
              <div className="atelier-cta__grid">
                <div>
                  <span className="editorial-kicker">For designers</span>
                  <h2>Bring your signature into a marketplace that feels more curated.</h2>
                  <p>
                    Profiles, pricing, and specialization should feel considered
                    enough to support real creative trust. Join the directory and
                    meet customers looking for thoughtful custom work.
                  </p>
                  <Link
                    to="/signup?role=designer"
                    className="btn btn-primary mt-2"
                  >
                    Join as designer
                  </Link>
                </div>

                <div className="atelier-cta__metrics">
                  <article className="atelier-cta__metric">
                    <strong>Keep pricing visible</strong>
                    <p>Show design fees clearly instead of burying them in the flow.</p>
                  </article>
                  <article className="atelier-cta__metric">
                    <strong>Lead with specialization</strong>
                    <p>Streetwear, formalwear, sustainable fashion, or embroidery-led work.</p>
                  </article>
                  <article className="atelier-cta__metric">
                    <strong>Reduce marketplace sameness</strong>
                    <p>Make identity, craft, and reliability easy to feel at first glance.</p>
                  </article>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
};

export default Home;
