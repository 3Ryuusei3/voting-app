import { useAuth } from '../hooks/useAuth'

const AuthenticatedContent = () => {
  const { user } = useAuth()

  if (!user) {
    return null
  }

  return (
    <div className="card">
      <div className="card-body">
        <h2 className="text-large font-medium">Welcome, {user.email}!</h2>
        <p className="text-muted">You are now authenticated. The voting app content will be added here.</p>
        <button className="btn btn-primary">Start Voting</button>
      </div>
    </div>
  )
}

export default AuthenticatedContent
