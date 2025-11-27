import { useState } from "react";
import { useParams } from "react-router";
import { useBoardStore } from "@/shared/stores/useBoardStore";
import { CreateBoardDialog } from "@/shared/components/CreateBoardDialog";
import { WorkspaceFilter } from "@/features/workspace/ui/workspace-filter";
import { WorkspaceProvider } from "@/features/workspace/ui/workspace-context";
import { WorkspaceDisplay } from "@/features/workspace/ui/workspace-display";
import { WorkspaceProvider } from "@/features/workspace/shared/WorkspaceProvider";

export function WorkspacePage() {
    console.log("%c hehe" , "color:red");

    console.log("WorkspacePage rendered");

    const { workspaceId } = useParams<{ workspaceId: string }>();
    const { boards, workspaces } = useBoardStore();

    const [isCreateBoardOpen, setIsCreateBoardOpen] = useState(false);

    // Get current workspace
    const currentWorkspace = Object.values(workspaces).find(
        (w) => w.id === workspaceId
    );
    // Get boards for this workspace
    const workspaceBoards = boards.filter(
        (board) => board.workspaceId === workspaceId
    );

    if (!currentWorkspace) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Workspace not found
                    </h2>
                    <p className="text-gray-600">
                        The workspace you're looking for doesn't exist.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <WorkspaceProvider>
            <div className="flex-1 space-y-6 p-8 pt-6">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">
                        {currentWorkspace.name}
                    </h1>
                    {currentWorkspace.description && (
                        <p className="text-muted-foreground">
                            {currentWorkspace.description}
                        </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                        {workspaceBoards.length} board
                        {workspaceBoards.length !== 1 ? "s" : ""} total
                    </p>
                </div>

                <WorkspaceFilter />

                <WorkspaceDisplay
                    setIsCreateBoardOpen={setIsCreateBoardOpen}
                />

                {/* Create Board Dialog */}
                <CreateBoardDialog
                    open={isCreateBoardOpen}
                    onOpenChange={setIsCreateBoardOpen}
                    workspaceId={workspaceId}
                />
            </div>
        </WorkspaceProvider>
    );
}
