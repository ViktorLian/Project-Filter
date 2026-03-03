"use client";
import { Sparkles, Target, Heart } from "lucide-react";

const points = [
  {
    icon: Target,
    title: "Du tilpasser deg ikke systemet",
    desc: "Vi tilpasser systemet etter deg. Du er rørlegger, ikke IT-sjef – og det skal ikke kreve en manual å bruke CRM-et ditt.",
  },
  {
    icon: Heart,
    title: "Hver bedrift er unik",
    desc: "En frisørsalong trenger ikke det samme som en advokat. FlowPilot gir deg verktøyene som faktisk gir mening for din bransje.",
  },
  {
    icon: Sparkles,
    title: "SMB-bedrifter fortjener enterprise-teknologi",
    desc: "AI, automatisering og smart innsikt – tidligere bare tilgjengelig for store selskaper. Nå bygget for deg.",
  },
];

export function Manifesto() {
  return (
    <section className="relative py-24 bg-[#0a0f1a] overflow-hidden">
      {/* background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-5xl mx-auto px-6 text-center">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
          <Sparkles className="h-3.5 w-3.5" />
          CRM-systemet for fremtiden
        </span>

        <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
          Vi hører deg.{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
            Vi ser deg.
          </span>
        </h2>

        <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-16 leading-relaxed">
          Ingen bedrift er lik. Spesielt ikke SMB-bedrifter. Derfor er FlowPilot bygget
          fra bunnen av for{" "}
          <em className="text-slate-200 not-italic">din</em> bransje – ikke en generisk løsning du
          må bøye deg etter.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {points.map((p, i) => (
            <div
              key={i}
              className="relative rounded-2xl border border-white/10 bg-white/5 p-8 text-left hover:border-blue-500/40 transition-colors"
            >
              <div className="h-10 w-10 rounded-xl bg-blue-500/15 flex items-center justify-center mb-5">
                <p.icon className="h-5 w-5 text-blue-400" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-3">{p.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

