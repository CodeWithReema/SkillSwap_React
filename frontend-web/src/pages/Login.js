import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const users = await userAPI.getAll();
      const user = users.find(u => u.email === email);

      if (!user) {
        setError('Invalid email or password');
        setLoading(false);
        return;
      }

      login(user);
      navigate('/discover');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-glass-accent-primary rounded-full mix-blend-screen opacity-20 blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-glass-accent-secondary rounded-full mix-blend-screen opacity-20 blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>
      
      {/* Split Screen Layout - Completely Different */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex flex-col justify-center items-center glass-card">
          <div className="w-32 h-32 rounded-3xl bg-gradient-primary flex items-center justify-center text-white text-6xl font-bold shadow-glass-xl mb-8 animate-float">
            🎓
          </div>
          <h1 className="text-5xl font-bold text-glass-text-primary mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-glass-text-secondary text-xl text-center">
            Sign in to continue your skill exchange journey
          </p>
        </div>

        {/* Right Side - Login Form */}
        <div className="glass-card flex flex-col justify-center">
          <div className="lg:hidden text-center mb-8">
            <div className="w-20 h-20 rounded-3xl bg-gradient-primary flex items-center justify-center text-white text-4xl font-bold shadow-glass-xl mb-6 mx-auto animate-float">
              🎓
            </div>
            <h1 className="text-4xl font-bold text-glass-text-primary mb-3 bg-gradient-primary bg-clip-text text-transparent">
              Welcome Back
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-glass-accent-danger/20 border border-glass-accent-danger text-glass-accent-danger px-5 py-4 rounded-2xl text-sm backdrop-blur-sm shadow-glass">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-glass-text-secondary mb-3">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-glass-text-secondary mb-3">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full text-lg"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-glass-text-secondary">
              Don't have an account?{' '}
              <Link to="/register" className="text-glass-accent-primary hover:text-glass-accent-secondary font-semibold transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
