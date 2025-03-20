import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import googleIcon from '../assets/google-icon.svg';

const Auth = () => {
  const { isLoading, error, signInWithGoogle } = useAuth();

  return (
    <div className="v-section items-center justify-center">
      <div className="card">
        <div className="card-body gap-md">
          <h2 className="text-large font-medium">¡Bienvenido a Woting!</h2>
          <p className="text-muted">En esta aplicación podrás votar para filtrar la lista de palabras del juego <Link to="https://wo-ses.vercel.app/" className="link">WOS-ES</Link>.</p>
          <p className="text-muted mb-xs">
            Por favor, inicia sesión con tu cuenta de Google para continuar.
          </p>
          <button
            className="btn btn-primary btn-full flex gap-sm items-center justify-center"
            onClick={signInWithGoogle}
            disabled={isLoading}
          >
            <img src={googleIcon} alt="Google" width={24} height={24} />
            {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión con Google'}
          </button>
          {error && <p className="text-error mt-md">{error}</p>}
          <p className="text-muted text-small text-right">© Manuel Atance 2025</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
