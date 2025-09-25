import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

interface SortableSetProps {
  id: string;
  children: React.ReactNode;
}

const SortableSet: React.FC<SortableSetProps> = ({ id, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="flex items-center gap-2">
      <button type="button" {...listeners} className="cursor-grab">
        <GripVertical className="h-5 w-5" />
      </button>
      {children}
    </div>
  );
};

export default SortableSet;
