export const NOTIFICATION_TYPES = {
  LEAVE_APPROVED: 'leave_approved',
  LEAVE_REJECTED: 'leave_rejected',
  LEAVE_APPLIED: 'leave_applied',
  REVIEW_ASSIGNED: 'review_assigned',
  KPI_MILESTONE: 'kpi_milestone',
  SYSTEM_ALERT: 'system_alert',
  NEW_MESSAGE: 'new_message',
  USER_MENTION: 'user_mention',
  DOCUMENT_UPLOADED: 'document_uploaded'
};

export const NOTIFICATION_PRIORITIES = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

export const NOTIFICATION_PREFERENCES = {
  EMAIL: 'email',
  PUSH: 'push',
  IN_APP: 'in_app',
  SMS: 'sms'
};

export const WEB_SOCKET_EVENTS = {
  NOTIFICATION_CREATED: 'notification_created',
  NOTIFICATION_READ: 'notification_read',
  NOTIFICATION_DELETED: 'notification_deleted'
};