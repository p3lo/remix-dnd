import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { useActionData, useLoaderData, useSubmit } from '@remix-run/react';
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
      { id: 1, label: 'Strength', position: 1 },
      { id: 2, label: 'Power', position: 2 },
      { id: 3, label: 'Speed', position: 3 },
    ],
  },
  {
    id: 2,
    position: 2,
    label: 'Carol Miller',
    superpowers: [
      { id: 1, label: 'Strength', position: 1 },
      { id: 2, label: 'Power', position: 2 },
      { id: 3, label: 'Speed', position: 3 },
    ],
  },
  {
    id: 3,
    position: 3,
    label: 'Homer Simpson',
    superpowers: [
      { id: 1, label: 'Strength', position: 1 },
      { id: 2, label: 'Power', position: 2 },
      { id: 3, label: 'Speed', position: 3 },
    ],
  },
  {
    id: 4,
    position: 4,
    label: 'Spongebob Squarepants',
    superpowers: [
      { id: 1, label: 'Strength', position: 1 },
      { id: 2, label: 'Power', position: 2 },
      { id: 3, label: 'Speed', position: 3 },
    ],
  },
];

export const loader: LoaderFunction = async () => {
  return charactersList;
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const indexQ = formData.get('indexQ')?.toString();
  const index = formData.get('index')?.toString();
  const id = formData.get('id')?.toString();
  if (!indexQ || !index || !id) {
    return null;
  }
  let chars = Object.assign(charactersList);
  const indexItem = chars[+indexQ].superpowers.findIndex((c: any) => c.id === Number(id));
  let newChars = update(chars, {
    [+indexQ]: {
      superpowers: {
        $splice: [
          [indexItem, 1],
          [+index, 0, chars[+indexQ].superpowers[indexItem]],
        ],
      },
    },
  });
  console.log(indexQ, index, id, newChars[+indexQ].superpowers);
  return null;
};

export default function Index() {
  const loadData = useLoaderData();
  const actionData = useActionData();
  const submit = useSubmit();
  const [items, setItems] = useState(loadData);
  const moveAccordion = useCallback((dragIndex: number, hoverIndex: number) => {
    setItems((prev: any) =>
      update(prev, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, prev[dragIndex]],
        ],
      })
    );
  }, []);
  const moveAccordionItem = useCallback(
    (dragIndex: number, hoverIndex: number, indexQ: number) => {
      const superpowers = Object.assign(items[indexQ].superpowers);
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
    },

    [items]
  );
  const moveCompleted = useCallback((indexQ: number, index: number, id: number) => {
    submit(
      { indexQ: indexQ.toString(), index: index.toString(), id: id.toString() },
      { method: 'post', replace: true }
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
                  id={superpower.id}
                  key={superpower.id}
                  moveAccordionItem={moveAccordionItem}
                  moveCompleted={moveCompleted}
                >
                  <Text>
                    {superpower.id} - {superpower.label}
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
