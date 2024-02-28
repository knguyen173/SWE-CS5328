import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/login/LoginPage';
import UserProfile from './pages/user/Profile';
import RegistrationPage from './pages/login/RegistrationPage';
import ForgotPassword from './pages/login/ForgotPasswordPage';
import Home from './pages/Home';
import './stylesheets/App.css';
import PasswordResetPage from './pages/login/PasswordResetPage';
// import { fakeAuthProvider } from "./auth";
const App: React.FC = () => {
  return (
      <Router>
        <Routes>
          <Route path="/password-reset/:token" element={<PasswordResetPage/>} />
          <Route path="/login" element={<LoginPage/>}/>
          <Route path="/register" element={<RegistrationPage/>}/>
          <Route path="/home" element={<Home/>}/>
          <Route path="/profile" element={<UserProfile />} />
            <Route path="forgot-password" element={<ForgotPassword/>} />
          <Route path="*" element={<LoginPage/>} />
        </Routes>
      </Router>
  );
};
export default App;