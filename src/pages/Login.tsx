import { GoogleLogin } from '@react-oauth/google';
import type { CredentialResponse } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSuccess = (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      // Decode JWT token to get user info
      const token = credentialResponse.credential;
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      const userData = JSON.parse(jsonPayload);
      
      login({
        email: userData.email,
        name: userData.name,
        picture: userData.picture,
        sub: userData.sub,
      });

      navigate('/');
    }
  };

  const handleError = () => {
    console.error('Login Failed');
    alert('Failed to sign in with Google. Please try again.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900">
      <div className="max-w-md w-full space-y-8 p-8 bg-zinc-950 border border-zinc-800 shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-light text-zinc-100">Welcome to Fiderca</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Sign in with your Google account to continue
          </p>
        </div>
        
        <div className="flex justify-center mt-8">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={handleError}
            useOneTap
            theme="filled_black"
            size="large"
          />
        </div>
      </div>
    </div>
  );
}

export default Login;
