import React from "react";
import { BarChart3, Users, ArrowRight, Shield, Rocket, Clock, TrendingUp, Award, FileText, Target, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  const features = [
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Advanced Analytics",
      description: "Powerful dashboards with real-time KPIs, predictive analytics, and customizable reports to track workforce performance and trends.",
      color: "from-blue-600 to-cyan-600"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Employee Management",
      description: "Complete employee lifecycle management from onboarding to offboarding with centralized records and compliance tracking.",
      color: "from-emerald-600 to-teal-600"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Time & Attendance",
      description: "Automated time tracking, shift scheduling, and attendance monitoring with integration to payroll systems.",
      color: "from-violet-600 to-purple-600"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Performance Reviews",
      description: "360-degree feedback system, goal tracking, and continuous performance evaluation to drive employee development.",
      color: "from-orange-600 to-amber-600"
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Leave Management",
      description: "Streamlined leave requests, approvals, and balance tracking with policy automation and calendar integration.",
      color: "from-pink-600 to-rose-600"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Compliance & Security",
      description: "Enterprise-grade security with SSO, RBAC, audit trails, and compliance with GDPR, SOC 2, and industry standards.",
      color: "from-indigo-600 to-blue-600"
    }
  ];

  const benefits = [
    {
      icon: <Target className="w-5 h-5" />,
      title: "Increase Productivity",
      description: "Automate repetitive HR tasks and reduce administrative overhead by up to 60%"
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Faster Decision Making",
      description: "Access real-time insights and reports to make informed strategic decisions quickly"
    },
    {
      icon: <Award className="w-5 h-5" />,
      title: "Improve Retention",
      description: "Identify at-risk employees early and implement targeted retention strategies"
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Better Employee Experience",
      description: "Self-service portals and mobile access empower employees to manage their own data"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 flex justify-between items-center px-6 lg:px-12 py-4 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-slate-800 to-slate-600 rounded-lg flex items-center justify-center shadow-md">
            <BarChart3 className="text-white w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            HiveHR
          </h1>
        </div>
        <button
          onClick={handleLoginRedirect}
          className="group bg-slate-800 hover:bg-slate-900 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          Login with SSO
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </header>

      {/* Hero Section */}
      <main className="flex-grow">
        <section className="px-6 lg:px-12 py-16 lg:py-24 bg-gradient-to-b from-slate-50 to-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-full text-sm font-medium border border-slate-200">
                    <Rocket className="w-4 h-4 text-slate-600" />
                    Enterprise HR Management Platform
                  </div>
                  <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-slate-900">
                    Transform Your HR Operations with{" "}
                    <span className="text-slate-700">Intelligence</span>
                  </h1>
                  <p className="text-xl text-slate-600 leading-relaxed">
                    HiveHR is a comprehensive human resource management system that combines powerful analytics,
                    streamlined workflows, and intelligent automation to help organizations manage their most
                    valuable asset — their people.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleLoginRedirect}
                    className="group bg-slate-800 hover:bg-slate-900 text-white px-8 py-4 rounded-lg font-semibold flex items-center justify-center gap-3 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Get Started
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button className="border-2 border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-900 px-8 py-4 rounded-lg font-semibold transition-all duration-200 hover:bg-slate-50">
                    Schedule Demo
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-200">
                  <div>
                    <div className="text-3xl font-bold text-slate-800">99.9%</div>
                    <div className="text-sm text-slate-500 mt-1">Uptime SLA</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-slate-800">10K+</div>
                    <div className="text-sm text-slate-500 mt-1">Active Users</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-slate-800">24/7</div>
                    <div className="text-sm text-slate-500 mt-1">Support</div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 shadow-xl">
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-slate-100 rounded-lg">
                          <BarChart3 className="w-6 h-6 text-slate-700" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-slate-800 mb-2">Real-time Dashboards</h3>
                          <p className="text-slate-600 text-sm leading-relaxed">
                            Monitor key metrics, track department performance, and identify trends with interactive visualizations.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-slate-100 rounded-lg">
                          <Users className="w-6 h-6 text-slate-700" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-slate-800 mb-2">Unified Employee Records</h3>
                          <p className="text-slate-600 text-sm leading-relaxed">
                            Centralized database with complete employee information, documents, and history in one secure location.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-slate-100 rounded-lg">
                          <Shield className="w-6 h-6 text-slate-700" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-slate-800 mb-2">Enterprise Security</h3>
                          <p className="text-slate-600 text-sm leading-relaxed">
                            SOC 2 compliant with end-to-end encryption, SSO integration, and comprehensive audit logging.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="px-6 lg:px-12 py-20 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">Comprehensive HR Solutions</h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Everything you need to manage, engage, and grow your workforce in one integrated platform
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group p-8 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300"
                >
                  <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${feature.color} text-white mb-4 shadow-md`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="px-6 lg:px-12 py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">Why Choose HiveHR?</h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Measurable improvements in efficiency, engagement, and strategic HR outcomes
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex p-4 rounded-full bg-white border-2 border-slate-200 mb-4 shadow-sm">
                    <div className="text-slate-700">
                      {benefit.icon}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{benefit.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 lg:px-12 py-20 bg-gradient-to-br from-slate-800 to-slate-900">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Your HR Operations?
            </h2>
            <p className="text-xl text-slate-300 mb-10 leading-relaxed">
              Join thousands of organizations worldwide who trust HiveHR to manage their workforce efficiently and effectively.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleLoginRedirect}
                className="group bg-white hover:bg-slate-100 text-slate-900 px-8 py-4 rounded-lg font-semibold flex items-center justify-center gap-3 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="border-2 border-white hover:bg-white/10 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-200">
                Contact Sales
              </button>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="px-6 lg:px-12 py-16 bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto">
            <p className="text-center text-slate-500 text-sm font-medium uppercase tracking-wider mb-10">
              Trusted by Leading Organizations
            </p>
            <div className="flex flex-wrap justify-center items-center gap-12 lg:gap-16">
              <div className="text-2xl font-bold text-slate-300">AUTOPARTS</div>
              <div className="text-2xl font-bold text-slate-300">MANUFACTURING</div>
              <div className="text-2xl font-bold text-slate-300">TECHNOLOGY</div>
              <div className="text-2xl font-bold text-slate-300">RETAIL</div>
              <div className="text-2xl font-bold text-slate-300">HEALTHCARE</div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="text-white w-5 h-5" />
                </div>
                <div className="text-2xl font-bold">HiveHR</div>
              </div>
              <p className="text-slate-400 leading-relaxed max-w-md">
                Empowering organizations with intelligent HR management solutions that drive business growth and employee success.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 text-center text-slate-400 text-sm">
            © {new Date().getFullYear()} hivehr Auto Parts Ltd. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;