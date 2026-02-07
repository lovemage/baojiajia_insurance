import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Helmet } from 'react-helmet-async';
import { sendTelegramNotification } from '../../../services/telegramService';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar?: string;
}


export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewsSubmissionEnabled, setReviewsSubmissionEnabled] = useState(true);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formRating, setFormRating] = useState(5);
  const [formContent, setFormContent] = useState('');
  const [formError, setFormError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [publishedReviews, setPublishedReviews] = useState<Testimonial[]>([]);

  useEffect(() => {
    fetchSettingsAndData();
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setSessionLoading(false);
    }).catch(() => {
      setSession(null);
      setSessionLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setSessionLoading(false);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (loading) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('review') === 'open' && reviewsSubmissionEnabled) {
      setReviewModalOpen(true);
      params.delete('review');
      const newUrl = params.toString()
        ? `${window.location.pathname}?${params.toString()}`
        : window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [loading, reviewsSubmissionEnabled]);

  const fetchSettingsAndData = async () => {
    try {
      const [{ data: settingsData, error: settingsError }, { data: reviewsData, error: reviewsError }] = await Promise.all([
        supabase
          .from('system_settings')
          .select('setting_key, setting_value')
          .eq('setting_key', 'reviews_submission_enabled')
          .maybeSingle(),
        supabase
          .from('customer_reviews')
          .select('id, user_name, role, content, rating, avatar_url')
          .eq('is_active', true)
          .eq('is_approved', true)
          .order('display_order', { ascending: true })
      ]);

      if (!settingsError && settingsData?.setting_value != null) {
        setReviewsSubmissionEnabled(settingsData.setting_value !== 'false');
      }

      if (reviewsError) {
        console.error('Error fetching customer reviews:', reviewsError);
        setTestimonials([]);
        return;
      }

      const formattedTestimonials = (reviewsData ?? []).map((r: any) => ({
        id: r.id,
        name: r.user_name || '匿名',
        role: r.role || '',
        content: r.content,
        rating: r.rating,
        avatar: r.avatar_url
      }));

      setPublishedReviews(formattedTestimonials as any);
      setTestimonials(formattedTestimonials as any);
    } catch (error) {
      console.error('Error fetching settings/reviews:', error);
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  };

  const openReviewModal = () => {
    if (!reviewsSubmissionEnabled) return;
    setFormError('');
    setSubmitSuccess(false);
    setReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setReviewModalOpen(false);
  };

  const signInWithGoogle = async () => {
    setFormError('');
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.href
        }
      });
    } catch (e) {
      console.error('Google sign-in error:', e);
      setFormError('Google 登入失敗，請稍後再試');
    }
  };

  const submitReview = async () => {
    setFormError('');

    if (!reviewsSubmissionEnabled) {
      setFormError('目前暫不開放送出評價');
      return;
    }

    const name = formName.trim();
    const role = formRole.trim();
    const content = formContent.trim();

    if (!content) {
      setFormError('請填寫評價內容');
      return;
    }

    if (formRating < 1 || formRating > 5) {
      setFormError('評分需為 1-5 星');
      return;
    }

    if (!session) {
      setFormError('請先登入後再送出評價');
      return;
    }

    setSubmitting(true);
    try {
      const user = session?.user;
      const googleAvatar =
        (user as any)?.user_metadata?.picture ||
        (user as any)?.user_metadata?.avatar_url ||
        null;
      const { error } = await supabase
        .from('customer_reviews')
        .insert({
          user_id: user?.id ?? null,
          user_email: user?.email ?? null,
          user_name: name || user?.user_metadata?.full_name || user?.user_metadata?.name || '匿名',
          avatar_url: googleAvatar,
          role: role || null,
          rating: formRating,
          content,
          source: 'site',
          is_approved: false,
          is_active: false,
          display_order: 0
        });

      if (error) throw error;

      setSubmitSuccess(true);

      try {
        await sendTelegramNotification({
          type: 'review_submitted',
          memberName: name || user?.user_metadata?.full_name || '匿名',
          memberEmail: user?.email || '',
          timestamp: new Date(),
          reviewData: { rating: formRating, content, role: role || undefined }
        });
      } catch (notifErr) {
        console.error('Telegram notification error:', notifErr);
      }

      setFormName('');
      setFormRole('');
      setFormRating(5);
      setFormContent('');
    } catch (e: any) {
      console.error('Submit review error:', e);
      setFormError(e?.message || '送出失敗，請稍後再試');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className="py-12 sm:py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">客戶真實分享</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              聽聽他們與保家佳的故事
            </p>
          </div>
          <div className="flex justify-center items-center py-12">
            <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
      {publishedReviews.length > 0 && (
        <Helmet>
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "保家佳",
              "url": "https://baojiajia.tw/",
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": (
                  Math.round(
                    (publishedReviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / publishedReviews.length) * 10
                  ) / 10
                ),
                "reviewCount": publishedReviews.length
              },
              "review": publishedReviews.slice(0, 10).map((r) => ({
                "@type": "Review",
                "reviewBody": r.content,
                "reviewRating": {
                  "@type": "Rating",
                  "ratingValue": r.rating,
                  "bestRating": 5,
                  "worstRating": 1
                },
                "author": {
                  "@type": "Person",
                  "name": r.name
                }
              }))
            })}
          </script>
        </Helmet>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">客戶真實分享</h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            聽聽他們與保家佳的故事
          </p>
          {reviewsSubmissionEnabled && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={openReviewModal}
                className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-full font-semibold hover:bg-teal-700 transition-colors whitespace-nowrap"
              >
                <i className="ri-chat-new-line"></i>
                留下評價
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={testimonial.id || index}
              className="bg-white p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center mb-4 sm:mb-5 md:mb-6">
                <img 
                  src={(testimonial as any).avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=0d9488&color=fff&size=200`}
                  alt={testimonial.name}
                  className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full object-cover object-top mr-3 sm:mr-4"
                />
                <div>
                  <h4 className="font-bold text-gray-900 text-base sm:text-lg">{testimonial.name}</h4>
                  <p className="text-gray-500 text-xs sm:text-sm">{testimonial.role}</p>
                </div>
              </div>
              
              <div className="flex mb-3 sm:mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <i key={i} className="ri-star-fill text-yellow-400 text-base sm:text-lg"></i>
                ))}
              </div>
              
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                {testimonial.content}
              </p>
            </div>
          ))}
        </div>
      </div>

      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50" onClick={closeReviewModal}></div>
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">留下你的真實評價</h3>
                <p className="text-sm text-gray-600 mt-1">送出後需經管理員審核才會公開顯示</p>
              </div>
              <button
                type="button"
                onClick={closeReviewModal}
                className="text-gray-400 hover:text-gray-600"
                aria-label="關閉"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            {formError && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {formError}
              </div>
            )}

            {submitSuccess ? (
              <div className="mt-6 bg-teal-50 border border-teal-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <i className="ri-checkbox-circle-line text-2xl text-teal-700"></i>
                  <div>
                    <div className="font-semibold text-teal-900">已送出評價</div>
                    <div className="text-sm text-teal-800 mt-1">感謝你的分享，我們會在審核後公開</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-gray-900">登入後才能送出評價</div>
                      <div className="text-sm text-gray-600 mt-1">為避免垃圾評價，送出評價前需先登入</div>
                    </div>
                    <button
                      type="button"
                      onClick={signInWithGoogle}
                      disabled={sessionLoading || !!session}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 whitespace-nowrap"
                    >
                      <i className="ri-google-fill"></i>
                      {session ? '已登入' : 'Google 登入'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">姓名（可選）</label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="例如：王小明"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">身份/職業（可選）</label>
                    <input
                      type="text"
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="例如：新手爸媽"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">評分</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormRating(star)}
                        className="cursor-pointer"
                        aria-label={`${star} 星`}
                      >
                        <i className={`${star <= formRating ? 'ri-star-fill text-yellow-400' : 'ri-star-line text-gray-300'} text-2xl`}></i>
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-600">{formRating} 星</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">評價內容</label>
                  <textarea
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                    placeholder="例如：保單健診很有幫助，顧問說明清楚..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeReviewModal}
                    className="px-5 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={submitReview}
                    disabled={submitting}
                    className="px-5 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 whitespace-nowrap"
                  >
                    {submitting ? '送出中...' : '送出評價'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
