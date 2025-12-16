import React, { useState } from 'react';
import { UserAvatar } from './user-avatar';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Phone, MapPin, User, Tag } from 'lucide-react';
import { PhoneDisplay } from './phone-display';

interface Client {
  id: number;
  full_name: string;
  nickname?: string;
  phone: string;
  address?: string;
  gender?: string;
}

interface ClientAvatarCardProps {
  client: Client;
}

export function ClientAvatarCard({ client }: ClientAvatarCardProps) {
  const [open, setOpen] = useState(false);

  const displayName = client.nickname 
    ? `${client.full_name} (${client.nickname})`
    : client.full_name;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-3 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary rounded-md">
          <UserAvatar name={client.full_name} size="md" />
          <div className="text-left">
            <p className="font-medium text-gray-900 text-sm">{client.full_name}</p>
            {client.nickname && (
              <p className="text-xs text-gray-500">"{client.nickname}"</p>
            )}
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-3">
            <UserAvatar name={client.full_name} size="lg" />
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">{client.full_name}</h4>
              {client.nickname && (
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {client.nickname}
                </p>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200"></div>

          {/* Details */}
          <div className="space-y-3">
            {/* Phone */}
            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Phone</p>
                <PhoneDisplay phone={client.phone} />
              </div>
            </div>

            {/* Gender */}
            {client.gender && (
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Gender</p>
                  <p className="text-sm capitalize">{client.gender}</p>
                </div>
              </div>
            )}

            {/* Address */}
            {client.address && (
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Address</p>
                  <p className="text-sm text-gray-700">{client.address}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
