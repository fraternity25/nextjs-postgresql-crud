import { useEffect, useState, useRef } from 'react';

export default function Toast({ messages = [], time = 4000, onClose }) {
  const [isClosing, setIsClosing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [remainingTime, setRemainingTime] = useState(time);
  const startTimeRef = useRef(null);
  const timerRef = useRef(null);
  const remainingTimeRef = useRef(time);

  // Update remaining time ref when time prop changes
  useEffect(() => {
    remainingTimeRef.current = time;
    setRemainingTime(time);
  }, [time]);

  useEffect(() => {
    if (isClosing) return;

    if (isHovered) {
      // Pause: clear timer and calculate remaining time
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
        
        if (startTimeRef.current) {
          const elapsed = Date.now() - startTimeRef.current;
          remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
          setRemainingTime(remainingTimeRef.current);
        }
      }
    } else {
      // Resume/Start: use remaining time
      startTimeRef.current = Date.now();
      timerRef.current = setTimeout(() => {
          setIsClosing(true);
          setTimeout(onClose, 300);
        }, remainingTimeRef.current
      );
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isHovered, isClosing, onClose]);

  if (messages.length === 0) return null;

  return (
    <div 
      className={`relative bg-yellow-100 border 
        border-yellow-400 text-yellow-800 px-4 
        py-2 rounded shadow-lg z-50 w-full 
        max-w-md overflow-hidden transition-opacity 
        duration-500 ${ isClosing ? 
          'opacity-0' : 'opacity-100'
        }`
      }
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ '--toast-duration': `${time}ms` }}
    >
      {/* Messages */}
      <div className="py-2">
        {messages.map((msg, i) => {
          const Tag = msg.type;
          if (Tag === "ul") {
            return (
              <Tag key={i} className="list-disc ml-4">
                {msg.content.map((li, j) => <li key={j}>{li}</li>)}
              </Tag>
            );
          }
          return <Tag key={i}>{msg.content}</Tag>;
        })}

        {/*
          TO DO: Add a <Link> here that says "see this notification" 
                 that will navigate to notifications/${id}. This link
                 will be in line with the following element
          TO DO: Add a div or any other element that will show the 
                 remainingTime state at the bottom left but will be above
                 the slider bar
        */}
      </div>

      {/* Sliding bar with pause control */}
      <div className={`absolute bottom-0 left-0 h-1 bg-yellow-500 animate-slide-right-to-left ${
        isHovered ? 'pause-animation' : ''
      }`} />
    </div>
  );
}