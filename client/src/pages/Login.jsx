import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { LogIn } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Logo from '../components/layout/Logo';
import { useAuth } from '../store/AuthContext';

const schema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      const user = await login(values);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}! 👋`);
      navigate(location.state?.from || '/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageTransition className="container-app flex min-h-[80vh] items-center justify-center py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Logo className="justify-center" />
          <h1 className="mt-6 font-display text-2xl font-extrabold">Welcome back</h1>
          <p className="mt-1 text-sm text-ink-muted">Log in to keep borrowing and lending.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4 p-6 sm:p-8">
          <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
          <Input label="Password" type="password" placeholder="••••••••" error={errors.password?.message} {...register('password')} />
          <Button type="submit" className="w-full" size="lg" loading={submitting} icon={LogIn}>
            Log in
          </Button>
          <div className="rounded-xl bg-brand-50 px-4 py-3 text-xs leading-relaxed text-brand-800">
            <p className="font-bold">Demo accounts</p>
            <p>User — rahul@borrowbox.in / password123</p>
            <p>Admin — admin@borrowbox.in / admin123</p>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-ink-muted">
          New to BorrowBox?{' '}
          <Link to="/register" className="font-bold text-brand-600 hover:text-brand-700">Create an account</Link>
        </p>
      </div>
    </PageTransition>
  );
}
