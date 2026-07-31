import { useState, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';

const hasSpeech = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

export default function SearchBar({ value, onChange, placeholder = '搜索产品...' }) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  const startListen = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const rec = new SpeechRecognition();
    rec.lang = 'zh-CN';
    rec.interimResults = false;
    rec.continuous = false;

    rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      onChange(text);
      setListening(false);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);

    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  };

  const stopListen = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
    }
  };

  return (
    <div className="relative flex items-center">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={listening ? '正在倾听...' : placeholder}
        className="w-full pl-4 pr-12 py-2.5 bg-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
      />
      {hasSpeech && (
        <button
          onClick={listening ? stopListen : startListen}
          className={`absolute right-3 p-1 rounded-full transition ${
            listening ? 'bg-red-100 text-red-500 animate-pulse' : 'text-gray-400 hover:text-blue-500'
          }`}
        >
          {listening ? <MicOff size={18} /> : <Mic size={18} />}
        </button>
      )}
    </div>
  );
}
