import type { Identifier, XYCoord } from 'dnd-core';
import type { FC } from 'react';
import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { RiDragMove2Line } from 'react-icons/ri';

export const ItemTypes = {
  AIDNDI: 'aidndi',
};

export interface AccordionItem {
  indexQ: number;
  index: number;
  id: number;
  children: React.ReactNode;
  moveAccordionItem: (dragIndex: number, hoverIndex: number, indexQ: number, index: number) => void;
  moveCompleted: (indexQ: number, index: number, id: number) => void;
}

interface DragItem2 {
  index: number;
  indexQ: number;
  id: number;
}

export const AccordionItemDND: FC<AccordionItem> = ({
  moveAccordionItem,
  index,
  indexQ,
  children,
  moveCompleted,
  id,
}) => {
  const refNested = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop<DragItem2, void, { handlerId: Identifier | null }>({
    accept: ItemTypes.AIDNDI,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
        didDrop: monitor.didDrop(),
        isOver: monitor.isOver(),
      };
    },
    hover(item: DragItem2, monitor) {
      if (!refNested.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }
      if (indexQ !== item.indexQ) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = refNested.current?.getBoundingClientRect();

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
      moveAccordionItem(dragIndex, hoverIndex, indexQ, index);

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
      return { indexQ, index, id };
    },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item: DragItem2, monitor) => {
      if (monitor.didDrop()) {
        moveCompleted(indexQ, index, item.id);
      }
    },
  });

  const opacity = isDragging ? 0.5 : 1;
  drag(drop(refNested));
  return (
    <div className="flex items-center justify-between" ref={refNested} style={{ opacity }} data-handler-id={handlerId}>
      {children}
      <div ref={refNested}>
        <RiDragMove2Line className="cursor-move" size={20} />
      </div>
    </div>
  );
};
