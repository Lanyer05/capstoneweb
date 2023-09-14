import React, { useState } from 'react';
import firebase from './config/firebase';
import './css/design.css';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AnimatedPage from "./AnimatedPage";
import Logo from "./ecotaskreward_logo.png"

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogout = async () => {
    try {
      await firebase.auth().signOut();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    if (!validateAdminEmail(email)) {
      showToast('Only admin accounts are allowed.', 'error');
      return;
    }

    try {
      const { user } = await firebase.auth().createUserWithEmailAndPassword(email, password);
      console.log('Registration successful!', user);
      showRegistrationSuccessToast();
      handleLogout();
    } catch (error) {
      console.error('Registration failed:', error.message);
      if (error.code === 'auth/email-already-in-use') {
        showToast('The email address is already in use. Please use a different email.', 'error');
      } else if (error.code === 'auth/weak-password') {
        showToast('The password must be at least 6 characters long.', 'error');
      } else {
        showToast('Error registering. Please try again later.', 'error');
      }
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateAdminEmail = (email) => {
    return email.endsWith('youradmin.com');
  };

  const showToast = (message, type) => {
    toast[type](message, {
      position: 'top-center',
      autoClose: 2000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
    });
  };

  const showRegistrationSuccessToast = () => {
    toast.success('Registration Successful! You can now log in.', {
      position: 'top-center',
      autoClose: 2000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
    });
  };

  return (
    <AnimatedPage>
    <div className="login-container">
      <h1 className="welcome-text">REGISTER</h1>
      <img className="welcome-image" src={Logo} alt="Welcome" />
      <div className="welcome-message">Create a new account</div>
      <form onSubmit={handleRegister}>
        <div className="input-container">
          <div className="input-field">
            <input
              type="email"
              placeholder=" Enter Registration Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="input-field">
            <input
              type="password"
              placeholder=" Enter Registration Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
        <div className="button-container">
          <button className="login-button" type="submit">
            REGISTER
          </button>
          <p className="forgot-password">
            Already have an account?{' '}
            <Link className="forgot-password" to="/login">
              Login here
            </Link>
            .
          </p>
        </div>
      </form>
      <ToastContainer />
    </div>
    </AnimatedPage>
  );
};

export default Register;
