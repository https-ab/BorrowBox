import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { PackagePlus, Save } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import Spinner from '../components/ui/Spinner';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import ImageUploader from '../components/items/ImageUploader';
import { itemService } from '../services/itemService';
import { useAuth } from '../store/AuthContext';
import { CATEGORIES, CONDITIONS, CITIES } from '../utils/constants';

const schema = z.object({
  name: z.string().min(3, 'Item name must be at least 3 characters.'),
  description: z.string().min(20, 'Tell borrowers more — at least 20 characters.'),
  category: z.string().min(1, 'Pick a category.'),
  condition: z.string().min(1, 'Pick a condition.'),
  conditionNotes: z.string().optional(),
  pricePerDay: z.coerce.number().min(1, 'Price must be at least ₹1.'),
  deposit: z.coerce.number().min(0, 'Deposit cannot be negative.'),
  city: z.string().min(1, 'Pick a city.'),
  area: z.string().optional(),
  rules: z.string().optional(),
  minDays: z.coerce.number().min(1).max(60),
  maxDays: z.coerce.number().min(1).max(180),
}).refine((d) => d.maxDays >= d.minDays, { message: 'Max days must be ≥ min days.', path: ['maxDays'] });

/** Create or edit a listing (route decides the mode). */
export default function ListItem() {
  const { id } = useParams(); // present in edit mode
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const { data: existing, isLoading: loadingExisting } = useQuery({
    queryKey: ['item', id],
    queryFn: () => itemService.get(id),
    enabled: isEdit,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      city: user?.city || 'Pune', condition: 'Good', minDays: 1, maxDays: 30, deposit: 0,
    },
  });

  useEffect(() => {
    if (existing?.item) {
      const it = existing.item;
      reset({
        name: it.name, description: it.description, category: it.category,
        condition: it.condition, conditionNotes: it.conditionNotes, pricePerDay: it.pricePerDay,
        deposit: it.deposit, city: it.city, area: it.area, rules: it.rules,
        minDays: it.minDays, maxDays: it.maxDays,
      });
      setImages(it.images || []);
    }
  }, [existing, reset]);

  const onSubmit = async (values) => {
    if (!images.length) return toast.error('Please upload at least one item image.');
    const coords = CITIES[values.city] || CITIES.Pune;
    // Small random offset so items in the same city don't stack on one point
    const jitter = () => (Math.random() - 0.5) * 0.04;
    const payload = {
      ...values,
      images,
      lat: existing?.item?.location?.coordinates?.[1] ?? coords.lat + jitter(),
      lng: existing?.item?.location?.coordinates?.[0] ?? coords.lng + jitter(),
    };
    setSubmitting(true);
    try {
      if (isEdit) {
        await itemService.update(id, payload);
        toast.success('Listing updated!');
      } else {
        await itemService.create(payload);
        toast.success('Your item is live! 🎉');
      }
      navigate('/my-items');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (isEdit && loadingExisting) return <Spinner label="Loading your listing..." />;

  return (
    <PageTransition className="container-app max-w-3xl py-8">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-extrabold sm:text-3xl">
          {isEdit ? 'Edit listing' : 'List an item'}
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          {isEdit ? 'Update the details of your listing.' : 'Turn your idle stuff into shared experiences (and earnings).'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <section className="card space-y-4 p-6">
          <h2 className="font-display text-base font-bold">Basics</h2>
          <Input label="Item name" placeholder="e.g. Sony A6400 Mirrorless Camera" error={errors.name?.message} {...register('name')} />
          <Textarea
            label="Description" rows={5}
            placeholder="What is it, what's included, what's it great for? Honest details get more requests."
            error={errors.description?.message} {...register('description')}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Category" error={errors.category?.message} {...register('category')}>
              <option value="">Choose category...</option>
              {CATEGORIES.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
            </Select>
            <Select label="Condition" error={errors.condition?.message} {...register('condition')}>
              {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
            </Select>
          </div>
          <Input
            label="Condition notes (optional)"
            placeholder="e.g. Small scuff on the grip, everything else flawless"
            {...register('conditionNotes')}
          />
        </section>

        <section className="card space-y-4 p-6">
          <h2 className="font-display text-base font-bold">Photos</h2>
          <ImageUploader images={images} onChange={setImages} />
        </section>

        <section className="card space-y-4 p-6">
          <h2 className="font-display text-base font-bold">Pricing</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Price per day (₹)" type="number" min="1" placeholder="300" error={errors.pricePerDay?.message} {...register('pricePerDay')} />
            <Input
              label="Security deposit (₹)" type="number" min="0" placeholder="2000"
              hint="Refundable. Protects you if something goes wrong." error={errors.deposit?.message} {...register('deposit')}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Minimum days" type="number" min="1" error={errors.minDays?.message} {...register('minDays')} />
            <Input label="Maximum days" type="number" min="1" error={errors.maxDays?.message} {...register('maxDays')} />
          </div>
        </section>

        <section className="card space-y-4 p-6">
          <h2 className="font-display text-base font-bold">Location & rules</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="City" error={errors.city?.message} {...register('city')}>
              {Object.keys(CITIES).map((c) => <option key={c}>{c}</option>)}
            </Select>
            <Input label="Area / neighbourhood (optional)" placeholder="e.g. Koregaon Park" {...register('area')} />
          </div>
          <Textarea
            label="Borrowing rules (optional)" rows={3}
            placeholder="e.g. Return with batteries charged. No lens swapping without asking."
            {...register('rules')}
          />
        </section>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" size="lg" loading={submitting} icon={isEdit ? Save : PackagePlus}>
            {isEdit ? 'Save changes' : 'Publish listing'}
          </Button>
        </div>
      </form>
    </PageTransition>
  );
}
