import { useState } from 'react';
import toast from 'react-hot-toast';
import { ImagePlus, X, Loader2 } from 'lucide-react';
import { uploadService } from '../../services/itemService';

/**
 * Multi-image uploader with instant local previews.
 * Files upload immediately; parent receives final URLs via onChange.
 */
export default function ImageUploader({ images = [], onChange, max = 6 }) {
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []).slice(0, max - images.length);
    if (!files.length) return;

    const oversize = files.find((f) => f.size > 5 * 1024 * 1024);
    if (oversize) return toast.error('Each image must be under 5 MB.');

    setUploading(true);
    try {
      const data = await uploadService.uploadImages(files);
      onChange([...images, ...data.urls].slice(0, max));
      toast.success(`${data.urls.length} image${data.urls.length > 1 ? 's' : ''} uploaded.`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {images.map((url, i) => (
          <div key={url} className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-ink/10">
            <img src={url} alt={`upload ${i + 1}`} className="h-full w-full object-cover" />
            {i === 0 && (
              <span className="absolute left-1.5 top-1.5 rounded-md bg-ink/80 px-1.5 py-0.5 text-[9px] font-bold text-white">Cover</span>
            )}
            <button
              type="button"
              onClick={() => onChange(images.filter((u) => u !== url))}
              className="absolute right-1.5 top-1.5 rounded-full bg-ink/70 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Remove image"
            >
              <X size={12} />
            </button>
          </div>
        ))}

        {images.length < max && (
          <label className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-ink/15 text-ink-muted transition-colors hover:border-brand-400 hover:bg-brand-50/50 hover:text-brand-500">
            {uploading ? <Loader2 size={20} className="animate-spin" /> : <ImagePlus size={20} />}
            <span className="text-[10px] font-bold">{uploading ? 'Uploading...' : 'Add photos'}</span>
            <input type="file" accept="image/*" multiple hidden onChange={handleFiles} disabled={uploading} />
          </label>
        )}
      </div>
      <p className="mt-2 text-[11px] text-ink-muted">
        Up to {max} images, 5 MB each. The first image becomes the cover photo.
      </p>
    </div>
  );
}
