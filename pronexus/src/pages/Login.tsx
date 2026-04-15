import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { LoginForm } from '../components/LoginForm';

export const Login: React.FC = () => {
  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen flex flex-col architectural-grid relative">
      <Header />
      <main className="flex-grow flex items-center justify-center px-4 pt-14 pb-20">
        <LoginForm />
      </main>
      <Footer />
    </div>
  );
};
