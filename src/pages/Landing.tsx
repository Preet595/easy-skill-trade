import { Link } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowRightLeft, BookOpen, MessageCircle, Search, Send, Users, Zap } from "lucide-react";
import heroImage from "@/assets/hero-illustration.jpg";

const Landing = () => {
  const { currentUser } = useAppContext();

  const features = [
    { icon: BookOpen, title: "Share Your Skills", desc: "List what you can teach and what you want to learn" },
    { icon: Search, title: "Find Matches", desc: "Our matching system finds perfect skill swap partners" },
    { icon: Send, title: "Send Requests", desc: "Connect with matched users and start learning" },
    { icon: Users, title: "Grow Together", desc: "Exchange knowledge and build a community" },
  ];

  const stats = [
    { value: "500+", label: "Active Users" },
    { value: "120+", label: "Skills Listed" },
    { value: "300+", label: "Successful Swaps" },
  ];

  const howItWorksSteps = [
    {
      icon: Users,
      title: "Create a profile",
      subtitle: "Share what you can teach and want to learn.",
      body: "Set up your profile with skills you offer and skills you are curious about so others can discover you.",
    },
    {
      icon: Search,
      title: "Browse users",
      subtitle: "Find people with matching interests.",
      body: "Use filters and matching to discover peers whose skills align with your learning goals.",
    },
    {
      icon: Send,
      title: "Send requests",
      subtitle: "Reach out to start a swap.",
      body: "Send a skill swap request and agree on what you will teach and what you will learn.",
    },
    {
      icon: MessageCircle,
      title: "Start chatting",
      subtitle: "Coordinate your first session.",
      body: "Discuss timing, format, and expectations so both sides get the most from the exchange.",
    },
    {
      icon: ArrowRightLeft,
      title: "Learn & teach",
      subtitle: "Grow together over time.",
      body: "Keep swapping skills, refining what you offer while picking up new abilities from others.",
    },
  ];

  const faqs = [
    {
      q: "Is Easy Skill Trade free to use?",
      a: "Yes. The platform is designed around peer‑to‑peer learning, not payments.",
    },
    {
      q: "How do I connect with someone?",
      a: "Find a match, send a swap request, and once it is accepted you can coordinate directly.",
    },
    {
      q: "Can I both teach and learn?",
      a: "Absolutely. Most users offer at least one skill and are learning several others.",
    },
    {
      q: "Do I need to be an expert to teach?",
      a: "No. As long as you are a step ahead and honest about your level, you can help someone else.",
    },
    {
      q: "Is there a limit to how many skills I can add?",
      a: "There is no hard limit, but focusing on a few core skills usually leads to better matches.",
    },
  ];

  return (
    <div className="min-h-screen app-page-bg">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-5" />
        <div className="pointer-events-none absolute -left-24 top-10 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-64 w-64 rounded-full bg-secondary/25 blur-3xl" />
        <div className="container mx-auto px-4 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-up-soft">
              <div className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground mb-6">
                <Zap className="h-3.5 w-3.5" />
                Learn by teaching, teach by learning
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight mb-6">
                Swap Skills,{" "}
                <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Grow Together
                </span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-lg">
                Connect with people who have the skills you need and share what you know. No money involved — just pure knowledge exchange.
              </p>
              <div className="flex flex-wrap gap-3">
                {currentUser ? (
                  <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-xl gradient-hero px-6 py-3 font-semibold text-primary-foreground shadow-button transition-all hover:opacity-90">
                    Go to Dashboard
                    <ArrowRightLeft className="h-4 w-4" />
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="inline-flex items-center gap-2 rounded-xl gradient-hero px-6 py-3 font-semibold text-primary-foreground shadow-button transition-all hover:opacity-90">
                      Get Started Free
                      <ArrowRightLeft className="h-4 w-4" />
                    </Link>
                    <Link to="/login" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 font-semibold text-foreground shadow-card transition-all hover:shadow-card-hover">
                      Sign In
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="animate-float-soft hidden lg:block">
              <div className="rounded-2xl overflow-hidden shadow-card-hover glass-panel">
                <img src={heroImage} alt="Skill exchange illustration" className="w-full h-auto" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-card/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-3 gap-8 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-3xl font-extrabold text-primary">{s.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-foreground mb-3">How It Works</h2>
          <p className="text-muted-foreground max-w-md mx-auto">Four simple steps to start exchanging skills with amazing people</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="rounded-xl border border-border bg-card/80 backdrop-blur-md p-6 shadow-card transition-all hover:shadow-card-hover animate-fade-up-soft"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl gradient-hero">
                <f.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-bold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Detailed How It Works steps */}
      <section className="container mx-auto px-4 pb-12">
        <div className="mb-6 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-2">A simple 5‑step flow</h3>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            From creating your profile to teaching and learning together, here is how Easy Skill Trade fits into your day.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
          {howItWorksSteps.map((step, index) => (
            <div
              key={step.title}
              className="rounded-2xl border border-border bg-card/80 p-5 shadow-card animate-fade-up-soft"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <step.icon className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-semibold text-foreground mb-1">{step.title}</h4>
              <p className="text-xs font-medium text-primary mb-1.5">{step.subtitle}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQs */}
      <section className="container mx-auto px-4 pb-20">
        <div className="mb-6 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-2">FAQs</h3>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Quick answers to the most common questions about how skill swapping works here.
          </p>
        </div>
        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card/80 p-4 shadow-card">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((item, index) => (
              <AccordionItem key={item.q} value={`faq-${index}`}>
                <AccordionTrigger className="text-left text-sm font-medium text-foreground">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="gradient-hero">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">Ready to Start Swapping?</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-md mx-auto">Join our community and start learning new skills today</p>
          {!currentUser && (
            <Link to="/register" className="inline-flex items-center gap-2 rounded-xl bg-card px-6 py-3 font-semibold text-foreground shadow-card transition-all hover:shadow-card-hover">
              Create Free Account
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Landing;
