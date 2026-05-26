// --------------------------------------------------------
// DATOS MOCK INICIALES
// --------------------------------------------------------
export const MOCK_CHANNELS = [
    {id: 102, title: "feat: Implement JWT validation", repo: "api-backend", unread: 2, isActive: true},
    {id: 98, title: "fix: Mobile nav overflow", repo: "frontend-app", unread: 0, isActive: false},
    {id: 95, title: "chore: Update dependencies", repo: "api-backend", unread: 0, isActive: false},
];

export const MOCK_PR_DATA = {
    title: "Implement JWT validation for login",
    prNumber: 102,
    author: "dev-juan",
    status: "open",
    branch: "feature/jwt-auth",
};

export const MOCK_DIFF_LINES = [
    {id: 'h1', type: 'header', content: '@@ -15,7 +15,7 @@ function validateSession(req, res) {'},
    {id: 'L15', type: 'context', oldL: 15, newL: 15, content: '  const user = req.user;'},
    {id: 'L16-del', type: 'remove', oldL: 16, newL: null, content: '- const isAuthenticated = user !== null;'},
    {
        id: 'L16-add',
        type: 'add',
        oldL: null,
        newL: 16,
        content: '+ const isAuthenticated = user !== null && !user.isExpired;'
    },
    {id: 'L17', type: 'context', oldL: 17, newL: 17, content: '  '},
    {id: 'L18', type: 'context', oldL: 18, newL: 18, content: '  if (!isAuthenticated) {'},
    {
        id: 'L19',
        type: 'context',
        oldL: 19,
        newL: 19,
        content: '    return res.status(401).json({ error: "Unauthorized" });'
    },
];

export const INITIAL_MESSAGES = [
    {
        id: 1, author: "System", content: "dev-juan requested a review from you",
        timestamp: "2 hours ago", type: "system-event", icon: "request", avatar: "SJ"
    }
];

export const INITIAL_INLINE_COMMENTS = [
    {
        id: 999, lineId: 'L16-add', author: "dev-juan", avatar: "DJ",
        content: "I added the extra validation here. Do you think it’s okay to handle it in this layer, or should we move it to the service?",
        timestamp: "15 mins ago"
    }
];