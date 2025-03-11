import { useAuthStore } from '../store/authStore'

export const useAuth = () => {
  const { user, isLoading, error, signInWithGoogle, signOut } = useAuthStore()

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    signInWithGoogle,
    signOut
  }
}

export default useAuth
