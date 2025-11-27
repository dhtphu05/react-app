import { Search, Plus, Kanban } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { BoardCard } from "@/features/dashboard/ui/boad-card";
import {
    WorkspaceBoardsContext,
    WorkspaceSearchQueryContext,
    WorkspaceViewModeContext,
} from "../shared/context";
import { useContext } from "react";

export function WorkspaceDisplay({
    setIsCreateBoardOpen,
}: {
    setIsCreateBoardOpen: (open: boolean) => void;
}) {
    console.log("%cWorkspaceDisplay rendered", "color: yellow");

    const searchQuery = useContext(WorkspaceSearchQueryContext);
    const viewMode = useContext(WorkspaceViewModeContext);
    const filteredAndSortedBoards = useContext(WorkspaceBoardsContext);

    return (
        <>
            {/* Results Info */}
            {searchQuery && (
                <div className="text-sm text-muted-foreground">
                    {filteredAndSortedBoards.length} result
                    {filteredAndSortedBoards.length !== 1 ? "s" : ""} for "
                    {searchQuery}"
                </div>
            )}

            {/* Boards Grid/List */}
            {filteredAndSortedBoards.length === 0 && !searchQuery ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Search className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                            No boards in this workspace
                        </h3>
                        <p className="text-muted-foreground text-center mb-4">
                            Create your first board to get started with this
                            workspace.
                        </p>
                        <Button onClick={() => setIsCreateBoardOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Board
                        </Button>
                    </CardContent>
                </Card>
            ) : searchQuery && filteredAndSortedBoards.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Search className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                            No boards found
                        </h3>
                        <p className="text-muted-foreground text-center">
                            No boards match "{searchQuery}". Try adjusting your
                            search terms.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div
                    className={
                        viewMode === "grid"
                            ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                            : "space-y-4"
                    }
                >
                    {/* Existing Boards */}
                    {filteredAndSortedBoards.map((board) =>
                        viewMode === "grid" ? (
                            <BoardCard key={board.id} board={board} />
                        ) : (
                            <Card
                                key={board.id}
                                className="cursor-pointer hover:shadow-md transition-shadow"
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                                <Kanban className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">
                                                    {board.title}
                                                </h3>
                                                {board.description && (
                                                    <p className="text-sm text-muted-foreground">
                                                        {board.description}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                                                    <span>
                                                        {board.listIds.length}{" "}
                                                        lists
                                                    </span>
                                                    <span>
                                                        {board.members.length}{" "}
                                                        members
                                                    </span>
                                                    <span>
                                                        Created{" "}
                                                        {new Date(
                                                            board.createdAt
                                                        ).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    )}

                    {/* Add New Board Card - Only show when not searching */}
                    {!searchQuery &&
                        (viewMode === "grid" ? (
                            <Card
                                className="border-dashed border-2 border-gray-300 hover:border-gray-400 transition-colors cursor-pointer"
                                onClick={() => setIsCreateBoardOpen(true)}
                            >
                                <CardContent className="flex flex-col items-center justify-center h-full p-6 min-h-[180px]">
                                    <Plus className="w-8 h-8 text-gray-400 mb-2" />
                                    <p className="text-gray-500 text-center font-medium">
                                        Create new board
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card
                                className="border-dashed border-2 border-gray-300 hover:border-gray-400 transition-colors cursor-pointer"
                                onClick={() => setIsCreateBoardOpen(true)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                                            <Plus className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-500">
                                                Create new board
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                Add a new board to this
                                                workspace
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                </div>
            )}
        </>
    );
}
