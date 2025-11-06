export type BoardCard = {
  id: string;
  title: string;
  description: string;
  assignee?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
};

export type BoardList = {
  id: string;
  name: string;
  cards: BoardCard[];
};

export type Board = {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  lists: BoardList[];
};

export type Workspace = {
  id: string;
  name: string;
  description: string;
  boards: Board[];
};

export const initialWorkspaces: Workspace[] = [
  {
    id: 'company',
    name: 'Company Workspace',
    description: 'Main company workspace',
    boards: [
      {
        id: 'project-alpha',
        name: 'Project Alpha',
        description: 'Main project board',
        memberCount: 2,
        lists: [
          {
            id: 'company-personal-tasks',
            name: 'Personal Tasks',
            cards: [
              {
                id: 'personal-tasks-card-1',
                title: 'Learn React 19',
                description: 'Study new React 19 features',
                assignee: {
                  id: 'user-1',
                  name: 'Alex Moss',
                },
              },
            ],
          },
          {
            id: 'company-in-progress',
            name: 'In Progress',
            cards: [
              {
                id: 'in-progress-card-1',
                title: 'Prepare sprint backlog',
                description: 'Collect stories for the next sprint',
                assignee: {
                  id: 'user-2',
                  name: 'Taylor Hill',
                },
              },
            ],
          },
          {
            id: 'company-done',
            name: 'Done',
            cards: [
              {
                id: 'done-card-1',
                title: 'Retro meeting notes',
                description: 'Summarize last sprint learnings',
              },
            ],
          },
        ],
      },
      {
        id: 'marketing-campaign',
        name: 'Marketing Campaign',
        description: 'Q4 Marketing initiatives',
        memberCount: 2,
        lists: [
          {
            id: 'marketing-ideas',
            name: 'Ideas',
            cards: [
              {
                id: 'marketing-card-1',
                title: 'Holiday launch teaser',
                description: 'Brainstorm teaser ideas for holiday launch',
              },
            ],
          },
          {
            id: 'marketing-approved',
            name: 'Approved',
            cards: [],
          },
          {
            id: 'marketing-live',
            name: 'Live',
            cards: [],
          },
        ],
      },
    ],
  },
  {
    id: 'personal',
    name: 'Personal Projects',
    description: 'Personal project workspace',
    boards: [
      {
        id: 'personal-todo',
        name: 'Personal Todo',
        description: 'Personal tasks and goals',
        memberCount: 1,
        lists: [
          {
            id: 'personal-tasks',
            name: 'Personal Tasks',
            cards: [
              {
                id: 'personal-card-1',
                title: 'Update portfolio',
                description: 'Add new case studies to personal site',
              },
            ],
          },
          {
            id: 'personal-in-progress',
            name: 'In Progress',
            cards: [],
          },
          {
            id: 'personal-completed',
            name: 'Completed',
            cards: [],
          },
        ],
      },
    ],
  },
];
