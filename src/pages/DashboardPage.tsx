import React from 'react';
import { useAuth } from '@/features/auth/AuthProvider';
import { Plus, User, LogOut, Settings, Star } from 'lucide-react';

type Board = {
  id: number;
  name: string;
  tone: string;
};

type Workspace = {
  id: number;
  name: string;
  boards: Board[];
};

const boardTones = [
  'bg-gray-900 text-white shadow-md',
  'bg-white text-gray-900 border border-gray-200 shadow-sm',
  'bg-gray-50 text-gray-900 border border-gray-200 shadow-sm',
  'bg-gray-800 text-white shadow-md',
  'bg-white text-gray-900 border border-gray-200 shadow-sm',
  'bg-gray-700 text-white shadow-md',
];

const pickTone = (index: number): string => boardTones[index % boardTones.length];

export default function DashboardPage(): React.JSX.Element {
  const { user, signOut } = useAuth();

  const workspaces: Workspace[] = [
    {
      id: 1,
      name: 'Personal Workspace',
      boards: [
        { id: 1, name: 'Project Planning', tone: pickTone(0) },
        { id: 2, name: 'Team Tasks', tone: pickTone(1) },
        { id: 3, name: 'Ideas & Notes', tone: pickTone(2) },
      ],
    },
    {
      id: 2,
      name: 'Work Projects',
      boards: [
        { id: 4, name: 'Sprint Board', tone: pickTone(3) },
        { id: 5, name: 'Bug Tracking', tone: pickTone(4) },
      ],
    },
  ];

  const recentBoards: Array<Board & { workspace: string }> = [
    { id: 1, name: 'Project Planning', workspace: 'Personal Workspace', tone: pickTone(0) },
    { id: 4, name: 'Sprint Board', workspace: 'Work Projects', tone: pickTone(3) },
    { id: 2, name: 'Team Tasks', workspace: 'Personal Workspace', tone: pickTone(1) },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="border-b border-gray-200">
        <div className="w-full max-w-screen-xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Trello</h1>
            <button className="inline-flex items-center justify-center rounded-full border border-gray-300 p-2 text-gray-600 hover:bg-gray-100 transition-colors">
              <Settings className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">Cài đặt</span>
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-white">
                <User className="h-4 w-4" aria-hidden="true" />
              </span>
              {user ? (
                <span className="text-sm font-medium text-gray-800">{user.email}</span>
              ) : null}
            </div>

            <button
              onClick={signOut}
              className="inline-flex items-center gap-2 rounded-full border border-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 hover:text-white transition-colors"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </header>

      <main className="w-full max-w-screen-xl mx-auto px-6 py-10">
        <section className="w-full mb-10">
          <h2 className="text-3xl font-semibold mb-2">Chào mừng trở lại!</h2>
          <p className="text-gray-600">
            Quản lý các dự án và công việc của bạn một cách hiệu quả.
          </p>
        </section>

        <section className="mb-12">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2 text-gray-900">
              <Star className="h-5 w-5 text-gray-700" aria-hidden="true" />
              <h3 className="text-xl font-medium">Bảng gần đây</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
            {recentBoards.map((board) => (
              <article
                key={board.id}
                className={`rounded-2xl p-5 transition-transform hover:-translate-y-1 ${board.tone}`}
              >
                <h4 className="text-lg font-semibold mb-2">{board.name}</h4>
                <p className="text-sm opacity-80">{board.workspace}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-12">
          <h3 className="text-xl font-medium text-gray-900">Không gian làm việc</h3>
          {workspaces.map((workspace) => (
            <div key={workspace.id} className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h4 className="text-lg font-semibold text-gray-800">{workspace.name}</h4>
                <button className="inline-flex items-center gap-2 rounded-full border border-gray-800 px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-900 hover:text-white transition-colors">
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  <span>Tạo bảng mới</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
                {workspace.boards.map((board) => (
                  <article
                    key={board.id}
                    className={`rounded-2xl p-5 transition-transform hover:-translate-y-1 min-h-[120px] flex items-end ${board.tone}`}
                  >
                    <h5 className="text-lg font-semibold">{board.name}</h5>
                  </article>
                ))}

                <article className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-5 text-center transition-colors hover:border-gray-500 min-h-[120px] flex flex-col items-center justify-center">
                  <Plus className="h-8 w-8 text-gray-500 mb-2" aria-hidden="true" />
                  <span className="text-sm font-medium text-gray-700">Tạo bảng mới</span>
                </article>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
