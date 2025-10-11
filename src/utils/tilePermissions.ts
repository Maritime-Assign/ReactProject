// Three defined roles: admin / dispatch / viewer
// on supabase admin = admin, dispatch = dispatch, viewer = display

type UserRole = 'admin' | 'dispatch' | 'display';

// define which tiles will show per role
const roleTiles: Record<UserRole, string[]> = {
    // all permissions for admin
    admin: ['manageJobs', 'addJobListing', 'viewJobBoard', 'viewChanges', 'manageUsers', 'addUser'],
    // Dispatch only has job management
    dispatch: ['manageJobs', 'addJobListing', 'viewChanges', 'viewJobBoard'],
    // Viewer can only view the job board
    display: ['viewJobBoard'],
};

export function getRoleTiles(role: UserRole) {
    return roleTiles[role] || [];
}