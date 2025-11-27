import { useMemo, useState, type ReactNode } from "react";
import {
    WorkspaceBoardsContext,
    WorkspaceContext,
    WorkspaceDisplayContext,
    WorkspaceSearchQueryContext,
    WorkspaceSortByContext,
    WorkspaceViewModeContext,
} from "./context";
import type { SortOption, ViewMode } from "./types";
import type { Board } from "@/shared/lib/types";

type WorkspaceProviderProps = {
    boards: Board[];
    children: ReactNode;
};

export function WorkspaceProvider({
    boards,
    children,
}: WorkspaceProviderProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<SortOption>("recent");
    const [viewMode, setViewMode] = useState<ViewMode>("grid");

    const filteredAndSortedBoards = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLowerCase();
        const filtered = normalizedQuery
            ? boards.filter((board) => {
                  const title = board.title.toLowerCase();
                  const description = board.description?.toLowerCase() ?? "";
                  return (
                      title.includes(normalizedQuery) ||
                      description.includes(normalizedQuery)
                  );
              })
            : boards;

        switch (sortBy) {
            case "az":
                return [...filtered].sort((a, b) =>
                    a.title.localeCompare(b.title)
                );
            case "za":
                return [...filtered].sort((a, b) =>
                    b.title.localeCompare(a.title)
                );
            case "recent":
                return [...filtered].sort(
                    (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                );
            case "oldest":
                return [...filtered].sort(
                    (a, b) =>
                        new Date(a.createdAt).getTime() -
                        new Date(b.createdAt).getTime()
                );
            default:
                return filtered;
        }
    }, [boards, searchQuery, sortBy]);

    const stateValue = useMemo(
        () => ({
            searchQuery,
            sortBy,
            viewMode,
            boards: filteredAndSortedBoards,
        }),
        [filteredAndSortedBoards, searchQuery, sortBy, viewMode]
    );

    const actionsValue = useMemo(
        () => ({
            setSearchQuery,
            setSortBy,
            setViewMode,
        }),
        [setSearchQuery, setSortBy, setViewMode]
    );

    return (
        <WorkspaceDisplayContext.Provider value={actionsValue}>
            <WorkspaceSearchQueryContext.Provider value={searchQuery}>
                <WorkspaceSortByContext.Provider value={sortBy}>
                    <WorkspaceViewModeContext.Provider value={viewMode}>
                        <WorkspaceBoardsContext.Provider
                            value={filteredAndSortedBoards}
                        >
                            <WorkspaceContext.Provider value={stateValue}>
                                {children}
                            </WorkspaceContext.Provider>
                        </WorkspaceBoardsContext.Provider>
                    </WorkspaceViewModeContext.Provider>
                </WorkspaceSortByContext.Provider>
            </WorkspaceSearchQueryContext.Provider>
        </WorkspaceDisplayContext.Provider>
    );
}
