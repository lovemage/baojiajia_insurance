import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface MemberSubmission {
  id: string;
  user_id: string;
  email: string;
  name: string;
  phone: string;
  city: string;
  line_id: string;
  questionnaire_data: any;
  created_at: string;
}

export default function MemberManager() {
  const [members, setMembers] = useState<MemberSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<MemberSubmission | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('member_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      const { error } = await supabase
        .from('member_submissions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // 更新本地狀態
      setMembers(members.filter(m => m.id !== id));
      setShowDeleteConfirm(null);

      // 如果正在查看被刪除的會員，關閉彈窗
      if (selectedMember?.id === id) {
        setSelectedMember(null);
      }
    } catch (error) {
      console.error('Error deleting member:', error);
      alert('刪除失敗，請稍後再試');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">會員資訊管理</h1>
          <p className="text-gray-600">查看所有註冊會員及問卷資料</p>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">註冊時間</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">姓名</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">電話</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Line ID</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(member.created_at).toLocaleString('zh-TW')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{member.name}</div>
                      <div className="text-sm text-gray-500">{member.city}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{member.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{member.phone}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{member.line_id}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedMember(member)}
                          className="px-3 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors cursor-pointer whitespace-nowrap text-sm"
                        >
                          <i className="ri-file-list-3-line mr-1"></i>
                          詳情
                        </button>
                        {showDeleteConfirm === member.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(member.id)}
                              disabled={deleting === member.id}
                              className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors cursor-pointer whitespace-nowrap text-sm disabled:opacity-50"
                            >
                              {deleting === member.id ? (
                                <i className="ri-loader-4-line animate-spin"></i>
                              ) : (
                                '確認'
                              )}
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(null)}
                              className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors cursor-pointer whitespace-nowrap text-sm"
                            >
                              取消
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowDeleteConfirm(member.id)}
                            className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors cursor-pointer whitespace-nowrap text-sm"
                          >
                            <i className="ri-delete-bin-line mr-1"></i>
                            刪除
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {members.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      尚無會員資料
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 詳細資料彈窗 */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-8 py-6 flex items-center justify-between z-10">
              <h3 className="text-2xl font-bold text-gray-900">
                {selectedMember.name} 的保障分析報告
              </h3>
              <button
                onClick={() => setSelectedMember(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-3xl"></i>
              </button>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">基本資料</h4>
                  <div className="space-y-3">
                    <p className="flex justify-between"><span className="text-gray-500">姓名：</span> <span className="font-medium">{selectedMember.name}</span></p>
                    <p className="flex justify-between"><span className="text-gray-500">電話：</span> <span className="font-medium">{selectedMember.phone}</span></p>
                    <p className="flex justify-between"><span className="text-gray-500">Email：</span> <span className="font-medium">{selectedMember.email}</span></p>
                    <p className="flex justify-between"><span className="text-gray-500">居住地：</span> <span className="font-medium">{selectedMember.city}</span></p>
                    <p className="flex justify-between"><span className="text-gray-500">Line ID：</span> <span className="font-medium">{selectedMember.line_id}</span></p>
                    <p className="flex justify-between"><span className="text-gray-500">提交時間：</span> <span className="font-medium">{new Date(selectedMember.created_at).toLocaleString('zh-TW')}</span></p>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">個人背景</h4>
                  <div className="space-y-3">
                    <p className="flex justify-between"><span className="text-gray-500">性別：</span> <span className="font-medium">{selectedMember.questionnaire_data.gender === 'male' ? '男' : '女'}</span></p>
                    <p className="flex justify-between"><span className="text-gray-500">出生日期：</span> <span className="font-medium">{selectedMember.questionnaire_data.birthDate}</span></p>
                    <p className="flex justify-between"><span className="text-gray-500">職業等級：</span> <span className="font-medium">{selectedMember.questionnaire_data.occupation}</span></p>
                    <p className="flex justify-between"><span className="text-gray-500">規劃對象：</span> <span className="font-medium">{selectedMember.questionnaire_data.planType === 'self' ? '本人' : '子女'}</span></p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-xl font-bold text-gray-900">問卷詳細內容</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">期望病房類型</div>
                    <div className="font-medium text-lg">
                      {selectedMember.questionnaire_data.roomType === 'single' ? '單人房' : 
                       selectedMember.questionnaire_data.roomType === 'double' ? '雙人房' : '健保房'}
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">期望住院日額</div>
                    <div className="font-medium text-lg text-teal-600">
                      {selectedMember.questionnaire_data.hospitalDaily?.toLocaleString()} 元/日
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">手術醫療補貼</div>
                    <div className="font-medium text-lg">
                      {selectedMember.questionnaire_data.surgerySubsidy === 'full' ? '全額負擔 (30-40萬)' : 
                       selectedMember.questionnaire_data.surgerySubsidy === 'recommended' ? '建議額度 (20-30萬)' : '基本額度 (10-20萬)'}
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">薪資損失補償</div>
                    <div className="font-medium text-lg text-teal-600">
                      {selectedMember.questionnaire_data.salaryLoss?.toLocaleString()} 元/月
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">每月生活開銷</div>
                    <div className="font-medium text-lg text-teal-600">
                      {selectedMember.questionnaire_data.livingExpense?.toLocaleString()} 元/月
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">治療費用補償</div>
                    <div className="font-medium text-lg text-teal-600">
                      {selectedMember.questionnaire_data.treatmentCost?.toLocaleString()} 元
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">長照費用需求</div>
                    <div className="font-medium text-lg text-teal-600">
                      {selectedMember.questionnaire_data.longTermCare?.toLocaleString()} 元/月
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">家人照顧金</div>
                    <div className="font-medium text-lg text-teal-600">
                      {selectedMember.questionnaire_data.familyCare?.toLocaleString()} 元
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-100 p-6 flex justify-between">
              <button
                onClick={() => {
                  if (confirm(`確定要刪除 ${selectedMember.name} 的資料嗎？此操作無法復原。`)) {
                    handleDelete(selectedMember.id);
                  }
                }}
                disabled={deleting === selectedMember.id}
                className="px-6 py-3 bg-red-100 text-red-600 rounded-xl font-semibold hover:bg-red-200 transition-colors cursor-pointer disabled:opacity-50"
              >
                {deleting === selectedMember.id ? (
                  <>
                    <i className="ri-loader-4-line animate-spin mr-2"></i>
                    刪除中...
                  </>
                ) : (
                  <>
                    <i className="ri-delete-bin-line mr-2"></i>
                    刪除此會員
                  </>
                )}
              </button>
              <button
                onClick={() => setSelectedMember(null)}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
