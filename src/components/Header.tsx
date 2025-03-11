import { useAuth } from '../hooks/useAuth';

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
        <h1 className="header__title">Voting App</h1>
        <button
          className={`btn ${user ? 'btn-accent' : 'btn-primary'}`}
          onClick={handleAuth}
          disabled={isLoading}
        >
          {isLoading
            ? 'Processing...'
            : user
              ? 'Sign Out'
              : 'Sign In with Google'
          }
        </button>
      </div>
    </header>
  );
};

export default Header;
