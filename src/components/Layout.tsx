import { ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type LayoutProps = {
  children: ReactNode;
};

export const Layout = ({ children }: LayoutProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (err) {
      console.error('Failed to sign out:', err);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="app-layout">
      {user && (
        <nav className="navbar">
          <div className="nav-brand">
            <Link to="/">Lifeline</Link>
          </div>
          <div className="nav-links">
            <Link to="/" className={isActive('/') ? 'active' : ''}>
              Dashboard
            </Link>
            <Link to="/profile" className={isActive('/profile') ? 'active' : ''}>
              Profile
            </Link>
            <Link to="/contacts" className={isActive('/contacts') ? 'active' : ''}>
              Contacts
            </Link>
            <button onClick={handleSignOut} className="btn-logout">
              Sign Out
            </button>
          </div>
        </nav>
      )}
      <main className="main-content">{children}</main>
    </div>
  );
};
