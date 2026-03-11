import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Activity, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  const stats = [
    { icon: <Activity className="w-8 h-8 text-white" />, title: "Total Reports", value: "85,240+", desc: "Issues Registered This Month", color: "bg-brand-dark" },
    { icon: <ShieldCheck className="w-8 h-8 text-brand-light" />, title: "Resolved Issues", value: "72,105+", desc: "Efficiently Addressed", color: "bg-brand-dark" },
    { icon: <AlertTriangle className="w-8 h-8 text-red-400" />, title: "Active Risks", value: "135", desc: "Urgent Situations", color: "bg-brand-dark" }
  ];

  const challenges = [
    { title: "Potholes & Road Damage", desc: "Identify and track road infrastructure repairs for safer commutes.", icon: "🛣️" },
    { title: "Waterlogging & Drainage", desc: "Report blockages to prevent flooding and ensure efficient water management.", icon: "🌊" },
    { title: "Waste Management Issues", desc: "Streamline waste collection and improve city cleanliness.", icon: "🗑️" },
    { title: "Street Lighting & Safety", desc: "Ensure well-lit streets and public areas for enhanced security.", icon: "💡" }
  ];

  return (
    <div className="flex-grow flex flex-col pt-16">
      
      {/* Hero Section */}
      <section className="relative bg-brand-dark text-white shadow-2xl overflow-hidden min-h-[500px] flex flex-col justify-center rounded-b-3xl mx-4 sm:mx-6 lg:mx-8 mt-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_90%,#C6F9F1_0%,#8EF6E4_40%,#0B1A30_60%,#0B1A30_100%)] opacity-80 mix-blend-overlay"></div>
        <div className="relative z-10 px-8 py-16 md:py-24 max-w-3xl flex-grow flex flex-col justify-center">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-white"
          >
            UrbanPulse: Empowering Indian Cities. Shaping a Smarter Future.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-slate-300 font-medium text-lg md:text-xl mb-10 max-w-lg leading-relaxed"
          >
            Connect with your municipal authorities, report civic issues, and monitor real-time city data for a better urban life.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap gap-4"
          >
            <Link to="/report" className="flex items-center bg-brand-light text-brand-dark px-6 py-3 rounded-full font-semibold hover:bg-teal-300 transition-colors shadow-lg">
              Report Civic Issue <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link to="/map" className="flex items-center bg-brand-dark border border-brand-light text-white px-6 py-3 rounded-full font-semibold hover:bg-brand-dark/80 transition-colors backdrop-blur-sm">
              View City Dashboard
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Quick Statistics Section */}
      <section className="px-4 sm:px-6 lg:px-8 mt-[-4rem] relative z-20">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-xl border border-slate-100"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats.map((stat, idx) => (
                <div key={idx} className="flex items-center p-4 border-2 border-brand-accent rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className={`${stat.color} p-3 rounded-lg mr-4`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{stat.title}</p>
                    <h3 className="text-2xl font-extrabold text-slate-900">{stat.value}</h3>
                    <p className="text-xs text-slate-600">{stat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Common Urban Challenges */}
      <section className="bg-slate-50 py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Common Urban Challenges We Tackle</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Our smart city platform helps municipalities efficiently manage and resolve critical infrastructure issues affecting daily life.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {challenges.map((challenge, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -5 }}
                className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center hover:shadow-lg transition-all duration-300"
              >
                <div className="text-5xl mb-6">{challenge.icon}</div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">{challenge.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{challenge.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-dark text-slate-400 py-8 text-sm mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex gap-6">
            <a href="#" className="hover:text-brand-light transition-colors">About Us</a>
            <a href="#" className="hover:text-brand-light transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-brand-light transition-colors">Terms of Service</a>
          </div>
          <div className="text-center text-xs">
            © 2026 UrbanPulse. Empowering Indian Cities.
          </div>
        </div>
      </footer>
    </div>
  );
}
