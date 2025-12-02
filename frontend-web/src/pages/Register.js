import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    university: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const users = await userAPI.getAll();
      if (users.some(u => u.email === formData.email)) {
        setError('Email already registered');
        setLoading(false);
        return;
      }

      const newUser = await userAPI.create({
        ...formData,
        passwordHash: formData.password,
      });

      login(newUser);
      navigate('/profile');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
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
      
      {/* Split Screen Layout */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex flex-col justify-center items-center glass-card">
          <div className="w-32 h-32 rounded-3xl bg-gradient-primary flex items-center justify-center text-white text-6xl font-bold shadow-glass-xl mb-8 animate-float">
            🎓
          </div>
          <h1 className="text-5xl font-bold text-glass-text-primary mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Join SkillSwap
          </h1>
          <p className="text-glass-text-secondary text-xl text-center">
            Start exchanging skills with students and faculty
          </p>
        </div>

        {/* Right Side - Registration Form */}
        <div className="glass-card flex flex-col justify-center">
          <div className="lg:hidden text-center mb-8">
            <div className="w-20 h-20 rounded-3xl bg-gradient-primary flex items-center justify-center text-white text-4xl font-bold shadow-glass-xl mb-6 mx-auto animate-float">
              🎓
            </div>
            <h1 className="text-4xl font-bold text-glass-text-primary mb-3 bg-gradient-primary bg-clip-text text-transparent">
              Create Account
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-glass-accent-danger/20 border border-glass-accent-danger text-glass-accent-danger px-5 py-4 rounded-2xl text-sm backdrop-blur-sm shadow-glass">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-semibold text-glass-text-secondary mb-3">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  className="input"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First name"
                  required
                  autoComplete="given-name"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-semibold text-glass-text-secondary mb-3">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  className="input"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last name"
                  required
                  autoComplete="family-name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-glass-text-secondary mb-3">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="input"
                value={formData.email}
                onChange={handleChange}
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
                name="password"
                className="input"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                required
                autoComplete="new-password"
                minLength={6}
              />
            </div>

            <div>
              <label htmlFor="university" className="block text-sm font-semibold text-glass-text-secondary mb-3">
                University
              </label>
              <input
                type="text"
                id="university"
                name="university"
                className="input"
                value={formData.university}
                onChange={handleChange}
                placeholder="Your university"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full text-lg"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-glass-text-secondary">
              Already have an account?{' '}
              <Link to="/login" className="text-glass-accent-primary hover:text-glass-accent-secondary font-semibold transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
