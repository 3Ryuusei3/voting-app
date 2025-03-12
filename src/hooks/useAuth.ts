import { useAuthStore } from '../store/authStore'

export const useAuth = () => {
  const { user, isLoading, isCheckingUser, error, signInWithGoogle, signOut } = useAuthStore()

  return {
    user,
    isLoading,
    isCheckingUser,
    error,
    isAuthenticated: !!user,
    signInWithGoogle,
    signOut
  }
}

export default useAuth
