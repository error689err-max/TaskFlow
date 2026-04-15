import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "../shared/components/layout/AppLayout";
import ProtectedRoute from "../shared/components/guards/ProtectedRoute";
import PublicOnlyRoute from "../shared/components/guards/PublicOnlyRoute";
import AuthPage from "../features/auth/pages/AuthPage";
import { lazy, Suspense } from "react";
import NotFoundPage from "../shared/pages/NotFound";
import Loader from "../shared/components/Loader";

const DashboardPage = lazy(
  () => import("../features/dashboard/pages/DashboardPage"),
);
const ProjectsPage = lazy(
  () => import("../features/projects/pages/ProjectsPage"),
);
const TasksPage = lazy(() => import("../features/tasks/pages/TasksPage"));
const ActivityPage = lazy(
  () => import("../features/activity/pages/ActivityPage"),
);
const ProfilePage = lazy(() => import("../features/auth/pages/ProfilePage"));
import HomePage from "../features/home/pages/HomePage";

import AcceptInvitePage from "../features/invite/pages/AcceptInvitePage";

export const router = createBrowserRouter([
  {
    path: "/auth",
    element: (
      <PublicOnlyRoute>
        <AuthPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "dashboard",
        element: (
          <Suspense fallback={<Loader />}>
            <DashboardPage />
          </Suspense>
        ),
      },
      {
        path: "projects",
        element: (
          <Suspense fallback={<Loader />}>
            <ProjectsPage />
          </Suspense>
        ),
      },
      {
        path: "project/:id",
        element: (
          <Suspense fallback={<Loader />}>
            <TasksPage />
          </Suspense>
        ),
      },
      {
        path: "activity",
        element: (
          <Suspense fallback={<Loader />}>
            <ActivityPage />
          </Suspense>
        ),
      },
      {
        path: "profile",
        element: (
          <Suspense fallback={<Loader />}>
            <ProfilePage />
          </Suspense>
        ),
      },
      {
        path: "",
        element: <ProfilePage />,
      },
      {
        path: "/accept/invite/:projectId/:emailId",
        element: <AcceptInvitePage />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
