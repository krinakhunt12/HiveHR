import { Card, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/shared/utils/cn";

export const FeatureCard = ({ icon, title, description }: any) => (
  <Card className="hover:border-primary/30 transition-all duration-300 shadow-none border-border group bg-surface">
    <CardContent className="p-10">
      <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-textPrimary mb-3 tracking-tight transition-colors group-hover:text-primary font-display">{title}</h3>
      <p className="text-sm text-textSecondary leading-relaxed font-medium">{description}</p>
    </CardContent>
  </Card>
);

export const Testimonial = ({ quote, author, role }: any) => (
  <div className="relative p-8 rounded-3xl bg-surface border border-border/50 shadow-sm">
    <p className="text-lg font-medium italic text-textSecondary leading-relaxed mb-8">"{quote}"</p>
    <div>
      <p className="text-sm font-bold text-textPrimary font-display">{author}</p>
      <p className="text-xs text-textSecondary font-bold uppercase tracking-widest mt-1">{role}</p>
    </div>
  </div>
);

export const PricingCard = ({ name, price, desc, features, featured = false }: any) => (
  <Card className={cn(
    "relative transition-all duration-500 shadow-none overflow-hidden bg-surface",
    featured ? "border-primary scale-105 z-10" : "border-border hover:border-primary/30"
  )}>
    {featured && (
      <div className="absolute top-0 right-0 bg-primary text-surface text-xs font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-bl-xl shadow-lg">Most Popular</div>
    )}
    <CardContent className="p-10">
      <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-textSecondary mb-2">{name}</h3>
      <div className="flex items-baseline gap-1 mb-8">
        <span className="text-4xl font-bold tracking-tight text-textPrimary font-display">{price === 'Custom' ? '' : '$'}{price}</span>
        {price !== 'Custom' && <span className="text-textSecondary text-xs font-bold uppercase tracking-widest ml-1">/mo</span>}
      </div>
      <p className="text-sm text-textSecondary font-medium mb-10 leading-relaxed">{desc}</p>
      <ul className="space-y-5 mb-12">
        {features.map((f: string) => (
          <li key={f} className="flex items-center gap-4 text-sm font-bold text-textPrimary/80">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Button className={cn(
        "w-full h-14 font-bold text-xs uppercase tracking-[0.2em] rounded-xl shadow-lg transition-all active:scale-95",
        featured ? "bg-primary text-surface hover:bg-primary/90" : "bg-textPrimary text-surface hover:bg-textPrimary/90 shadow-black/10"
      )}>
        {name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
      </Button>
    </CardContent>
  </Card>
);
