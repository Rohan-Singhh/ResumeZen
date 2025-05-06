import React from 'react';
import { PencilSquareIcon } from '@heroicons/react/24/outline';

export default function ProfileCard({ user, onEdit }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
        <div className="flex items-start gap-4 min-w-0 flex-1">
          <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-xl font-semibold flex-shrink-0">
            {user.initials}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{user.name}</h2>
          </div>
        </div>
        <button onClick={onEdit} className="flex items-center gap-2 text-primary hover:text-secondary whitespace-nowrap flex-shrink-0">
          <PencilSquareIcon className="w-5 h-5" />
          <span>Edit Profile</span>
        </button>
      </div>
      <div className="space-y-4 w-full">
        <div className="bg-gray-50 rounded-lg p-4 overflow-hidden">
          <p className="text-gray-600">Email</p>
          <p className="font-medium truncate">{user.email}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 overflow-hidden">
          <p className="text-gray-600">Phone</p>
          <p className="font-medium truncate">{user.phone}</p>
        </div>
        <div className="bg-primary/5 rounded-lg p-4 overflow-hidden">
          <p className="text-primary font-semibold">Current Plan</p>
          <p className="text-lg font-bold truncate">{user.plan}</p>
        </div>
      </div>
    </div>
  );
} 