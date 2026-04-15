import { Transform } from 'class-transformer';
import sanitizeHtml from 'sanitize-html';
import {
    IsString,
    IsNotEmpty,
    IsEnum,
    IsOptional,
    IsDateString,
    IsArray,
    MaxLength,
    MinLength,
} from 'class-validator';
import { TaskPriority, TaskStatus } from '@prisma/client';
import { TASK_MESSAGES } from '../constants/task-messages.constant';

export class CreateTaskDto {
    @Transform(({ value }) => {
        if (typeof value !== 'string') return value;

        const cleaned = sanitizeHtml(value.trim(), {
            // sanitize title
            allowedTags: [],
            allowedAttributes: {},
        });

        return cleaned === '' ? '' : cleaned;
    })
    @IsString({ message: TASK_MESSAGES.TITLE_REQUIRED })
    @IsNotEmpty({ message: TASK_MESSAGES.TITLE_REQUIRED })
    @MinLength(3, { message: TASK_MESSAGES.TITLE_MIN_LENGTH })
    @MaxLength(100, { message: TASK_MESSAGES.TITLE_MAX_LENGTH })
    title: string;

    @Transform(({ value }) => {
        if (typeof value !== 'string') return value;

        const cleaned = sanitizeHtml(value.trim(), {
            allowedTags: [],
            allowedAttributes: {},
        });

        return cleaned === '' ? undefined : cleaned;
    })
    @IsOptional()
    @IsString({ message: TASK_MESSAGES.DESCRIPTION_STRING })
    @MaxLength(1000, {
        message: TASK_MESSAGES.DESCRIPTION_MAX_LENGTH,
    })
    description?: string;

    @IsEnum(TaskStatus, { message: TASK_MESSAGES.STATUS_INVALID })
    @IsOptional()
    status?: TaskStatus;

    @IsEnum(TaskPriority, { message: TASK_MESSAGES.PRIORITY_INVALID })
    @IsOptional()
    priority?: TaskPriority;

    @Transform(({ value }) => value?.trim())
    @IsString({ message: TASK_MESSAGES.PROJECT_ID_INVALID })
    @IsNotEmpty({ message: TASK_MESSAGES.PROJECT_ID_REQUIRED })
    projectId: string;

    @IsArray()
    @IsString({ each: true })
    assigneeIds: string[];

    @IsOptional()
    @IsDateString({}, { message: TASK_MESSAGES.DUE_DATE_INVALID })
    dueDate?: string;
}
