import {
  FolderPlus,
  UserPlus,
  CheckSquare,
  RefreshCw,
  Trash2,
} from "lucide-react";
import type { ActivityActionType } from "../types";
import type { ActivityLogItemProps } from "../types";
import { Avatar } from "../../../shared/components/Avatar";
import { formatDate } from "../../../shared/utils/formateDate";

interface ActionMeta {
  icon: React.ReactNode;
  iconStyle: React.CSSProperties;
  verb: string;
}

function getActionMeta(action: ActivityActionType): ActionMeta {
  const size = 10;
  switch (action) {
    case "PROJECT_CREATED":
      return {
        icon: <FolderPlus size={size} />,
        iconStyle: {
          background: "rgb(219 234 254)",
          color: "var(--color-primary)",
        },
        verb: "created the project",
      };
    case "MEMBER_INVITED":
      return {
        icon: <UserPlus size={size} />,
        iconStyle: {
          background: "rgb(220 252 231)",
          color: "var(--color-success)",
        },
        verb: "invited",
      };
    case "TASK_CREATED":
      return {
        icon: <CheckSquare size={size} />,
        iconStyle: {
          background: "rgb(224 242 254)",
          color: "var(--color-secondary)",
        },
        verb: "created task",
      };
    case "TASK_STATUS_CHANGED":
      return {
        icon: <RefreshCw size={size} />,
        iconStyle: {
          background: "rgb(254 249 195)",
          color: "var(--color-warning)",
        },
        verb: "changed task status",
      };
    case "TASK_DELETED":
      return {
        icon: <Trash2 size={size} />,
        iconStyle: {
          background: "rgb(254 226 226)",
          color: "var(--color-danger)",
        },
        verb: "deleted task",
      };
  }
}

function StatusBadge({ label }: { label: string }) {
  const styleMap: Record<string, React.CSSProperties> = {
    TODO: {
      background: "var(--color-muted)",
      color: "var(--color-text-secondary)",
    },
    IN_PROGRESS: {
      background: "rgb(219 234 254)",
      color: "var(--color-primary)",
    },
    DONE: { background: "rgb(220 252 231)", color: "var(--color-success)" },
  };

  return (
    <span
      style={{
        ...(styleMap[label] ?? {
          background: "var(--color-muted)",
          color: "var(--color-text-secondary)",
        }),
        display: "inline-flex",
        alignItems: "center",
        padding: "1px 7px",
        borderRadius: "var(--radius-sm)",
        fontSize: "0.6875rem",
        fontWeight: 500,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

const ActivityLogItem = ({ log }: ActivityLogItemProps) => {
  const { icon, iconStyle, verb } = getActionMeta(log.action);

  return (
    <div className="flex items-start gap-3">
      <div style={{ position: "relative", flexShrink: 0 }}>
        <Avatar name={log.user.name} src={log.user.avatarUrl} />
        <span
          aria-hidden="true"
          style={{
            ...iconStyle,
            position: "absolute",
            bottom: -2,
            right: -2,
            width: 16,
            height: 16,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1.5px solid var(--color-surface)",
            flexShrink: 0,
          }}
        >
          {icon}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <p
          className="text-sm leading-snug flex flex-wrap items-center gap-x-1 gap-y-0.5"
          style={{ color: "var(--color-text-primary)" }}
        >
          <span
            className="font-semibold whitespace-nowrap"
            style={{ color: "var(--color-text-primary)" }}
          >
            {log.user.name}
          </span>

          <span style={{ color: "var(--color-text-secondary)" }}>{verb}</span>

          {log.action === "PROJECT_CREATED" && log.project && (
            <span
              className="font-medium"
              style={{ color: "var(--color-primary)" }}
            >
              {log.project.title}
            </span>
          )}

          {log.action === "MEMBER_INVITED" && log.details && (
            <span
              className="font-medium"
              style={{ color: "var(--color-primary)" }}
            >
              {log.details.invitedUserName}
            </span>
          )}

          {log.action === "TASK_CREATED" && log.details && (
            <span
              className="font-medium"
              style={{ color: "var(--color-primary)" }}
            >
              {log.details.taskTitle}
            </span>
          )}

          {log.action === "TASK_STATUS_CHANGED" && log.details && (
            <span className="inline-flex items-center gap-1 flex-wrap">
              <span style={{ color: "var(--color-text-secondary)" }}>from</span>
              <StatusBadge label={log.details.from} />
              <span style={{ color: "var(--color-text-secondary)" }}>to</span>
              <StatusBadge label={log.details.to} />
            </span>
          )}

          {log.action === "TASK_DELETED" && log.details && (
            <span
              className="font-medium"
              style={{ color: "var(--color-danger)" }}
            >
              {log.details.taskTitle}
            </span>
          )}

          {log.project && log.action != "PROJECT_CREATED" && (
            <>
              <span style={{ color: "var(--color-text-secondary)" }}>in</span>
              <span
                className="font-medium whitespace-nowrap"
                style={{ color: "var(--color-primary)" }}
              >
                {log.project.title}
              </span>
            </>
          )}
        </p>

        <p
          className="mt-0.5 text-xs"
          style={{ color: "var(--color-text-muted)" }}
        >
          {formatDate(log.createdAt)}
        </p>
      </div>
    </div>
  );
};

export default ActivityLogItem;
