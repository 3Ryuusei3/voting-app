import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import logo from '../assets/woting-logo.svg';
import offIcon from '../assets/off-icon.svg';
import historyIcon from '../assets/history-icon.svg';
import voteIcon from '../assets/vote-icon.svg';
import googleIcon from '../assets/google-icon.svg';
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
        <div className="flex items-center justify-center">
          <Link to="/" className="header__title flex"><img src={logo} alt="Logo" width={95} /></Link>
        </div>
        <nav>
          {!user ? (
            <button
              className={`btn btn-sm ${user ? 'btn-accent' : 'btn-primary'}`}
              onClick={handleAuth}
              disabled={isLoading}
            >
              <img src={googleIcon} alt="Google" width={24} height={24} />
              <span>Iniciar sesión con Google</span>
            </button>
          ) : isLoading ? (
            <button className="btn btn-sm btn-gray">
              <span>Cargando...</span>
            </button>
          ) : (
            <>
              <Link to="/vote" className="btn btn-primary btn-xs flex">
                <span>Votar</span>
                <img src={voteIcon} alt="Logo" width={28} height={28} />
              </Link>
              <Link to="/history" className="btn btn-gray btn-xs flex">
                <span>Historial</span>
                <img src={historyIcon} alt="Logo" width={28} height={28} />
              </Link>
              <Link to="/" className="btn btn-error btn-xs flex" onClick={handleAuth}>
                <span>Cerrar sesión</span>
                <img src={offIcon} alt="Logo" width={28} height={28} />
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
