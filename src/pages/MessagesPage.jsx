import { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle2, Circle, Plus, Trash2, Calendar, Mic, MicOff } from 'lucide-react';
import db from '../db/database';

export default function MessagesPage() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [newDate, setNewDate] = useState('');
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  const startVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { alert('当前浏览器不支持语音输入'); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setNewTodo((prev) => (prev ? prev + text : text));
      setListening(false);
    };
    recognition.onerror = () => { setListening(false); };
    recognition.onend = () => { setListening(false); };

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  const stopVoice = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setListening(false);
  };

  useEffect(() => { loadTodos(); }, []);

  const loadTodos = async () => {
    const record = await db.settings.get('todos');
    if (record?.value) {
      try { setTodos(JSON.parse(record.value)); } catch { setTodos([]); }
    }
  };

  const saveTodos = async (updated) => {
    setTodos(updated);
    await db.settings.put({ id: 'todos', value: JSON.stringify(updated) });
  };

  const addTodo = () => {
    const text = newTodo.trim();
    if (!text) return;
    saveTodos([...todos, {
      id: Date.now(), text, done: false,
      createdAt: new Date().toISOString(),
      dueDate: newDate || null,
    }]);
    setNewTodo('');
    setNewDate('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addTodo(); }
  };

  const toggleTodo = (id) => {
    saveTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const deleteTodo = (id) => {
    saveTodos(todos.filter(t => t.id !== id));
  };

  const pendingCount = todos.filter(t => !t.done).length;

  const formatDate = (d) => {
    if (!d) return '';
    const dt = new Date(d);
    const now = new Date();
    const diff = dt.getTime() - now.getTime();
    const days = Math.ceil(diff / 86400000);
    if (days < 0) return `逾期 ${Math.abs(days)} 天`;
    if (days === 0) return '今天';
    if (days === 1) return '明天';
    return dt.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="p-4 pb-20">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold">消息待办</h1>
        {pendingCount > 0 && (
          <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{pendingCount} 待处理</span>
        )}
      </div>

      {listening && (
        <div className="mb-3 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm animate-pulse"
          style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          正在聆听...
          <button onClick={stopVoice} className="ml-auto text-xs underline" style={{ color: '#92400e' }}>取消</button>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <input
              type="text" value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="添加待办事项..."
              className="flex-1 px-4 py-2.5 bg-gray-100 rounded-xl text-sm outline-none"
            />
            <button
              onClick={listening ? stopVoice : startVoice}
              className="px-3 py-2.5 rounded-xl text-sm"
              style={{
                backgroundColor: listening ? '#fef3c7' : '#f3f4f6',
                color: listening ? '#dc2626' : '#6b7280',
              }}
            >
              {listening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
          </div>
          <input
            type="date" value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="w-full px-4 py-2 bg-gray-100 rounded-xl text-sm outline-none"
            style={{ color: '#6b7280' }}
          />
        </div>
        <button onClick={addTodo} className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm self-start">
          <Plus size={16} />
        </button>
      </div>

      {todos.length === 0 ? (
        <div className="text-center py-16">
          <Bell size={48} className="text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400">暂无待办事项</p>
        </div>
      ) : (
        <div className="space-y-1">
          {[...todos].sort((a, b) => a.done - b.done).map((t) => (
            <div key={t.id} className={`flex items-center gap-3 p-3 rounded-xl ${t.done ? 'bg-gray-50' : 'bg-white border border-gray-100'}`}>
              <button onClick={() => toggleTodo(t.id)} className="flex-shrink-0">
                {t.done ? <CheckCircle2 size={20} className="text-green-500" /> : <Circle size={20} className="text-gray-300" />}
              </button>
              <div className="flex-1 min-w-0">
                <span className={`text-sm ${t.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>{t.text}</span>
                {t.dueDate && (
                  <span className={`ml-2 text-xs ${new Date(t.dueDate) < new Date() && !t.done ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                    <Calendar size={10} className="inline mr-0.5" />
                    {formatDate(t.dueDate)}
                  </span>
                )}
              </div>
              <button onClick={() => deleteTodo(t.id)} className="text-gray-300 hover:text-red-500 flex-shrink-0">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
