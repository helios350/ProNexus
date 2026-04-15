import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { loginData } from '../data/mockData';
import { useAuth } from '../hooks/useAuth';
import { useAuthContext } from '../contexts/AuthContext';
import { Network, Eye, EyeOff } from 'lucide-react';

export interface ReadonlyLoginFormProps {}

export const LoginForm: React.FC<ReadonlyLoginFormProps> = () => {
  const { email, setEmail, password, setPassword, loading, error, handleLogin } = useAuth();
  const { user, profile, loading: authLoading } = useAuthContext();
  const [showPassword, setShowPassword] = useState(false);
  const tx = loginData.loginText;

  // If already logged in, redirect to the correct dashboard
  if (!authLoading && user && profile) {
    return <Navigate to={`/${profile.role}`} replace />;
  }

  return (
    <div className="w-full max-w-[400px] bg-surface-container-lowest border border-outline-variant/20 rounded-md ghost-shadow p-8 flex flex-col items-center z-10">
      {/* Brand Identity */}
      <div className="flex items-center gap-1 mb-6">
        <div className="w-8 h-8 rounded-md bg-primary-container flex items-center justify-center text-on-primary-container">
          <Network size={20} />
        </div>
      </div>
      
      <div className="text-center mb-8">
        <h1 className="text-[1.5rem] font-semibold text-on-surface tracking-tight leading-tight mb-2">
          {tx.title}
        </h1>
        <p className="text-on-surface-variant text-[13px] leading-relaxed">
          {tx.subtitle}
        </p>
      </div>

      {error && (
        <div className="w-full bg-error-container text-on-error-container p-3 rounded-md mb-4 text-sm font-medium text-center">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleLogin} className="w-full space-y-4">
        <div className="space-y-1.5 text-left w-full">
          <label className="text-[11px] font-mono uppercase tracking-widest text-on-surface-variant" htmlFor="email">
            {tx.emailLabel}
          </label>
          <input 
            className="w-full h-10 px-3 bg-surface-container-highest border border-transparent rounded-sm text-[13px] font-mono text-on-surface placeholder:text-outline/50 input-focus-ring transition-all" 
            id="email" 
            placeholder="name@institution.edu" 
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-1.5 text-left w-full">
          <div className="flex justify-between items-center">
            <label className="text-[11px] font-mono uppercase tracking-widest text-on-surface-variant" htmlFor="password">
              {tx.passwordLabel}
            </label>
            <a className="text-[11px] font-medium text-secondary hover:underline" href="#">
              {tx.forgotPassword}
            </a>
          </div>
          <div className="relative">
            <input 
              className="w-full h-10 pl-3 pr-10 bg-surface-container-highest border border-transparent rounded-sm text-[13px] font-mono text-on-surface placeholder:text-outline/50 input-focus-ring transition-all" 
              id="password" 
              placeholder="••••••••" 
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-on-surface transition-colors"
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        
        <button 
          disabled={loading}
          className="w-full h-10 primary-gradient text-on-primary font-medium text-sm rounded-md active:scale-95 duration-150 transition-transform mt-2 disabled:opacity-50" 
          type="submit"
        >
          {loading ? "Signing in…" : tx.signInBtn}
        </button>
      </form>
      
      <div className="mt-8 text-center">
        <p className="text-[12px] text-on-surface-variant leading-snug max-w-[280px]">
          {tx.newToProNexus} <br/>
          <span className="font-medium text-on-surface">{tx.contactCoordinator}</span>
        </p>
      </div>
    </div>
  );
};
