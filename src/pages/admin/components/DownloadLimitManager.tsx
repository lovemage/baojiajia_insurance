
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface UserLimit {
    email: string;
    download_limit: number;
    download_count: number;
    updated_at: string;
}

export default function DownloadLimitManager() {
    const [limits, setLimits] = useState<UserLimit[]>([]);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState('');
    const [limit, setLimit] = useState<number>(-1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchLimits();
    }, []);

    const fetchLimits = async () => {
        try {
            const { data, error } = await supabase
                .from('user_download_limits')
                .select('*')
                .order('updated_at', { ascending: false });

            if (error) throw error;
            setLimits(data || []);
        } catch (error) {
            console.error('Error fetching limits:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsSubmitting(true);
        try {
            // Check if exists
            const { data: existing, error: fetchError } = await supabase
                .from('user_download_limits')
                .select('email')
                .eq('email', email)
                .maybeSingle();

            if (fetchError) throw fetchError;

            if (existing) {
                const { error } = await supabase
                    .from('user_download_limits')
                    .update({
                        download_limit: limit,
                        updated_at: new Date().toISOString()
                    })
                    .eq('email', email);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('user_download_limits')
                    .insert({
                        email,
                        download_limit: limit,
                        updated_at: new Date().toISOString()
                    });
                if (error) throw error;
            }

            alert('設定成功');
            setEmail('');
            setLimit(-1);
            fetchLimits();
        } catch (error) {
            console.error('Error saving limit:', error);
            alert('設定失敗');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (emailToDelete: string) => {
        if (!confirm('確定要刪除此設定嗎？')) return;

        try {
            const { error } = await supabase
                .from('user_download_limits')
                .delete()
                .eq('email', emailToDelete);

            if (error) throw error;
            fetchLimits();
        } catch (error) {
            console.error('Error deleting limit:', error);
            alert('刪除失敗');
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">會員下載次數限制管理</h2>

            <form onSubmit={handleSubmit} className="mb-8 bg-gray-50 p-6 rounded-xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            會員 Email
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            placeholder="user@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            下載次數限制 (預設 -1 為無限制)
                        </label>
                        <input
                            type="number"
                            required
                            value={limit}
                            onChange={(e) => setLimit(parseInt(e.target.value))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? '處理中...' : '新增/更新設定'}
                    </button>
                </div>
            </form>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">限制次數</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">已下載次數</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">最後更新</th>
                            <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">載入中...</td>
                            </tr>
                        ) : limits.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">尚無設定記錄</td>
                            </tr>
                        ) : (
                            limits.map((item) => (
                                <tr key={item.email} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-900">{item.email}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {item.download_limit === -1 ? '無限制' : item.download_limit}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{item.download_count}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(item.updated_at).toLocaleString('zh-TW')}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => {
                                                setEmail(item.email);
                                                setLimit(item.download_limit);
                                            }}
                                            className="text-teal-600 hover:text-teal-900 mr-4"
                                        >
                                            編輯
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.email)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            刪除
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
