import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, User, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import './Login.css';

interface LoginFormData {
  email: string;
  password: string;
}

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'admin' | 'manager' | 'operator';
}

export default function Login() {
  const { login, register: authRegister, isLoading, error } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginFormData>();

  const {
    register: registerRegister,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
    watch,
  } = useForm<RegisterFormData>();

  const watchPassword = watch('password');

  const onLoginSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormData) => {
    try {
      await authRegister(data);
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="background-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>

      <div className="login-card">
        <div className="login-header">
          <div className="logo">
            <Zap size={32} color="#667eea" />
            <h1>AI Inventory Platform</h1>
          </div>
          <p className="subtitle">
            {isLoginMode 
              ? 'Welcome back! Sign in to your account' 
              : 'Create your account to get started'
            }
          </p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {isLoginMode ? (
          <form onSubmit={handleLoginSubmit(onLoginSubmit)} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <Mail size={20} className="input-icon" />
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  {...registerLogin('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  className={loginErrors.email ? 'error' : ''}
                />
              </div>
              {loginErrors.email && (
                <span className="error-text">{loginErrors.email.message}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <Lock size={20} className="input-icon" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  {...registerLogin('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  className={loginErrors.password ? 'error' : ''}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {loginErrors.password && (
                <span className="error-text">{loginErrors.password.message}</span>
              )}
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit(onRegisterSubmit)} className="login-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <div className="input-wrapper">
                <User size={20} className="input-icon" />
                <input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  {...registerRegister('name', {
                    required: 'Name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must be at least 2 characters',
                    },
                  })}
                  className={registerErrors.name ? 'error' : ''}
                />
              </div>
              {registerErrors.name && (
                <span className="error-text">{registerErrors.name.message}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="register-email">Email Address</label>
              <div className="input-wrapper">
                <Mail size={20} className="input-icon" />
                <input
                  id="register-email"
                  type="email"
                  placeholder="Enter your email"
                  {...registerRegister('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  className={registerErrors.email ? 'error' : ''}
                />
              </div>
              {registerErrors.email && (
                <span className="error-text">{registerErrors.email.message}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="role">Role</label>
              <div className="input-wrapper">
                <select
                  id="role"
                  {...registerRegister('role', {
                    required: 'Role is required',
                  })}
                  className={registerErrors.role ? 'error' : ''}
                >
                  <option value="">Select your role</option>
                  <option value="admin">Administrator</option>
                  <option value="manager">Manager</option>
                  <option value="operator">Operator</option>
                </select>
              </div>
              {registerErrors.role && (
                <span className="error-text">{registerErrors.role.message}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="register-password">Password</label>
              <div className="input-wrapper">
                <Lock size={20} className="input-icon" />
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  {...registerRegister('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  className={registerErrors.password ? 'error' : ''}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {registerErrors.password && (
                <span className="error-text">{registerErrors.password.message}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password">Confirm Password</label>
              <div className="input-wrapper">
                <Lock size={20} className="input-icon" />
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  {...registerRegister('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) =>
                      value === watchPassword || 'Passwords do not match',
                  })}
                  className={registerErrors.confirmPassword ? 'error' : ''}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {registerErrors.confirmPassword && (
                <span className="error-text">{registerErrors.confirmPassword.message}</span>
              )}
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}

        <div className="login-footer">
          <p>
            {isLoginMode ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              className="mode-toggle"
              onClick={() => setIsLoginMode(!isLoginMode)}
            >
              {isLoginMode ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        <div className="features-preview">
          <h3>Platform Features</h3>
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">📊</div>
              <span>Real-time Analytics</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🤖</div>
              <span>AI-Powered Insights</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📱</div>
              <span>Mobile Responsive</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🔒</div>
              <span>Secure & Reliable</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 