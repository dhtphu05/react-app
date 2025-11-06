import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Board, Workspace } from './data';
import { initialWorkspaces } from './data';

type WorkspaceDataContextValue = {
  workspaces: Workspace[];
  addWorkspace: (workspace: Workspace) => void;
  addBoard: (workspaceId: string, board: Board) => void;
  updateBoard: (boardId: string, updater: (board: Board) => Board) => void;
};

const WorkspaceDataContext = createContext<WorkspaceDataContextValue | undefined>(undefined);

export function WorkspaceDataProvider({ children }: { children: ReactNode }): JSX.Element {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(initialWorkspaces);

  const addWorkspace = useCallback((workspace: Workspace) => {
    setWorkspaces((prev) => [...prev, workspace]);
  }, []);

  const addBoard = useCallback((workspaceId: string, board: Board) => {
    setWorkspaces((prev) =>
      prev.map((workspace) => {
        if (workspace.id !== workspaceId) {
          return workspace;
        }
        return {
          ...workspace,
          boards: [...workspace.boards, board],
        };
      })
    );
  }, []);

  const updateBoard = useCallback((boardId: string, updater: (board: Board) => Board) => {
    setWorkspaces((prev) =>
      prev.map((workspace) => {
        const boardIndex = workspace.boards.findIndex((board) => board.id === boardId);
        if (boardIndex === -1) {
          return workspace;
        }

        const boardToUpdate = workspace.boards[boardIndex];
        if (!boardToUpdate) {
          return workspace;
        }

        const updatedBoards = workspace.boards.slice();
        updatedBoards[boardIndex] = updater(boardToUpdate);

        return {
          ...workspace,
          boards: updatedBoards,
        };
      })
    );
  }, []);

  const value = useMemo(
    () => ({
      workspaces,
      addWorkspace,
      addBoard,
      updateBoard,
    }),
    [addBoard, addWorkspace, updateBoard, workspaces]
  );

  return <WorkspaceDataContext.Provider value={value}>{children}</WorkspaceDataContext.Provider>;
}

export function useWorkspaceData(): WorkspaceDataContextValue {
  const context = useContext(WorkspaceDataContext);
  if (!context) {
    throw new Error('useWorkspaceData must be used within a WorkspaceDataProvider');
  }
  return context;
}
