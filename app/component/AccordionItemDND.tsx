import { Text } from '@mantine/core';
import type { Identifier, XYCoord } from 'dnd-core';
import type { FC } from 'react';
import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { RiDragMove2Line } from 'react-icons/ri';

export const ItemTypes = {
  AIDNDI: 'aidndi',
};

export interface AccordionItem {
  indexA: number;
  indexQ: number;
  label: string;
  moveAccordionItem: (dragIndex: number, hoverIndex: number, indexA: number, indexQ: number) => void;
}

interface DragItem {
  index: number;
}

export const AccordionItemDND: FC<AccordionItem> = ({ moveAccordionItem, indexA, indexQ, label }) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: Identifier | null }>({
    accept: ItemTypes.AIDNDI,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = indexA;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      moveAccordionItem(dragIndex, hoverIndex, indexA, indexQ);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.AIDNDI,
    item: () => {
      return { indexA, indexQ };
    },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0 : 1;
  drag(drop(ref));
  return (
    <div className="flex items-center justify-between" ref={ref} style={{ opacity }} data-handler-id={handlerId}>
      <Text>{label}</Text>
      <div ref={ref}>
        <RiDragMove2Line className="cursor-move" size={24} />
      </div>
    </div>
  );
};
