import { SEO } from '../components/SEO';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center px-4">
      <SEO
        title="404 找不到頁面 | 保家佳"
        description="抱歉，您要查看的頁面不存在。"
        url={window.location.pathname}
      />
      <h1 className="text-5xl md:text-5xl font-semibold text-gray-100">404</h1>
      <h1 className="text-2xl md:text-3xl font-semibold mt-6">This page has not been generated</h1>
      <p className="mt-4 text-xl md:text-2xl text-gray-500">Tell me what you would like on this page</p>
    </div>
  );
}