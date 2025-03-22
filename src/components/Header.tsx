import { useAuth } from '../hooks/useAuth';
import { Link, useSearchParams } from 'react-router-dom';
import logo from '../assets/woting-logo.svg';
import offIcon from '../assets/off-icon.svg';
import listIcon from '../assets/list-icon.svg';
import voteIcon from '../assets/vote-icon.svg';
import googleIcon from '../assets/google-icon.svg';
const Header = () => {
  const { user, isLoading, signInWithGoogle, signOut } = useAuth();
  const [searchParams] = useSearchParams()
  const pollId = Number(searchParams.get('pollId'))

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
          <Link to="/" className="header__title flex"><img src={logo} alt="Logo" width={100} /></Link>
        </div>
        <nav>
          {!user ? (
            <button
              className={`btn ${user ? 'btn-accent' : 'btn-primary'}`}
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
              {pollId ? (
                <>
                  <Link to={`/vote?pollId=${pollId}`} className="btn btn-primary flex">
                    <span>Votar</span>
                    <img src={voteIcon} alt="Logo" width={28} height={28} />
                  </Link>
                  <Link to={`/history?pollId=${pollId}`} className="btn btn-gray flex">
                    <span>Listado</span>
                    <img src={listIcon} alt="Logo" width={28} height={28} />
                  </Link>
                </>
              ) : null}
              <Link to="/" className="btn btn-error flex" onClick={handleAuth}>
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
