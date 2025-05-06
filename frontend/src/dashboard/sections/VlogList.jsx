import React from 'react';
import { PlayIcon } from '@heroicons/react/24/outline';

export default function VlogList({ vlogs, onSelect }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-semibold mb-6">Recommended Vlogs</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {vlogs.map(vlog => (
          <div key={vlog.id} onClick={() => onSelect(vlog)} className="group relative rounded-lg overflow-hidden cursor-pointer">
            <img src={vlog.thumbnail} alt={vlog.title} className="w-full h-48 object-cover" />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <PlayIcon className="w-16 h-16 text-white" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-4">
              <h3 className="text-white font-medium mb-2">{vlog.title}</h3>
              <p className="text-gray-300 text-sm line-clamp-2">{vlog.short_description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 