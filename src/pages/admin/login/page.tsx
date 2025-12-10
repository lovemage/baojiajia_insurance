import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!email || !password) {
        setError('請輸入電子信箱和密碼');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        // 400 error usually means invalid credentials
        if (error.status === 400) {
          setError('帳號或密碼不正確，或帳號尚未啟用');
        } else if (error.message?.includes('Invalid login credentials')) {
          setError('帳號或密碼不正確');
        } else {
          setError(error.message || '登入失敗，請檢查帳號密碼');
        }
        throw error;
      }

      if (data.user) {
        navigate('/admin');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      // Error message already set above
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo 區域 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-600 rounded-2xl mb-4">
            <i className="ri-shield-user-line text-3xl text-white"></i>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">後台管理系統</h1>
          <p className="text-gray-600">請登入以繼續</p>
        </div>

        {/* 登入表單 */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* 錯誤訊息 */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <i className="ri-error-warning-line text-xl text-red-600 mt-0.5"></i>
                <div className="flex-1">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            )}

            {/* Email 輸入 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                電子信箱
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className="ri-mail-line text-gray-400"></i>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="請輸入電子信箱"
                  required
                />
              </div>
            </div>

            {/* Password 輸入 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                密碼
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className="ri-lock-line text-gray-400"></i>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="請輸入密碼"
                  required
                />
              </div>
            </div>

            {/* 登入按鈕 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {loading ? (
                <>
                  <i className="ri-loader-4-line animate-spin"></i>
                  登入中...
                </>
              ) : (
                <>
                  <i className="ri-login-box-line"></i>
                  登入
                </>
              )}
            </button>
          </form>

          {/* 提示訊息 */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-start gap-3 text-sm text-gray-600">
              <i className="ri-information-line text-teal-600 mt-0.5"></i>
              <p>
                首次使用請先到 Supabase 後台建立管理員帳號
              </p>
            </div>
          </div>
        </div>

        {/* 返回首頁 */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-900 transition-colors inline-flex items-center gap-2 whitespace-nowrap"
          >
            <i className="ri-arrow-left-line"></i>
            返回首頁
          </button>
        </div>
      </div>
    </div>
  );
}
