import MarketingLayout from '@/shared/layouts/MarketingLayout';
import { Button } from '@/shared/ui/button';

const Contact = () => {
  return (
    <MarketingLayout>
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="rounded-[40px] bg-indigo-600 p-12 lg:p-24 text-white relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mb-48 -mr-48"></div>
            <div className="relative z-10 flex flex-col lg:flex-row gap-16 items-center">
              <div className="lg:w-1/2 text-center lg:text-left">
                <h2 className="text-3xl lg:text-5xl font-semibold mb-6 tracking-tight">Let's talk about your culture.</h2>
                <p className="text-indigo-100 text-lg font-medium mb-10">Our consultants are ready to help you architect your organizational infrastructure.</p>
                <div className="space-y-6">
                  <div className="flex items-center gap-4 justify-center lg:justify-start">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                      <span className="text-sm">📍</span>
                    </div>
                    <span className="text-sm font-medium">San Francisco, CA & London, UK</span>
                  </div>
                  <div className="flex items-center gap-4 justify-center lg:justify-start">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                      <span className="text-sm">✉️</span>
                    </div>
                    <span className="text-sm font-medium">hello@hivehr.io</span>
                  </div>
                </div>
              </div>
              <div className="lg:w-1/2 w-full max-w-md">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                  <form className="space-y-4">
                    <div>
                      <label className="text-sm font-bold  text-indigo-200 mb-2 block">Full Name</label>
                      <input type="text" placeholder="Sarah Jenkins" className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 placeholder:text-indigo-300/50 focus:outline-none focus:ring-2 focus:ring-white/30" />
                    </div>
                    <div>
                      <label className="text-sm font-bold  text-indigo-200 mb-2 block">Company Email</label>
                      <input type="email" placeholder="name@company.com" className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 placeholder:text-indigo-300/50 focus:outline-none focus:ring-2 focus:ring-white/30" />
                    </div>
                    <div>
                      <label className="text-sm font-bold  text-indigo-200 mb-2 block">Message</label>
                      <textarea rows={4} placeholder="How can we help?" className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 placeholder:text-indigo-300/50 focus:outline-none focus:ring-2 focus:ring-white/30 resize-none"></textarea>
                    </div>
                    <Button className="w-full h-12 bg-white text-indigo-600 hover:bg-indigo-50 font-bold">Send Message</Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
};

export default Contact;
