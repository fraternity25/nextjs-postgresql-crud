import { useEffect } from 'react';

export default function Toast({ messages = [], onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (messages.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded shadow z-50">
      <ul className="list-disc ml-4">
        {messages.map((msg, i) => <li key={i}>{msg}</li>)}
      </ul>
    </div>
  );
}