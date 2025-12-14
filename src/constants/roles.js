export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  MANAGER: 'manager',
};

export const ROLE_LABELS = {
  admin: 'Administrator',
  user: 'User',
  manager: 'Manager',
};

export const PERMISSIONS = {
  // Invoice permissions
  CREATE_INVOICE: ['admin', 'manager', 'user'],
  EDIT_INVOICE: ['admin', 'manager', 'user'],
  DELETE_INVOICE: ['admin', 'manager'],
  VIEW_INVOICE: ['admin', 'manager', 'user'],
  
  // Master item permissions
  CREATE_ITEM: ['admin', 'manager'],
  EDIT_ITEM: ['admin', 'manager'],
  DELETE_ITEM: ['admin'],
  VIEW_ITEM: ['admin', 'manager', 'user'],
  
  // Settings permissions
  MANAGE_SETTINGS: ['admin'],
  VIEW_SETTINGS: ['admin', 'manager'],
  
  // User management
  MANAGE_USERS: ['admin'],
  VIEW_USERS: ['admin', 'manager'],
};

export function hasPermission(userRole, permission) {
  return PERMISSIONS[permission]?.includes(userRole) || false;
}