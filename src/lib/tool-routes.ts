export const toolRoutes = {
  index: '/tools/',
  onePaper: {
    home: '/tools/onepaper/',
    livePreview: '/tools/onepaper/live-preview/',
    editor: (projectId: string) => `/tools/onepaper/editor/${encodeURIComponent(projectId)}`,
  },
} as const;
