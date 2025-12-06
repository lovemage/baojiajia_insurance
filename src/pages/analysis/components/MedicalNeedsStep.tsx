import { useState } from 'react';

type Props = {
  data: {
    roomType: string;
  };
  onUpdate: (data: {
    roomType: string;
  }) => void;
  onNext: () => void;
  onBack: () => void;
};

export default function MedicalNeedsStep({ data, onUpdate, onNext, onBack }: Props) {
  const [selectedRoom, setSelectedRoom] = useState(data.roomType || '');

  const roomOptions = [
    {
      value: 'health-insurance',
      title: '4-6人健保病房',
      image: 'https://readdy.ai/api/search-image?query=A%20spacious%20hospital%20ward%20with%204%20to%206%20beds%20arranged%20in%20rows%20with%20medical%20privacy%20curtains%20between%20them%20showing%20a%20typical%20multi-patient%20room%20setup%20with%20shared%20medical%20equipment%20and%20basic%20healthcare%20facilities%20in%20a%20clean%20modern%20hospital%20environment&width=800&height=600&seq=health-ward-multi&orientation=landscape',
      features: ['健保給付'],
      drawbacks: ['可能遇到其他病人吵雜', '交互感染風險較高', '隱私性較低', '休息品質受影響']
    },
    {
      value: 'double',
      title: '雙人病房',
      image: 'https://readdy.ai/api/search-image?query=A%20modern%20hospital%20semi-private%20room%20with%20two%20beds%20separated%20by%20a%20privacy%20curtain%20featuring%20comfortable%20medical%20beds%20individual%20medical%20equipment%20for%20each%20patient%20and%20a%20peaceful%20healing%20environment%20with%20natural%20lighting&width=800&height=600&seq=double-room&orientation=landscape',
      features: ['較佳隱私性', '安靜舒適', '獨立空間'],
      drawbacks: ['需自費差額']
    },
    {
      value: 'single',
      title: '單人病房',
      image: 'https://readdy.ai/api/search-image?query=A%20luxurious%20private%20hospital%20room%20with%20a%20single%20bed%20featuring%20premium%20medical%20equipment%20comfortable%20furniture%20for%20family%20visitors%20private%20bathroom%20and%20a%20peaceful%20healing%20environment%20with%20large%20windows%20and%20modern%20amenities&width=800&height=600&seq=single-room&orientation=landscape',
      features: ['完全隱私', '最佳休養環境', '家屬陪伴方便', '獨立衛浴'],
      drawbacks: ['自費金額較高']
    }
  ];

  const handleRoomSelect = (value: string) => {
    setSelectedRoom(value);
  };

  const handleNext = () => {
    if (selectedRoom) {
      onUpdate({ roomType: selectedRoom });
      onNext();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-teal-600">問題 1/3</span>
          <span className="text-sm text-gray-500">醫療需求評估</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div className="bg-teal-600 h-2 rounded-full" style={{ width: '33.33%' }}></div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          病房選擇
        </h2>
        <p className="text-lg text-gray-600">
          假設孩子因疾病或意外需要住院，您希望是哪一種格局的病房呢？
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {roomOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => handleRoomSelect(option.value)}
            className={`text-left rounded-xl border-2 overflow-hidden transition-all cursor-pointer ${
              selectedRoom === option.value
                ? 'border-teal-600 shadow-lg'
                : 'border-gray-200 hover:border-teal-300'
            }`}
          >
            <div className="relative h-48">
              <img
                src={option.image}
                alt={option.title}
                className="w-full h-full object-cover object-top"
              />
              {selectedRoom === option.value && (
                <div className="absolute top-4 right-4 w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center">
                  <i className="ri-check-line text-white"></i>
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg mb-3">{option.title}</h3>
              <div className="space-y-2 mb-3">
                <p className="text-sm font-semibold text-teal-600">優點：</p>
                {option.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start text-sm text-gray-600">
                    <i className="ri-check-line text-teal-600 mr-2 mt-0.5 flex-shrink-0"></i>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-red-600">缺點：</p>
                {option.drawbacks.map((drawback, idx) => (
                  <div key={idx} className="flex items-start text-sm text-gray-600">
                    <i className="ri-close-line text-red-600 mr-2 mt-0.5 flex-shrink-0"></i>
                    <span>{drawback}</span>
                  </div>
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-between pt-6 border-t">
        <button
          onClick={onBack}
          className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium whitespace-nowrap cursor-pointer"
        >
          <i className="ri-arrow-left-line mr-2"></i>
          上一步
        </button>
        <button
          onClick={handleNext}
          disabled={!selectedRoom}
          className={`px-8 py-3 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
            !selectedRoom
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-teal-600 text-white hover:bg-teal-700'
          }`}
        >
          下一步
          <i className="ri-arrow-right-line ml-2"></i>
        </button>
      </div>
    </div>
  );
}
