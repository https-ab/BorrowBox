import { useState } from 'react';
import toast from 'react-hot-toast';
import { ImagePlus, X } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import { uploadService } from '../../services/itemService';

const CONDITION_OPTIONS = ['New', 'Like New', 'Good', 'Used', 'Damaged'];

/**
 * Modal form for recording an item's condition (at handover or on return),
 * with optional photo evidence uploads.
 */
export default function ConditionForm({ open, onClose, onSubmit, title, submitLabel, loading }) {
  const [condition, setCondition] = useState('Good');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []).slice(0, 4);
    if (!files.length) return;
    setUploading(true);
    try {
      const data = await uploadService.uploadImages(files);
      setPhotos((p) => [...p, ...data.urls].slice(0, 4));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const submit = () => {
    onSubmit({ condition, notes, photos });
  };

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="space-y-4">
        <Select label="Condition" value={condition} onChange={(e) => setCondition(e.target.value)}>
          {CONDITION_OPTIONS.map((c) => <option key={c}>{c}</option>)}
        </Select>
        <Textarea
          label="Notes"
          placeholder="Describe the item's state — scratches, accessories included, battery level..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={1000}
        />
        <div>
          <label className="label-base">Photos (optional, up to 4)</label>
          <div className="flex flex-wrap gap-2">
            {photos.map((url) => (
              <div key={url} className="relative">
                <img src={url} alt="condition" className="h-16 w-20 rounded-lg object-cover" />
                <button
                  type="button"
                  onClick={() => setPhotos((p) => p.filter((u) => u !== url))}
                  className="absolute -right-1.5 -top-1.5 rounded-full bg-ink p-0.5 text-white"
                >
                  <X size={11} />
                </button>
              </div>
            ))}
            {photos.length < 4 && (
              <label className="flex h-16 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-ink/15 text-ink-muted transition-colors hover:border-brand-400 hover:text-brand-500">
                <ImagePlus size={16} />
                <span className="text-[9px] font-bold">{uploading ? '...' : 'Add'}</span>
                <input type="file" accept="image/*" multiple hidden onChange={handleFiles} disabled={uploading} />
              </label>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} loading={loading || uploading}>{submitLabel}</Button>
        </div>
      </div>
    </Modal>
  );
}
