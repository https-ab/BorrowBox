import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { UserPlus } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import Logo from '../components/layout/Logo';
import { useAuth } from '../store/AuthContext';
import { CITIES } from '../utils/constants';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  city: z.string().min(2, 'Please choose your city.'),
});

export default function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { city: 'Pune' },
  });

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      const coords = CITIES[values.city];
      await registerUser({ ...values, lat: coords?.lat, lng: coords?.lng });
      toast.success('Welcome to BorrowBox! 🎉 Your account is ready.');
      navigate('/dashboard');
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
          <h1 className="mt-6 font-display text-2xl font-extrabold">Join the community</h1>
          <p className="mt-1 text-sm text-ink-muted">Own less. Experience more. It's free.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4 p-6 sm:p-8">
          <Input label="Full name" placeholder="Rahul Sharma" error={errors.name?.message} {...register('name')} />
          <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
          <Input
            label="Password" type="password" placeholder="At least 6 characters"
            hint="Use something you don't use elsewhere." error={errors.password?.message} {...register('password')}
          />
          <Select label="City" error={errors.city?.message} {...register('city')}>
            {Object.keys(CITIES).map((city) => <option key={city}>{city}</option>)}
          </Select>
          <Button type="submit" className="w-full" size="lg" loading={submitting} icon={UserPlus}>
            Create account
          </Button>
          <p className="text-center text-[11px] leading-relaxed text-ink-muted">
            A profile avatar is generated for you automatically — you can change it later from your profile.
          </p>
        </form>

        <p className="mt-6 text-center text-sm text-ink-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-brand-600 hover:text-brand-700">Log in</Link>
        </p>
      </div>
    </PageTransition>
  );
}
