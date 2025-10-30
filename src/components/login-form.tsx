import { useAuth } from '@/features/auth/AuthProvider';
import { cn } from '@/lib/utils';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useCallback, useState } from 'react';
import { APP_BASE_PATH, APP_BASE_PATH_WITH_SLASH } from '@/config/constants';

type LoginFormProps = React.ComponentProps<'form'>;

const extractErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as any).response;
    const message =
      response?.data?.error?.message ??
      response?.data?.message ??
      response?.data?.data?.error ??
      response?.statusText;
    if (typeof message === 'string' && message.trim().length > 0) {
      return message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Đăng nhập thất bại, vui lòng thử lại.';
};

export default function LoginForm({ className, ...props }: LoginFormProps): JSX.Element {
  const { signIn, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // UI only, backend does not require it yet.
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resolveRedirect = useCallback((): string => {
    const normalise = (path: string | undefined | null): string | null => {
      if (!path || !path.startsWith('/')) {
        return null;
      }

      if (!APP_BASE_PATH) {
        return path;
      }

      if (path === APP_BASE_PATH || path === APP_BASE_PATH_WITH_SLASH) {
        return '/';
      }

      if (path.startsWith(`${APP_BASE_PATH}/`)) {
        const trimmed = path.slice(APP_BASE_PATH.length);
        return trimmed.length > 0 ? trimmed : '/';
      }

      return path;
    };

    const stateFrom = (location.state as { from?: string } | null)?.from;
    const stateRedirect = normalise(stateFrom);
    if (stateRedirect) {
      return stateRedirect;
    }

    const queryRedirect = normalise(searchParams.get('redirect'));
    if (queryRedirect) {
      return queryRedirect;
    }

    return '/';
  }, [location.state, searchParams]);

  const handleSubmit = useCallback<
    NonNullable<LoginFormProps['onSubmit']>
  >(async (event) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await signIn(email);
      navigate(resolveRedirect(), { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }, [email, navigate, resolveRedirect, signIn]);

  const handleGoogleLogin = useCallback(() => {
    loginWithGoogle({ redirect: resolveRedirect() });
  }, [loginWithGoogle, resolveRedirect]);

  return (
    <form
      className={cn('flex flex-col gap-6', className)}
      onSubmit={handleSubmit}
      noValidate
      {...props}
    >
      <div className="flex flex-col gap-2 text-left">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-muted-foreground text-sm">
          Enter your email below to login to your account
        </p>
      </div>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <label htmlFor="email" className="text-base font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="m@example.com"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="!bg-white !text-black border shadow-sm rounded-xl h-12 text-lg px-4"
          />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <label htmlFor="password" className="text-base font-medium">
              Password
            </label>
            <a
              href="#"
              className="!text-black ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="bg-white text-black border border-gray-200 shadow-sm focus:border-black focus:ring-black rounded-xl h-12 text-lg px-4"
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-neutral-900 text-white rounded-xl text-lg h-12 border border-gray-200 font-medium disabled:opacity-70"
        >
          {isSubmitting ? 'Đang đăng nhập...' : 'Login'}
        </button>
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full !bg-white !text-black rounded-xl text-lg h-12 border !border-black font-medium mt-2"
        >
          Login with Google
        </button>
      </div>
      <div className="text-center text-sm">
        Don&apos;t have an account?{' '}
        <a href="#" className="!text-black underline underline-offset-4">
          Sign up
        </a>
      </div>
    </form>
  );
}
