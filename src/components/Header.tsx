import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

const Header = () => {
  const { user, isLoading, signInWithGoogle, signOut } = useAuth();

  const handleAuth = () => {
    if (user) {
      signOut();
    } else {
      signInWithGoogle();
    }
  };

  return (
    <header className="header">
      <div className="header__container">
        <div className="flex items-center">
          <Link to="/" className="header__title">Woting</Link>
        </div>

        <button
          className={`btn ${user ? 'btn-accent' : 'btn-primary'}`}
          onClick={handleAuth}
          disabled={isLoading}
        >
          {isLoading
            ? 'Procesando...'
            : user
              ? 'Cerrar sesión'
              : 'Iniciar sesión con Google'
          }
        </button>
      </div>
    </header>
  );
};

export default Header;
