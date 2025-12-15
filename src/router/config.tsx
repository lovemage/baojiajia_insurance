import { lazy } from 'react';
import type { RouteObject } from 'react-router';
import ProtectedRoute from '../components/feature/ProtectedRoute';

const Home = lazy(() => import('../pages/home/page'));
const Blog = lazy(() => import('../pages/blog/page'));
const BlogDetail = lazy(() => import('../pages/blog-detail/page'));
const Services = lazy(() => import('../pages/services/page'));
const About = lazy(() => import('../pages/about/page'));
const Contact = lazy(() => import('../pages/contact/page'));
const Analysis = lazy(() => import('../pages/analysis/page'));
const BeginnerGuide = lazy(() => import('../pages/beginner/page'));
const NotFound = lazy(() => import('../pages/NotFound'));
const ServiceDetailPage = lazy(() => import('../pages/service-detail/page'));
const AdminPage = lazy(() => import('../pages/admin/page'));
const AdminLoginPage = lazy(() => import('../pages/admin/login/page'));
const TermsPage = lazy(() => import('../pages/terms/page'));
const PrivacyPage = lazy(() => import('../pages/privacy/page'));

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/blog',
    element: <Blog />,
  },
  {
    path: '/blog/id/:id',
    element: <BlogDetail />,
  },
  {
    path: '/blog/:slug',
    element: <BlogDetail />,
  },
  {
    path: '/services',
    element: <Services />,
  },
  {
    path: '/services/:slug',
    element: <ServiceDetailPage />,
  },
  {
    path: '/about',
    element: <About />,
  },
  {
    path: '/contact',
    element: <Contact />,
  },
  {
    path: '/analysis',
    element: <Analysis />,
  },
  {
    path: '/beginner',
    element: <BeginnerGuide />,
  },
  {
    path: '/admin/login',
    element: <AdminLoginPage />,
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <AdminPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/terms',
    element: <TermsPage />,
  },
  {
    path: '/privacy',
    element: <PrivacyPage />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
];

export default routes;
