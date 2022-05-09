import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { useCallback, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { AccordionDND } from '~/component/AccordionDND';
import update from 'immutability-helper';
import { AccordionItemDND } from '~/component/AccordionItemDND';
import { Text } from '@mantine/core';

let charactersList = [
  {
    id: 1,
    position: 1,
    label: 'Bender Bending Rodríguez',
    superpowers: [
      { id: 1, label: 'Strength' },
      { id: 2, label: 'Power' },
      { id: 3, label: 'Speed' },
    ],
  },
  {
    id: 2,
    position: 2,
    label: 'Carol Miller',
    superpowers: [
      { id: 1, label: 'Strength' },
      { id: 2, label: 'Power' },
      { id: 3, label: 'Speed' },
    ],
  },
  {
    id: 3,
    position: 3,
    label: 'Homer Simpson',
    superpowers: [
      { id: 1, label: 'Strength' },
      { id: 2, label: 'Power' },
      { id: 3, label: 'Speed' },
    ],
  },
  {
    id: 4,
    position: 4,
    label: 'Spongebob Squarepants',
    superpowers: [
      { id: 1, label: 'Strength' },
      { id: 2, label: 'Power' },
      { id: 3, label: 'Speed' },
    ],
  },
];

export const loader: LoaderFunction = async () => {
  return charactersList;
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const dI = formData.get('dI');
  const hI = formData.get('hI');
  console.log(dI, hI);
  return null;
};

export default function Index() {
  const loadData = useLoaderData();
  const [items, setItems] = useState(loadData);
  console.log(items);
  const moveAccordion = useCallback((dragIndex: number, hoverIndex: number) => {
    console.log(dragIndex, hoverIndex);
    setItems((prev: any) =>
      update(prev, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, prev[dragIndex]],
        ],
      })
    );
  }, []);
  const moveAccordionItem = useCallback((dragIndex: number, hoverIndex: number, indexQ: number, index: number) => {
    console.log(dragIndex, hoverIndex, index, indexQ);
    console.log(items[indexQ].superpowers[dragIndex], items[indexQ].superpowers[hoverIndex]);
    const superpowers = items[indexQ].superpowers;
    setItems((prev: any) =>
      update(prev, {
        [indexQ]: {
          superpowers: {
            $splice: [
              [dragIndex, 1],
              [hoverIndex, 0, superpowers[dragIndex]],
            ],
          },
        },
      })
    );
  }, []);

  return (
    <div className="flex flex-col w-3/4 mx-auto space-y-5">
      <h1 className="mx-auto">Hello, world!</h1>
      <DndProvider backend={HTML5Backend}>
        <div className="flex flex-col">
          {items.map((item: any, indexQ: number) => (
            <AccordionDND key={item.position} index={indexQ} moveAccordion={moveAccordion} label={item.label}>
              {item.superpowers.map((superpower: any, indexA: number) => (
                <AccordionItemDND
                  index={indexA}
                  indexQ={indexQ}
                  key={indexA}
                  label={superpower.label}
                  moveAccordionItem={moveAccordionItem}
                >
                  <Text>
                    {indexA} - {superpower.label}
                  </Text>
                </AccordionItemDND>
              ))}
            </AccordionDND>
          ))}
        </div>
      </DndProvider>
    </div>
  );
}
