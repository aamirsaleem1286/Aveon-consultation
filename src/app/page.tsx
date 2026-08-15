"use client";

import { useEffect, useRef, useState } from "react";
import { GlobeCanvas } from "@/components/3d/Globe";
import { AIOrb } from "@/components/3d/AIOrb";
import { EducationObjectsCanvas } from "@/components/3d/EducationObjects";
import { cn, scrollToSection, getWhatsAppUrl } from "@/lib/utils";
import { ChevronDown, ArrowRight, CheckCircle, Globe, Zap, Users, Award, BookOpen, MessageCircle } from "lucide-react";

export default function Home() {
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [aiListening, setAiListening] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll("[data-reveal]").forEach((el) => {
      observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  const whatsappUrl = getWhatsAppUrl("+60143675990", "Hi AVEON, I'm interested in your education consultancy services.");

  return (
    <div className="bg-background text-foreground overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-card-border">
        <div className="section-container py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-gradient">AVEON</div>
          <div className="hidden md:flex gap-8 text-sm font-medium">
            <button onClick={() => scrollToSection("services")} className="hover:text-primary transition-colors">Services</button>
            <button onClick={() => scrollToSection("destinations")} className="hover:text-primary transition-colors">Destinations</button>
            <button onClick={() => scrollToSection("process")} className="hover:text-primary transition-colors">Process</button>
            <button onClick={() => scrollToSection("contact")} className="hover:text-primary transition-colors">Contact</button>
          </div>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-primary hidden sm:block">
            <span>Get Started</span>
          </a>
        </div>
      </nav>

      

      {/* Hero Section */}
      <section className="relative min-h-screen pt-20 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <EducationObjectsCanvas count={20} radius={6} />
        </div>

        <div className="section-container relative z-10 grid md:grid-cols-2 gap-12 items-center py-20">
          <div>
            <h1 className="section-title text-gradient mb-6">Your Global Education Journey Starts Here</h1>
            <p className="section-subtitle mb-8">Expert guidance and AI-powered insights to help you choose the right university, course, and study destination. Your dreams deserve the right direction.</p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
                <span>Start Consultation</span>
              </a>
              <button onClick={() => scrollToSection("services")} className="btn-secondary">
                <span>Explore Services</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center md:text-left">
              <div>
                <div className="text-3xl font-bold text-primary">500+</div>
                <p className="text-sm text-foreground/60">Students Guided</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">50+</div>
                <p className="text-sm text-foreground/60">Universities</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">15+</div>
                <p className="text-sm text-foreground/60">Countries</p>
              </div>
            </div>
          </div>

          <div className="relative h-96 md:h-[500px]">
            <GlobeCanvas />
          </div>
        </div>

        <button
          onClick={() => scrollToSection("services")}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce"
        >
          <ChevronDown className="w-6 h-6 text-primary" />
        </button>
      </section>

      {/* Services Section */}
      <section id="services" className="section-container py-20">
        <div data-reveal className={cn("mb-12", visibleSections.has("services") && "reveal-up visible")}>
          <h2 className="section-title mb-4">Our Services</h2>
          <p className="section-subtitle">Comprehensive support for every step of your international education journey</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Globe,
              title: "University Selection",
              description: "AI-powered analysis to match your profile with the perfect universities worldwide. We consider your academics, interests, and career goals.",
              features: ["Profile Analysis", "University Matching", "Rankings Review"]
            },
            {
              icon: BookOpen,
              title: "Application Support",
              description: "Expert guidance through the entire application process. From essay writing to submission, we ensure your applications stand out.",
              features: ["Essay Review", "Document Preparation", "Interview Coaching"]
            },
            {
              icon: Zap,
              title: "Visa & Immigration",
              description: "Navigate visa requirements with confidence. Our specialists handle documentation and keep you informed every step of the way.",
              features: ["Visa Guidance", "Document Checklist", "Timeline Planning"]
            },
            {
              icon: Award,
              title: "Scholarship Guidance",
              description: "Unlock financial opportunities. We help you identify and apply for scholarships that match your profile and reduce education costs.",
              features: ["Scholarship Search", "Application Help", "Financial Planning"]
            },
            {
              icon: Users,
              title: "Pre-Arrival Preparation",
              description: "Get ready for your new adventure. We provide accommodation guidance, cultural orientation, and practical settling-in support.",
              features: ["Housing Assistance", "Cultural Guide", "Peer Network"]
            },
            {
              icon: MessageCircle,
              title: "Ongoing Support",
              description: "Your journey doesn't end after admission. We continue supporting you throughout your studies and beyond graduation.",
              features: ["Mentoring", "Career Guidance", "Alumni Network"]
            }
          ].map((service, i) => {
            const Icon = service.icon;
            return (
              <div
                key={i}
                data-reveal
                className={cn(
                  "card-glass p-6 rounded-2xl hover:glow-primary transition-all duration-500",
                  visibleSections.has("services") && "reveal-up visible"
                )}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <Icon className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                <p className="text-foreground/70 mb-4 text-sm">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2 text-xs text-foreground/60">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* Destinations Section */}
      <section id="destinations" className="section-container py-20">
        <div data-reveal className={cn("mb-12", visibleSections.has("destinations") && "reveal-up visible")}>
          <h2 className="section-title mb-4">Top Study Destinations</h2>
          <p className="section-subtitle">We specialize in guiding students to leading universities across the globe</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: "United Kingdom", icon: "🇬🇧", universities: "Oxford, Cambridge, LSE", description: "World-class education with centuries of tradition" },
            { name: "United States", icon: "🇺🇸", universities: "Harvard, MIT, Stanford", description: "Innovation hub with diverse educational options" },
            { name: "Canada", icon: "🇨🇦", universities: "University of Toronto, UBC", description: "Quality education with excellent work opportunities" },
            { name: "Australia", icon: "🇦🇺", universities: "ANU, University of Sydney", description: "Modern universities with vibrant student life" },
            { name: "Germany", icon: "🇩🇪", universities: "TU Munich, Heidelberg", description: "Strong engineering and technology programs" },
            { name: "Ireland", icon: "🇮🇪", universities: "Trinity College, UCD", description: "European gateway with growing tech scene" },
            { name: "New Zealand", icon: "🇳🇿", universities: "University of Auckland", description: "Safe, beautiful environment for studies" },
            { name: "Malaysia", icon: "🇲🇾", universities: "University of Malaya", description: "Affordable education in Southeast Asia" }
          ].map((dest, i) => (
            <div
              key={i}
              data-reveal
              className={cn(
                "card-glass p-6 rounded-xl hover:glow-primary transition-all duration-500 cursor-pointer group",
                visibleSections.has("destinations") && "reveal-up visible"
              )}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{dest.icon}</div>
              <h3 className="text-lg font-bold mb-1">{dest.name}</h3>
              <p className="text-xs text-foreground/60 mb-3">{dest.universities}</p>
              <p className="text-sm text-foreground/70">{dest.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Process Section */}
      <section id="process" className="section-container py-20">
        <div data-reveal className={cn("mb-12", visibleSections.has("process") && "reveal-up visible")}>
          <h2 className="section-title mb-4">Our Process</h2>
          <p className="section-subtitle">A structured approach to achieve your educational goals</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {[
            {
              step: "01",
              title: "Assessment",
              description: "We evaluate your academic profile, interests, and career aspirations to create a personalized roadmap."
            },
            {
              step: "02",
              title: "Planning",
              description: "Strategic selection of universities and programs that align with your goals and financial situation."
            },
            {
              step: "03",
              title: "Application",
              description: "Comprehensive support with applications, essays, recommendations, and interview preparation."
            },
            {
              step: "04",
              title: "Success",
              description: "Visa guidance, accommodation, and ongoing support to ensure a smooth transition to your new university."
            }
          ].map((item, i) => (
            <div
              key={i}
              data-reveal
              className={cn(
                "relative",
                visibleSections.has("process") && "reveal-up visible"
              )}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="card-glass p-8 rounded-xl h-full">
                <div className="text-5xl font-bold text-primary/20 mb-4">{item.step}</div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-foreground/70 text-sm">{item.description}</p>
              </div>
              {i < 3 && (
                <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                  <ArrowRight className="w-6 h-6 text-primary/30" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* AI Consultation Section */}
      <section className="section-container py-20 relative">
        <div className="card-glass rounded-2xl p-12 overflow-hidden relative">
          <div className="absolute -right-20 -top-20 opacity-20">
            <div className="w-96 h-96">
              <AIOrb size={300} isListening={aiListening} />
            </div>
          </div>

          <div className="relative z-10 max-w-2xl">
            <h2 className="section-title mb-6 text-gradient">AI-Powered Consultation</h2>
            <p className="text-lg text-foreground/80 mb-8">
              Our advanced AI assistant helps you explore universities, answer common questions, and get instant insights. Start a conversation to discover the perfect fit for your education journey.
            </p>

            <button
              onClick={() => setAiListening(!aiListening)}
              onMouseLeave={() => setAiListening(false)}
              className="btn-primary"
            >
              <span>Chat with Our AI Assistant</span>
            </button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="section-container py-20">
        <div data-reveal className={cn("mb-12 text-center", visibleSections.has("contact") && "reveal-up visible")}>
          <h2 className="section-title mb-4">Ready to Begin Your Journey?</h2>
          <p className="section-subtitle mx-auto">Get in touch with our consultants today</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div data-reveal className={cn("card-glass p-8 rounded-2xl", visibleSections.has("contact") && "reveal-up visible")} style={{ transitionDelay: "100ms" }}>
            <h3 className="text-xl font-bold mb-6">Get In Touch</h3>
            <div className="space-y-6">
              <div>
                <p className="text-foreground/60 text-sm mb-2">Islamabad Office</p>
                {/* <p className="font-semibold">Plot #XX, Commercial Area, Islamabad</p> */}
                <p className="text-foreground/70 text-sm">+92 323 352 7427</p>
              </div>
              <div>
                <p className="text-foreground/60 text-sm mb-2">Kuala Lumpur Office</p>
                {/* <p className="font-semibold">Menara XX, Jalan XX, Kuala Lumpur</p> */}
                <p className="text-foreground/70 text-sm">+60 17 573 6456
                
                
                </p>
              </div>
              <div>
                <p className="text-foreground/60 text-sm mb-2">Email</p>
                <p className="font-semibold">info@aveon-consultancy.com</p>
                <p className="text-foreground/70 text-sm">queries@aveon-consultancy.com</p>
              </div>
               <div>
                <p className="text-foreground/60 text-sm mb-2">Office Hours</p>
                <p className="font-semibold">Monday – Friday<br/>
9:00 AM – 7:00 PM (Pakistan Time)</p><br/>
 <p className="font-semibold">Saturday and Sunday<br/>
Available by Appointment</p>   <br/>                       <p className="text-foreground/60 text-sm mb-2">Students and partner institutions are welcome to contact us via email or WhatsApp. We strive to respond to all inquiries as promptly as possible.</p>
    </div>
            </div>
          </div>

          <div data-reveal className={cn("card-glass p-8 rounded-2xl", visibleSections.has("contact") && "reveal-up visible")} style={{ transitionDelay: "200ms" }}>
            <h3 className="text-xl font-bold mb-6">Quick Contact</h3>
            <form className="space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                className="w-full bg-background/50 border border-card-border rounded-lg px-4 py-3 text-foreground placeholder-foreground/40 focus:outline-none focus:border-primary transition-colors"
              />
              <input
                type="email"
                placeholder="Your Email"
                className="w-full bg-background/50 border border-card-border rounded-lg px-4 py-3 text-foreground placeholder-foreground/40 focus:outline-none focus:border-primary transition-colors"
              />
              <textarea
                placeholder="Your Message"
                rows={4}
                className="w-full bg-background/50 border border-card-border rounded-lg px-4 py-3 text-foreground placeholder-foreground/40 focus:outline-none focus:border-primary transition-colors resize-none"
              />
              <button type="submit" className="btn-primary w-full">
                <span>Send Message</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-card-border bg-background/50 backdrop-blur mt-20">
        <div className="section-container py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4 text-primary">AVEON</h4>
              <p className="text-sm text-foreground/60">Your trusted partner in global education</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li><a href="#" className="hover:text-primary transition-colors">University Selection</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Applications</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Visa Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Team</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Testimonials</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li><a href="#" className="hover:text-primary transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-card-border pt-8 text-center text-sm text-foreground/60">
            <p>&copy; 2026 AVEON (Private) Limited. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* WhatsApp Floating Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-40"
        title="Chat on WhatsApp"
      >
        <MessageCircle className="w-7 h-7 text-white" />
      </a>
    </div>
  );
}
