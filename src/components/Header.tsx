import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link, useSearchParams } from 'react-router-dom';
import AddTermModal from './AddTermModal';
import logo from '../assets/woting-logo.svg';
import offIcon from '../assets/off-icon.svg';
import listIcon from '../assets/list-icon.svg';
import voteIcon from '../assets/vote-icon.svg';
import googleIcon from '../assets/google-icon.svg';
import plusIcon from '../assets/plus-icon.svg';

const Header = () => {
  const { user, userRole, isLoading, signInWithGoogle, signOut } = useAuth();
  const [searchParams] = useSearchParams()
  const pollId = Number(searchParams.get('pollId'))

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 576);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 576);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleAuth = () => {
    if (user) {
      signOut();
    } else {
      signInWithGoogle();
    }
  };

  const hasRole = userRole === 1 || userRole === Number('1');

  return (
    <>
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
                {hasRole && (
                  <Link to={`javascript:void(0)`} onClick={() => setIsModalOpen(true)} className="btn btn-primary flex">
                    {!isMobile && <span>Nuevo</span>}
                    <img src={plusIcon} alt="Logo" width={28} height={28} />
                  </Link>
                )}
                {pollId ? (
                  <>
                    <Link to={`/vote?pollId=${pollId}`} className="btn btn-primary flex">
                      {!isMobile && <span>Votar</span>}
                      <img src={voteIcon} alt="Logo" width={28} height={28} />
                    </Link>
                    <Link to={`/history?pollId=${pollId}`} className="btn btn-gray flex">
                      {!isMobile && <span>Listado</span>}
                      <img src={listIcon} alt="Logo" width={28} height={28} />
                    </Link>
                  </>
                ) : null}
                <Link to="/" className="btn btn-error flex" onClick={handleAuth}>
                  {!isMobile && <span>Cerrar sesión</span>}
                  <img src={offIcon} alt="Logo" width={28} height={28} />
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <AddTermModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialPollId={pollId || undefined}
      />
    </>
  );
};

export default Header;
