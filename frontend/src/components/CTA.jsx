import { motion } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

export default function CTA() {
  const navigate = useNavigate();

  return (
    <section className="bg-dark-bg py-24 sm:py-32 relative overflow-hidden border-t border-white/5">
      {/* Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[1000px] h-[500px] bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 rounded-full blur-[100px] opacity-50 pointer-events-none mix-blend-screen"></div>
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)] pointer-events-none"></div>

      <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-8 relative z-10">
        <motion.div 
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-10 md:p-20 text-center shadow-2xl relative overflow-hidden"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Inner Glows */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-secondary"></div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-secondary/30 blur-[80px] rounded-full"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/30 blur-[80px] rounded-full"></div>
          
          <div className="max-w-3xl mx-auto relative z-10">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 font-display tracking-tight leading-tight">
              Ready to land your <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">dream job?</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-400 font-light mb-10 max-w-2xl mx-auto leading-relaxed">
              Join thousands of professionals who have already upgraded their resumes. Get your free AI-powered ATS score in seconds.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button 
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto rounded-xl bg-white text-dark-bg px-10 py-5 font-bold text-lg hover:shadow-glow-primary transition-all duration-300 flex items-center justify-center gap-2 group"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Get Started For Free
                <ArrowRightIcon className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </div>
            <p className="mt-6 text-sm text-gray-500 font-medium">
              No credit card required. Cancel anytime.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
