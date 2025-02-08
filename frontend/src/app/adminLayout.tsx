import { ReactNode } from 'react';
import Sidebar from '../components/Sidebar';
import type { Metadata } from "next";
import "./globals.css"; 
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS globally
import Footer from '../components/Footer';
import L from 'leaflet';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type LayoutProps = {
  children: ReactNode;
};

const AdminLayout = ({ children }: LayoutProps) => {
  return (
    <div className = "flex min-h-[100vh]">
      <Sidebar />
      <main className='ml-[250px] p-[20px] bg-[#f4f6f8] flex-grow'>
        {children}
        <ToastContainer />

      </main>
    </div>
  );
};

export default AdminLayout;
