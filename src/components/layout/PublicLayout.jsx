import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';

const PublicLayout = () => {
  const location = useLocation();
  
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1 pt-20">
        <Outlet key={location.pathname} />
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;