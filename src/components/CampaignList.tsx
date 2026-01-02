import { Campaign } from '@/types/types';
import React from 'react';

interface Props {
  items: Campaign[];
  onSelect?: (id: string) => void;
}

const CampaignList: React.FC<Props> = ({ items, onSelect }) => {
  return (
    <div className="rounded-sm border bg-white p-3 shadow-default">
      <h3 className="graphheaders mb-2">Campaigns</h3>
      <ul>
        {items.map((c) => (
          <li key={c.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
            <div>
              <div className="text-sm font-medium">{c.name}</div>
              <div className="text-xs text-gray-500">Status: {c.status || 'unknown'}</div>
            </div>
            <div>
              <button
                onClick={() => onSelect?.(c.id)}
                className="text-xs bg-primary text-white px-2 py-1 rounded"
              >
                View
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CampaignList;