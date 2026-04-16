import { Card, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/shared/utils/cn";

export const FeatureCard = ({ icon, title, description }: any) => (
  <Card className="hover:border-slate-200 transition-all duration-300 shadow-none border-slate-100/60 group">
    <CardContent className="p-8">
      <div className="w-10 h-10 bg-[var(--color-primary)] rounded-lg flex items-center justify-center mb-6 shadow-sm shadow-indigo-100 group-hover:scale-110 transition-transform duration-500">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-[var(--color-text-main)] mb-2 tracking-tight transition-colors group-hover:text-[var(--color-primary)]">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed font-medium">{description}</p>
    </CardContent>
  </Card>
);

export const Testimonial = ({ quote, author, role }: any) => (
  <div className="relative">
    <p className="text-lg font-medium italic text-slate-500 leading-relaxed mb-6">"{quote}"</p>
    <div>
      <p className="text-sm font-semibold text-[var(--color-text-main)]">{author}</p>
      <p className="text-sm text-slate-400 font-medium">{role}</p>
    </div>
  </div>
);

export const PricingCard = ({ name, price, desc, features, featured = false }: any) => (
  <Card className={cn(
    "relative transition-all duration-300 shadow-none overflow-hidden",
    featured ? "border-indigo-600 scale-105 z-10 shadow-xl shadow-indigo-100/50" : "border-slate-100 hover:border-slate-200"
  )}>
    {featured && (
      <div className="absolute top-0 right-0 bg-indigo-600 text-white text-sm font-black uppercase tracking-widest px-4 py-1 rounded-bl-lg">Most Popular</div>
    )}
    <CardContent className="p-8">
      <h3 className="text-lg font-semibold text-[var(--color-text-main)] mb-2 tracking-tight">{name}</h3>
      <div className="flex items-baseline gap-1 mb-6">
        <span className="text-3xl font-bold tracking-tight">{price === 'Custom' ? '' : '$'}{price}</span>
        {price !== 'Custom' && <span className="text-slate-400 text-sm font-medium">/mo</span>}
      </div>
      <p className="text-sm text-slate-500 font-medium mb-8 leading-relaxed">{desc}</p>
      <ul className="space-y-4 mb-10">
        {features.map((f: string) => (
          <li key={f} className="flex items-center gap-3 text-sm font-medium text-slate-600">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Button className={cn("w-full h-11 font-semibold", featured ? "bg-indigo-600 hover:bg-indigo-700" : "bg-slate-900 hover:bg-slate-800 text-white")}>
        {name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
      </Button>
    </CardContent>
  </Card>
);
