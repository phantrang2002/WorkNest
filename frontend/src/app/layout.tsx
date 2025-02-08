'use client';  // Add this line at the top of your component file

import { useState } from 'react';
import type { Metadata } from "next";
import "./globals.css"; 
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS globally
import Footer from '../components/Footer';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

 

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} closeOnClick pauseOnHover draggable pauseOnFocusLoss />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
