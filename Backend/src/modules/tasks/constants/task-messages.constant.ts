export const TASK_MESSAGES = {
    PROJECT_NOT_FOUND: 'Project not found',
    TASK_NOT_FOUND: 'Task not found',
    ASSIGNED_USER_NOT_FOUND: 'Assigned user not found',
    ASSIGNED_USER_NOT_PROJECT_MEMBER:
        'Assigned user is not a member of this project',
    CREATOR_NOT_PROJECT_MEMBER: 'You are not a member of this project',
    NO_FIELDS_TO_UPDATE: 'No fields provided to update',
    TASK_DELETED_SUCCESSFULLY: 'Task deleted successfully',
    ASSIGNEES_REQUIRED: 'At least one assignee is required',

    //  Validation messages
    TITLE_REQUIRED: 'Title is required',
    TITLE_MIN_LENGTH: 'Title must be at least 3 characters long',
    TITLE_MAX_LENGTH: 'Title must not exceed 100 characters',

    DESCRIPTION_MAX_LENGTH: 'Description must not exceed 1000 characters',
    DESCRIPTION_STRING: 'Description must be a string',
    PROJECT_ID_REQUIRED: 'Project ID is required',
    PROJECT_ID_INVALID: 'Project ID must be a string',

    STATUS_INVALID: 'Status must be a valid task status',
    PRIORITY_INVALID: 'Priority must be a valid task priority',

    ASSIGNEES_INVALID: 'AssigneeIds must be an array',
    ASSIGNEE_INVALID: 'Each assigneeId must be a string',
    ASSIGNEES_DUPLICATE: 'AssigneeIds must not contain duplicates',
    ASSIGNEES_MAX: 'You can assign at most 10 users',

    DUE_DATE_INVALID: 'Due date must be a valid ISO date string',
};
