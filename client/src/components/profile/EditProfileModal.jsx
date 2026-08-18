import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { userService } from '../../services/authService';
import { useAuth } from '../../store/AuthContext';
import { CITIES } from '../../utils/constants';

/** Edit name / bio / city / avatar. */
export default function EditProfileModal({ open, onClose }) {
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: user?.name || '', bio: user?.bio || '', city: user?.city || 'Pune', avatar: user?.avatar || '',
  });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const mutation = useMutation({
    mutationFn: () => {
      const coords = CITIES[form.city];
      return userService.updateMe({ ...form, lat: coords?.lat, lng: coords?.lng });
    },
    onSuccess: (data) => {
      updateUser(data.user);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated!');
      onClose();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <Modal open={open} onClose={onClose} title="Edit profile">
      <div className="space-y-4">
        <Input label="Name" value={form.name} onChange={set('name')} />
        <Textarea label="About you" placeholder="Tell the community a little about yourself..." value={form.bio} onChange={set('bio')} maxLength={500} />
        <Select label="City" value={form.city} onChange={set('city')}>
          {Object.keys(CITIES).map((c) => <option key={c}>{c}</option>)}
        </Select>
        <Input label="Avatar URL" hint="Paste an image URL, or keep your generated avatar." value={form.avatar} onChange={set('avatar')} />
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => mutation.mutate()} loading={mutation.isPending}>Save changes</Button>
        </div>
      </div>
    </Modal>
  );
}
