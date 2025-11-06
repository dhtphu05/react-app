import React, { useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, ChevronLeft, List, Users, MoreHorizontal } from 'lucide-react';
import { useWorkspaceData } from '@/features/workspaces/WorkspaceDataProvider';
import type { Board, BoardCard, BoardList } from '@/features/workspaces/data';

type DragPayload = {
  listId: string;
  cardId: string;
};

const createList = (name: string): BoardList => ({
  id: `list-${Date.now()}`,
  name,
  cards: [],
});

const createCard = (title: string, description = ''): BoardCard => ({
  id: `card-${Date.now()}`,
  title,
  description,
});

export default function BoardPage(): React.JSX.Element {
  const navigate = useNavigate();
  const params = useParams<{ boardId: string }>();
  const { workspaces, updateBoard } = useWorkspaceData();
  const [activeListIdForCard, setActiveListIdForCard] = useState<string | null>(null);
  const [cardDrafts, setCardDrafts] = useState<Record<string, string>>({});
  const [isAddingList, setIsAddingList] = useState(false);
  const [listDraftName, setListDraftName] = useState('');
  const dragPayloadRef = useRef<DragPayload | null>(null);

  const boardId = params.boardId ?? '';

  const locatedBoard = useMemo(() => {
    for (const workspace of workspaces) {
      const board = workspace.boards.find((item) => item.id === boardId);
      if (board) {
        return { workspaceId: workspace.id, board };
      }
    }
    return null;
  }, [boardId, workspaces]);

  if (!locatedBoard) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center text-slate-600">
        <h1 className="text-2xl font-semibold text-slate-900">Board not found</h1>
        <p className="mt-2 text-sm text-slate-500">
          The board you are looking for might have been removed or never existed.
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Back to dashboard
        </button>
      </main>
    );
  }

  const { board } = locatedBoard;

  const handleAddList = () => {
    const trimmed = listDraftName.trim();
    if (!trimmed) {
      return;
    }

    updateBoard(board.id, (current) => ({
      ...current,
      lists: [...current.lists, createList(trimmed)],
    }));

    setListDraftName('');
    setIsAddingList(false);
  };

  const handleAddCard = (listId: string) => {
    const draft = cardDrafts[listId]?.trim();
    if (!draft) {
      return;
    }

    updateBoard(board.id, (current) => ({
      ...current,
      lists: current.lists.map((list) =>
        list.id === listId ? { ...list, cards: [...list.cards, createCard(draft)] } : list
      ),
    }));

    setCardDrafts((prev) => ({ ...prev, [listId]: '' }));
    setActiveListIdForCard(null);
  };

  const handleCancelAddCard = () => {
    setActiveListIdForCard(null);
  };

  const handleDragStart = (listId: string, cardId: string, event: React.DragEvent<HTMLDivElement>) => {
    dragPayloadRef.current = { listId, cardId };
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    dragPayloadRef.current = null;
  };

  const moveCard = (destinationListId: string, destinationIndex?: number) => {
    const payload = dragPayloadRef.current;
    if (!payload) {
      return;
    }

    const { listId: sourceListId, cardId } = payload;

    updateBoard(board.id, (current) => {
      const listsCopy = current.lists.map((list) => ({
        ...list,
        cards: list.cards.slice(),
      }));

      const sourceListIndex = listsCopy.findIndex((list) => list.id === sourceListId);
      const destinationListIndex = listsCopy.findIndex((list) => list.id === destinationListId);

      if (sourceListIndex === -1 || destinationListIndex === -1) {
        return current;
      }

      const sourceCards = listsCopy[sourceListIndex].cards;
      const cardIndex = sourceCards.findIndex((card) => card.id === cardId);
      if (cardIndex === -1) {
        return current;
      }

      const [movedCard] = sourceCards.splice(cardIndex, 1);
      if (!movedCard) {
        return current;
      }

      const destinationCards = listsCopy[destinationListIndex].cards;

      let insertIndex = destinationIndex ?? destinationCards.length;
      if (
        sourceListIndex === destinationListIndex &&
        destinationIndex !== undefined &&
        cardIndex < destinationIndex
      ) {
        insertIndex = destinationIndex - 1;
      }

      destinationCards.splice(insertIndex, 0, movedCard);

      return {
        ...current,
        lists: listsCopy,
      };
    });

    dragPayloadRef.current = null;
  };

  const handleDropOnList = (listId: string, event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    moveCard(listId);
  };

  const handleDropOnCard = (
    listId: string,
    cardIndex: number,
    event: React.DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
    moveCard(listId, cardIndex);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const totalCards = board.lists.reduce((total, list) => total + list.cards.length, 0);

  return (
    <div className="min-h-screen bg-[#e9ecff]">
      <header className="border-b border-[#d5dcff] bg-[#f7f8ff]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-[#1f2a60] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0f173f]"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">{board.name}</h1>
              <p className="text-sm text-slate-500">{board.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#dbe2ff] px-3 py-1 font-medium text-[#1f2a60]">
              <List className="h-4 w-4 text-[#3945cc]" aria-hidden="true" />
              {board.lists.length} lists
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#dbe2ff] px-3 py-1 font-medium text-[#1f2a60]">
              <Users className="h-4 w-4 text-[#3945cc]" aria-hidden="true" />
              {board.memberCount} members
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#f0f2ff] px-3 py-1 font-medium text-[#1f2a60]">
              {totalCards} cards
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8">
        <section className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Board lists</h2>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-[#4f5dff] px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#3b49de]">
              <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
              Board settings
            </button>
          </div>
        </section>

        <section className="flex gap-6 overflow-x-auto pb-4">
          {board.lists.map((list) => (
            <div
              key={list.id}
              onDragOver={handleDragOver}
              onDrop={(event) => handleDropOnList(list.id, event)}
              className="flex w-72 shrink-0 flex-col gap-4 rounded-3xl border border-[#d5dcff] bg-[#fbfcff] px-5 py-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-[#1f2a60]">{list.name}</h3>
                <button className="rounded-full border border-transparent bg-[#4f5dff] p-1.5 text-white shadow-sm transition-colors hover:bg-[#3b49de]">
                  <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">List options</span>
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {list.cards.map((card, index) => (
                  <div
                    key={card.id}
                    draggable
                    onDragStart={(event) => handleDragStart(list.id, card.id, event)}
                    onDragEnd={handleDragEnd}
                    onDragOver={handleDragOver}
                    onDrop={(event) => handleDropOnCard(list.id, index, event)}
                    className="cursor-grab rounded-2xl border border-[#d1d8ff] bg-white px-4 py-4 text-left shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-lg active:cursor-grabbing"
                  >
                    <h4 className="text-sm font-semibold text-[#1f2550]">{card.title}</h4>
                    {card.description ? (
                      <p className="mt-1 text-xs text-slate-500">{card.description}</p>
                    ) : null}
                  </div>
                ))}
              </div>

              {activeListIdForCard === list.id ? (
                <div className="mt-1 space-y-3">
                  <input
                    autoFocus
                    value={cardDrafts[list.id] ?? ''}
                    onChange={(event) =>
                      setCardDrafts((prev) => ({ ...prev, [list.id]: event.target.value }))
                    }
                    placeholder="Card title"
                    className="w-full rounded-xl border border-[#c3ccff] px-3 py-2 text-sm text-slate-700 shadow-inner focus:border-[#4f5dff] focus:outline-none focus:ring-2 focus:ring-[#4f5dff]/40"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAddCard(list.id)}
                      className="rounded-xl border border-transparent bg-[#4f5dff] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#3b49de]"
                    >
                      Add Card
                    </button>
                    <button
                      onClick={handleCancelAddCard}
                      className="rounded-xl border border-transparent bg-[#1f2a60] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0f173f]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setActiveListIdForCard(list.id);
                    setCardDrafts((prev) => ({ ...prev, [list.id]: '' }));
                  }}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-[#c3ccff] bg-[#4f5dff] px-4 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:border-[#3b49de] hover:bg-[#3b49de]"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Add Card
                </button>
              )}
            </div>
          ))}

          <div className="flex w-72 shrink-0 flex-col gap-3 rounded-3xl border border-dashed border-[#c3ccff] bg-white px-5 py-5 shadow-sm">
            {isAddingList ? (
              <>
                <input
                  autoFocus
                  value={listDraftName}
                  onChange={(event) => setListDraftName(event.target.value)}
                  placeholder="List name"
                  className="w-full rounded-xl border border-[#c3ccff] px-3 py-2 text-sm text-slate-700 shadow-inner focus:border-[#4f5dff] focus:outline-none focus:ring-2 focus:ring-[#4f5dff]/40"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAddList}
                    className="rounded-xl bg-[#4f5dff] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#3b49de]"
                  >
                    Add List
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingList(false);
                      setListDraftName('');
                    }}
                    className="rounded-xl border border-transparent bg-[#1f2a60] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0f173f]"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => setIsAddingList(true)}
                className="flex h-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#c3ccff] bg-[#4f5dff] text-sm font-medium text-white shadow-sm transition-colors hover:border-[#3b49de] hover:bg-[#3b49de]"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add a list
              </button>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
