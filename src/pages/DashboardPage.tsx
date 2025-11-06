import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthProvider';
import { useWorkspaceData } from '@/features/workspaces/WorkspaceDataProvider';
import type { Board, Workspace } from '@/features/workspaces/data';
import { Plus, Users, ChevronDown, LayoutDashboard, KanbanSquare, List, LogOut, Check } from 'lucide-react';

type SidebarBoard = {
  id: string;
  name: string;
  isPrimary?: boolean;
  listCount?: number;
};

const formatLists = (listCount: number): string =>
  `${listCount} ${listCount === 1 ? 'list' : 'lists'}`;

const getUserDisplayName = (email?: string, name?: string): string => {
  if (name && name.trim().length > 0) {
    return name;
  }

  if (!email) {
    return 'Guest';
  }

  const [local] = email.split('@');
  return local.charAt(0).toUpperCase() + local.slice(1);
};

const createWorkspace = (name: string, description: string): Workspace => ({
  id: `workspace-${Date.now()}`,
  name,
  description,
  boards: [],
});

const createBoard = (workspaceId: string, name: string, description: string): Board => ({
  id: `${workspaceId}-board-${Date.now()}`,
  name,
  description,
  memberCount: 1,
  lists: [],
});

export default function DashboardPage(): React.JSX.Element {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { workspaces, addWorkspace, addBoard } = useWorkspaceData();

  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>(workspaces[0]?.id ?? '');
  const [activeSidebarId, setActiveSidebarId] = useState<string>('all');
  const [isWorkspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);

  useEffect(() => {
    if (workspaces.length === 0) {
      setSelectedWorkspaceId('');
      return;
    }

    if (!selectedWorkspaceId) {
      setSelectedWorkspaceId(workspaces[0].id);
      return;
    }

    const stillExists = workspaces.some((workspace) => workspace.id === selectedWorkspaceId);
    if (!stillExists) {
      setSelectedWorkspaceId(workspaces[0].id);
    }
  }, [selectedWorkspaceId, workspaces]);

  const currentWorkspace = useMemo(
    () => workspaces.find((workspace) => workspace.id === selectedWorkspaceId),
    [selectedWorkspaceId, workspaces]
  );

  useEffect(() => {
    if (!currentWorkspace) {
      setActiveSidebarId('all');
      return;
    }

    if (activeSidebarId !== 'all') {
      const exists = currentWorkspace.boards.some((board) => board.id === activeSidebarId);
      if (!exists) {
        setActiveSidebarId('all');
      }
    }
  }, [activeSidebarId, currentWorkspace]);

  const sidebarBoards: SidebarBoard[] = useMemo(() => {
    if (!currentWorkspace) {
      return [{ id: 'all', name: 'All Boards', isPrimary: true }];
    }

    return [
      { id: 'all', name: 'All Boards', isPrimary: true },
      ...currentWorkspace.boards.map((board) => ({
        id: board.id,
        name: board.name,
        listCount: board.lists.length,
      })),
    ];
  }, [currentWorkspace]);

  const displayedWorkspaces = useMemo(
    () =>
      workspaces.map((workspace) => ({
        ...workspace,
        boards: workspace.boards
          .slice()
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((board) => ({ ...board })),
      })),
    [workspaces]
  );

  const userDisplayName = getUserDisplayName(user?.email, user?.name);
  const userInitial = userDisplayName.charAt(0).toUpperCase();

  const handleSelectWorkspace = (workspaceId: string) => {
    setSelectedWorkspaceId(workspaceId);
    setActiveSidebarId('all');
    setWorkspaceMenuOpen(false);
  };

  const handleSelectSidebar = (boardId: string) => {
    setActiveSidebarId(boardId);
    if (boardId !== 'all') {
      navigate(`/boards/${boardId}`);
    }
  };

  const handleAddWorkspace = () => {
    const name = window.prompt('Workspace name');
    if (!name) {
      return;
    }

    const description = window.prompt('Workspace description') ?? 'New workspace';
    const newWorkspace = createWorkspace(name.trim(), description.trim());
    addWorkspace(newWorkspace);
    setSelectedWorkspaceId(newWorkspace.id);
    setActiveSidebarId('all');
    setWorkspaceMenuOpen(false);
  };

  const handleAddBoard = (workspaceId: string) => {
    const name = window.prompt('Board name');
    if (!name) {
      return;
    }

    const description = window.prompt('Board description') ?? 'New board';
    const newBoard = createBoard(workspaceId, name.trim(), description.trim());
    addBoard(workspaceId, newBoard);
    setActiveSidebarId(newBoard.id);
    navigate(`/boards/${newBoard.id}`);
  };

  const handleBoardCardClick = (boardId: string) => {
    setActiveSidebarId(boardId);
    navigate(`/boards/${boardId}`);
  };

  return (
    <div className="min-h-screen bg-[#eef2ff] text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 flex-col border-r border-slate-900/40 bg-slate-950/95 text-slate-100 lg:flex">
          <div className="relative px-6 pb-4 pt-6">
            <button
              onClick={() => setWorkspaceMenuOpen((open) => !open)}
              className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-left shadow-sm transition-all hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9b86ff]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4f5dff] text-white">
                    <KanbanSquare className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {currentWorkspace?.name ?? 'No workspace'}
                    </p>
                    <p className="text-xs text-slate-400">
                      {currentWorkspace?.description ?? 'Create your first workspace'}
                    </p>
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400" aria-hidden="true" />
              </div>
            </button>

            {isWorkspaceMenuOpen ? (
              <div className="absolute left-6 right-6 top-[calc(100%+0.75rem)] z-10 overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-900/95 shadow-xl">
                <ul className="divide-y divide-slate-800/60">
                  {workspaces.map((workspace) => {
                    const isActive = workspace.id === currentWorkspace?.id;
                    return (
                      <li key={workspace.id}>
                        <button
                          onClick={() => handleSelectWorkspace(workspace.id)}
                          className={`flex w-full items-center justify-between px-4 py-3 text-sm transition-colors ${
                            isActive ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800/70'
                          }`}
                        >
                          <div className="flex flex-col text-left">
                            <span className="font-semibold">{workspace.name}</span>
                            <span className="text-xs text-slate-400">{workspace.description}</span>
                          </div>
                          {isActive ? <Check className="h-4 w-4 text-[#9b86ff]" aria-hidden="true" /> : null}
                        </button>
                      </li>
                    );
                  })}
                  <li>
                    <button
                      onClick={handleAddWorkspace}
                      className="flex w-full items-center gap-2 px-4 py-3 text-sm font-semibold text-[#9b86ff] transition-colors hover:bg-slate-800/80"
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                      New workspace
                    </button>
                  </li>
                </ul>
              </div>
            ) : null}
          </div>

          <nav className="flex-1 space-y-8 px-6 pb-10 pt-6">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Navigation</p>
              <button className="flex w-full items-center gap-3 rounded-xl bg-slate-900/60 px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9b86ff]">
                <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                Dashboard
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Boards</p>
              <ul className="space-y-2">
                {sidebarBoards.map((board) => {
                  const isActive = board.id === activeSidebarId;
                  return (
                    <li key={board.id}>
                      <button
                        onClick={() => handleSelectSidebar(board.id)}
                        className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm transition-colors ${
                          isActive
                            ? 'border-[#b19bff] bg-slate-800 text-white shadow-lg ring-2 ring-[#b19bff]/80'
                            : 'border-transparent bg-transparent text-slate-300 hover:bg-slate-900/40'
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900/70 text-[#9b86ff]">
                            <KanbanSquare className="h-4 w-4" aria-hidden="true" />
                          </span>
                          {board.name}
                        </span>
                        {board.listCount ? (
                          <span className="text-xs text-slate-400">{formatLists(board.listCount)}</span>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </nav>

          <div className="mt-auto border-t border-slate-800/60 px-6 py-6">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-base font-semibold text-slate-200">
                {userInitial}
              </span>
              <div className="min-w-0 text-sm">
                <p className="truncate font-semibold text-white">{userDisplayName}</p>
                <p className="truncate text-xs text-slate-400">{user?.email ?? 'user@example.com'}</p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900/70 px-3 py-2 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9b86ff]"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              Log out
            </button>
          </div>
        </aside>

        <main className="flex-1">
          <div className="border-b border-slate-200/70 bg-[#f8faff]/80 backdrop-blur">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-7">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
                <p className="text-sm text-slate-500">Manage your workspaces and boards</p>
              </div>
              <button
                onClick={handleAddWorkspace}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9b86ff]"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                New Workspace
              </button>
            </div>
          </div>

          <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-10">
            {displayedWorkspaces.map((workspace) => (
              <section key={workspace.id} className="space-y-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div className="flex items-start gap-3">
                    <span className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-[#4f5dff] text-white">
                      <KanbanSquare className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900">{workspace.name}</h2>
                      <p className="text-sm text-slate-500">{workspace.description}</p>
                      <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                        {workspace.boards.length} {workspace.boards.length === 1 ? 'board' : 'boards'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddBoard(workspace.id)}
                    className="inline-flex items-center gap-2 self-start rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9b86ff]"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Add Board
                  </button>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {workspace.boards.length === 0 ? (
                    <p className="rounded-3xl border border-dashed border-slate-300 bg-white/80 px-6 py-12 text-center text-sm text-slate-500">
                      No boards yet. Add one to get started.
                    </p>
                  ) : null}

                  {workspace.boards.map((board) => {
                    const isHighlighted = board.id === activeSidebarId;
                    return (
                      <article
                        key={board.id}
                        onClick={() => handleBoardCardClick(board.id)}
                        className={`flex cursor-pointer flex-col justify-between rounded-3xl border bg-white px-6 py-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg ${
                          isHighlighted
                            ? 'border-[#b19bff] ring-2 ring-[#b19bff]/70'
                            : 'border-slate-200/70'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2 text-sm font-semibold text-[#4f5dff]">
                            <KanbanSquare className="h-4 w-4" aria-hidden="true" />
                            Board
                          </div>
                          <h3 className="mt-2 text-lg font-semibold text-slate-900">{board.name}</h3>
                          <p className="mt-1 text-sm text-slate-500">{board.description}</p>
                        </div>
                        <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
                          <span className="inline-flex items-center gap-1 font-medium">
                            <List className="h-4 w-4 text-slate-400" aria-hidden="true" />
                            {formatLists(board.lists.length)}
                          </span>
                          <span className="inline-flex items-center gap-1 font-medium">
                            <Users className="h-4 w-4 text-slate-400" aria-hidden="true" />
                            {board.memberCount}
                          </span>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
