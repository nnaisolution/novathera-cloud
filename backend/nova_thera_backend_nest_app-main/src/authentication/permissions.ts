import { createAccessControl } from 'better-auth/plugins/access';
import { adminAc, defaultStatements } from 'better-auth/plugins/admin/access';

export const statement = {
  ...defaultStatements,
  location: ['create', 'read', 'update', 'delete'],
  employee: ['create', 'read', 'update', 'delete'],
  service: ['create', 'read', 'update', 'delete'],
  booking: ['create', 'read', 'reschedule', 'cancel', 'setStatus'],
  payment: ['read'],
  brand: ['create', 'read', 'update', 'delete'],
  product: ['create', 'read', 'update', 'delete'],
  order: ['create', 'read', 'update', 'delete', 'setStatus'],
  discount: ['create', 'read', 'update', 'delete'],
  shipping: ['create', 'read', 'update', 'delete'],
  document: ['create', 'read', 'update', 'delete'],
  analytics: ['read'],
  setting: ['read', 'update'],
  audit: ['read'],
} as const;

export const ac = createAccessControl(statement);

export const admin = ac.newRole({
  ...adminAc.statements,
  location: ['create', 'read', 'update', 'delete'],
  employee: ['create', 'read', 'update', 'delete'],
  service: ['create', 'read', 'update', 'delete'],
  booking: ['create', 'read', 'reschedule', 'cancel', 'setStatus'],
  payment: ['read'],
  brand: ['create', 'read', 'update', 'delete'],
  product: ['create', 'read', 'update', 'delete'],
  order: ['create', 'read', 'update', 'delete', 'setStatus'],
  discount: ['create', 'read', 'update', 'delete'],
  shipping: ['create', 'read', 'update', 'delete'],
  document: ['create', 'read', 'update', 'delete'],
  analytics: ['read'],
  setting: ['read', 'update'],
  audit: ['read'],
});

export const manager = ac.newRole({
  location: ['read'],
  employee: ['create', 'read', 'update'],
  service: ['create', 'read', 'update'],
  booking: ['create', 'read', 'reschedule', 'cancel', 'setStatus'],
  payment: ['read'],
  brand: ['create', 'read', 'update', 'delete'],
  product: ['create', 'read', 'update', 'delete'],
  order: ['create', 'read', 'update', 'delete', 'setStatus'],
  discount: ['create', 'read', 'update', 'delete'],
  shipping: ['create', 'read', 'update', 'delete'],
  document: ['create', 'read', 'update', 'delete'],
  analytics: ['read'],
  setting: ['read'],
});

export const staff = ac.newRole({
  location: ['read'],
  employee: ['read'],
  service: ['read'],
  booking: ['read', 'setStatus'],
  brand: ['read'],
  product: ['read'],
  order: ['read'],
  document: ['read'],
});

export const receptionist = ac.newRole({
  location: ['read'],
  employee: ['read'],
  service: ['read'],
  booking: ['read'],
});

export const customer = ac.newRole({
  // Customers do not use the admin app. No admin-side permissions.
});

export const roles = { admin, manager, staff, receptionist, customer };
