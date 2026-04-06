import { motion, Variants } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { 
  Database, 
  Globe, 
  Zap, 
  Smartphone, 
  CheckCircle2, 
  ArrowRight, 
  LayoutDashboard, 
  Calendar,
  Layers,
  Sparkles,
  Search,
  MessageSquareText
} from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/react-app/components/ui/button";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export default function Services() {
  const { t } = useTranslation();

  const offers = [
    {
      id: "systems",
      icon: Database,
      title: t("services.offers.systems.title"),
      desc: t("services.offers.systems.desc"),
      items: t("services.offers.systems.items", { returnObjects: true }) as string[],
      color: "blue",
    },
    {
      id: "websites",
      icon: Globe,
      title: t("services.offers.websites.title"),
      desc: t("services.offers.websites.desc"),
      items: t("services.offers.websites.items", { returnObjects: true }) as string[],
      color: "emerald",
    },
    {
      id: "automation",
      icon: Zap,
      title: t("services.offers.automation.title"),
      desc: t("services.offers.automation.desc"),
      items: t("services.offers.automation.items", { returnObjects: true }) as string[],
      color: "yellow",
    },
  ];

  const useCases = [
    { title: t("services.use_cases.laundry"), icon: Smartphone },
    { title: t("services.use_cases.local"), icon: Zap },
    { title: t("services.use_cases.booking"), icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Services | Northern Step Studio</title>
        <meta name="description" content={t("services.hero.title")} />
      </Helmet>

      {/* Hero Section */}
      <section className="relative pt-24 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-3xl mx-auto text-center space-y-6"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-accent">
              <Sparkles className="h-3 w-3" />
              {t("services.hero.subtitle")}
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-xl md:text-2xl lg:text-3xl font-black uppercase tracking-tight leading-[1.2] text-foreground">
              {t("services.hero.title")}
            </motion.h1>

            <motion.p variants={itemVariants} className="text-base font-black italic text-muted-foreground uppercase tracking-tight max-w-xl mx-auto">
              "{t("services.hero.positioning")}"
            </motion.p>
            
            <motion.div variants={itemVariants} className="pt-2">
              <Link to="/contact?intent=quote" className="btn-pill-primary">
                {t("services.cta.start")}
                <ArrowRight className="ml-2 h-4 w-4 inline-block" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 3 Offers Section */}
      <section className="py-16 bg-card-soft/30">
        <div className="container mx-auto px-4">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="space-y-12"
          >
            <div className="text-center space-y-2">
              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-foreground">
                {t("services.offers.title")}
              </h2>
              <div className="h-1 w-12 bg-accent mx-auto rounded-full" />
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {offers.map((offer) => (
                <motion.div 
                  key={offer.id}
                  variants={itemVariants}
                  whileHover={{ y: -4 }}
                  className="card-dark-wise p-6 space-y-6 flex flex-col h-full group"
                >
                  <div className={`h-12 w-12 flex items-center justify-center rounded-2xl bg-${offer.color}-500/10 text-${offer.color}-400 group-hover:scale-110 transition-transform duration-500`}>
                    <offer.icon className="h-6 w-6" />
                  </div>
                  
                  <div className="space-y-3 flex-1">
                    <h3 className="text-xl font-black uppercase tracking-tight text-foreground">
                      {offer.title}
                    </h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-accent/80">
                      {offer.desc}
                    </p>
                    <ul className="space-y-2 pt-2 border-t border-border/50">
                      {offer.items.map((item) => (
                        <li key={item} className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors">
                          <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                          <span className="text-xs font-medium">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Core Offer (Proposal) Section */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-1/3 h-full bg-accent/5 blur-[120px] rounded-full translate-x-1/2 -z-10" />
        <div className="container mx-auto px-4">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="max-w-5xl mx-auto"
          >
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div variants={itemVariants} className="space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-0.5 text-[10px] font-black uppercase tracking-widest text-accent">
                  {t("services.proposal.badge")}
                </div>
                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-foreground leading-[1.0]">
                  {t("services.proposal.title")}
                </h2>
                <p className="text-base text-muted-foreground leading-relaxed max-w-sm font-normal">
                  {t("services.proposal.overview")}
                </p>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  {[
                    { icon: Globe, title: t("services.proposal.features.website"), color: "blue" },
                    { icon: Smartphone, title: t("services.proposal.features.mobile"), color: "purple" },
                    { icon: Layers, title: t("services.proposal.features.backend"), color: "emerald" },
                    { icon: Zap, title: t("services.proposal.features.automation"), color: "yellow" },
                  ].map((feat) => (
                    <div key={feat.title} className="flex items-center gap-3 group">
                      <div className={`h-8 w-8 flex items-center justify-center rounded-lg bg-${feat.color}-400/10 text-${feat.color}-400 group-hover:bg-${feat.color}-400 group-hover:text-black transition-all duration-300`}>
                        <feat.icon className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-black uppercase tracking-wide text-foreground">{feat.title}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-6 flex flex-wrap gap-3">
                  <Link to="/contact?intent=quote" className="btn-pill-primary text-xs py-2.5 px-6">
                    {t("services.cta.quote")}
                  </Link>
                  <Link to="/about" className="btn-pill-ghost text-xs py-2.5 px-6">
                    {t("nav.about")}
                  </Link>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="relative">
                <div className="card-dark-wise p-6 md:p-8 space-y-8 border-accent/20 bg-accent/5 backdrop-blur-xl relative z-10">
                  <div className="space-y-4">
                    <h3 className="text-lg font-black uppercase text-foreground inline-flex items-center gap-2">
                       <Zap className="h-4 w-4 text-accent" />
                       {t("services.proposal.why_matters")}
                    </h3>

                    <div className="p-3 rounded-xl bg-accent/5 border border-accent/10">
                      <p className="text-[11px] font-black uppercase tracking-wide text-accent text-center">
                        {t("services.proposal.revenue_driver")}
                      </p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t border-border">
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {t("services.proposal.timeline_label")}
                      </h4>
                      <p className="text-xs font-bold text-foreground uppercase">{t("services.proposal.timeline.basic")}</p>
                      <p className="text-xs font-bold text-foreground uppercase mb-1">{t("services.proposal.timeline.full")}</p>
                      <p className="text-[10px] font-black italic tracking-tight text-accent/70 leading-none">
                        {t("services.proposal.timeline.note")}
                      </p>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3" />
                        {t("services.proposal.process_label")}
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {(t("services.proposal.process.items", { returnObjects: true }) as string[]).map(s => (
                          <span key={s} className="px-1.5 py-0.5 rounded-lg bg-background border border-border text-[9px] font-black uppercase">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Decorative Elements */}
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-accent/20 rounded-full blur-[40px] -z-10" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-16 bg-card-soft/30 relative">
        <div className="container mx-auto px-4">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="space-y-10"
          >
            <div className="text-center">
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-foreground">
                {t("services.use_cases.title")}
              </h2>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4">
              {useCases.map((uc) => (
                <motion.div 
                  key={uc.title}
                  variants={itemVariants}
                  className="px-6 py-4 rounded-xl border border-border bg-background flex items-center gap-3 group hover:border-accent/50 hover:bg-accent/5 transition-all duration-300"
                >
                  <uc.icon className="h-5 w-5 text-accent group-hover:scale-125 transition-transform" />
                  <span className="text-xs font-black uppercase tracking-wide text-foreground">{uc.title}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-accent/5 -z-10" />
        <div className="container mx-auto px-4">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="max-w-3xl mx-auto rounded-[2rem] border border-accent/20 bg-background/50 backdrop-blur-xl p-8 md:p-12 text-center space-y-8 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent opacity-50" />
            
            <motion.div variants={itemVariants} className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-foreground leading-none">
                {t("services.cta.title").split(" ").map((word, i) => i === 3 ? <><br />{word} </> : word + " ")}
              </h2>
              <p className="text-base text-muted-foreground max-w-md mx-auto font-normal">
                {t("services.cta.subtitle")}
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="flex justify-center">
               <Link to="/contact?intent=quote" className="btn-pill-primary px-8">
                 {t("services.cta.quote")}
               </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
