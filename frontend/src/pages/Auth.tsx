import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { apiService } from '../utils/api';

export const Auth = () => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setError('Přihlášení se nezdařilo');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      if (isSignUp) {
        await apiService.signUpWithGoogle(credentialResponse.credential);
      } else {
        await apiService.signInWithGoogle(credentialResponse.credential);
      }
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/ai-onboarding');
    } catch (err) {
      setError(err instanceof Error ? err.message : isSignUp ? 'Registrace se nezdařila' : 'Přihlášení se nezdařilo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Přihlášení přes Google se nezdařilo');
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-[#86BC25]/10">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-[#86BC25]/20 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-black/10 to-transparent rounded-full blur-3xl"
        />
      </div>

      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-[#86BC25]/30 rounded-full"
          animate={{
            y: [0, -100, 0],
            x: [0, Math.random() * 100 - 50, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 5,
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Logo/Title */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 mb-4 bg-gradient-to-br from-[#86BC25] to-[#6a9c1d] rounded-3xl shadow-2xl">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-black to-gray-700 bg-clip-text text-transparent mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {isSignUp ? 'Vytvořit účet' : 'Vítejte zpět!'}
            </h1>
            <p className="text-gray-600 font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {isSignUp ? 'Zaregistrujte se pomocí Google účtu' : 'Přihlaste se pomocí Google účtu'}
            </p>
          </motion.div>

          {/* Auth Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="relative group"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#86BC25]/40 to-black/20 rounded-3xl blur-2xl opacity-50 group-hover:opacity-70 transition-opacity duration-500" />

            {/* Glass card */}
            <div className="relative bg-white/80 backdrop-blur-2xl border-2 border-gray-200/50 rounded-3xl p-8 shadow-2xl">
              <div className="space-y-6">
                {/* Error message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-3 bg-red-50 border border-red-200 rounded-xl"
                    >
                      <p className="text-sm font-medium text-red-600 text-center" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        {error}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Google Sign In Button */}
                <div className="flex justify-center">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="w-8 h-8 border-4 border-[#86BC25]/30 border-t-[#86BC25] rounded-full animate-spin" />
                    </div>
                  ) : (
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                      useOneTap
                      theme="outline"
                      size="large"
                      text="signin_with"
                      shape="rectangular"
                      logo_alignment="left"
                    />
                  )}
                </div>

                {/* Info text */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-4 p-4 bg-gray-50/50 border border-gray-200 rounded-xl"
                >
                  <p className="text-xs text-gray-500 text-center font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    🔒 Bezpečné {isSignUp ? 'registrace' : 'přihlášení'} přes Google
                  </p>
                </motion.div>
              </div>

              {/* Toggle Sign In / Sign Up */}
              <div className="mt-6 text-center">
                <p className="text-gray-600 font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {isSignUp ? 'Již máte účet?' : 'Nemáte účet?'}
                  <button
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setError('');
                    }}
                    className="ml-2 text-[#86BC25] hover:text-[#6a9c1d] font-bold transition-colors"
                  >
                    {isSignUp ? 'Přihlaste se' : 'Zaregistrujte se'}
                  </button>
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
