import LoginForm from '@/components/login-form';

export default function LoginPage() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-6 md:p-10 bg-card rounded-xl shadow-lg">
        <LoginForm />
      </div>
    </div>
  );
}
