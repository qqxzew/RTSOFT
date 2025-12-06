import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/GlassCard';
import { GradientButton } from '../components/GradientButton';

export const GoogleLogin = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    setTimeout(() => {
      navigate('/onboarding');
    }, 800);
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100" />
      
      <motion.div
        className="absolute inset-0"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(0, 255, 156, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(0, 255, 156, 0.05) 0%, transparent 50%)',
          backgroundSize: '200% 200%',
        }}
      />

      <div className="absolute top-20 right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" 
           style={{ animationDelay: '2s' }} />

      <div className="relative z-10 w-full max-w-md px-8">
        <GlassCard className="p-12" hover={false}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-8"
          >
            <div className="inline-block">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 
                            flex items-center justify-center mb-6 mx-auto">
                <svg className="w-10 h-10 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Přihlášení
              </h2>
              <p className="text-gray-600">
                Pokračujte pomocí vašeho Google účtu
              </p>
            </div>

            <GradientButton onClick={handleLogin} className="w-full">
              <div className="flex items-center justify-center gap-3">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Pokračovat přes Google
              </div>
            </GradientButton>

            <p className="text-sm text-gray-500">
              Toto je demo verze bez skutečného přihlášení
            </p>
          </motion.div>
        </GlassCard>
      </div>
    </div>
  );
};
