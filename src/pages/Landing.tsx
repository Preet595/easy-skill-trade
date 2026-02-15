import { Link } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { ArrowRightLeft, BookOpen, Search, Send, Users, Zap } from "lucide-react";
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

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-5" />
        <div className="container mx-auto px-4 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
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
            <div className="animate-scale-in hidden lg:block">
              <div className="rounded-2xl overflow-hidden shadow-card-hover">
                <img src={heroImage} alt="Skill exchange illustration" className="w-full h-auto" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-card">
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
              className="rounded-xl border border-border bg-card p-6 shadow-card transition-all hover:shadow-card-hover animate-fade-in"
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
