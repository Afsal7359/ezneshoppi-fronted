'use client';
import { useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { API } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ImageUploader({ images = [], onChange, multiple = true }) {
  const [uploading, setUploading] = useState(false);

  const handle = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      if (multiple) {
        const fd = new FormData();
        files.forEach((f) => fd.append('files', f));
        const { data } = await API.uploadMultiple(fd);
        onChange([...images, ...(data.urls || [])]);
      } else {
        const fd = new FormData();
        fd.append('file', files[0]);
        const { data } = await API.uploadSingle(fd);
        onChange(data.url);
      }
      toast.success('Uploaded');
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const remove = (i) => {
    if (multiple) onChange(images.filter((_, idx) => idx !== i));
    else onChange('');
  };

  const list = multiple ? images : images ? [images] : [];

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {list.map((url, i) => (
          <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-ink-900/10 group">
            <Image src={url} alt="" fill className="object-cover" />
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full grid place-items-center opacity-0 group-hover:opacity-100 transition"
            >
              <X size={12} />
            </button>
          </div>
        ))}
        <label className="w-24 h-24 border-2 border-dashed border-ink-900/15 rounded-xl grid place-items-center cursor-pointer hover:border-brand-500 hover:bg-brand-50 transition">
          {uploading ? <Loader2 size={20} className="animate-spin text-brand-600" /> : (
            <div className="text-center">
              <Upload size={18} className="mx-auto text-ink-400" />
              <p className="text-xs text-ink-500 mt-1">Upload</p>
            </div>
          )}
          <input
            type="file"
            accept="image/*,.avif,.heic,.heif"
            multiple={multiple}
            onChange={handle}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>
    </div>
  );
}
