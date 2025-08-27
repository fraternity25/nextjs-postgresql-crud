import { useEffect, useState, useRef } from 'react';

export function ToastMessages({messages}) {
  return (
    messages.map((msg, i) => {
      const Tag = msg.type;
      if (Tag == "ul") {
        return (
          <Tag key={i} className="list-disc ml-4">
            {msg.content.map((li, j) => <li key={j}>{li}</li>)}
          </Tag>
        );
      }
      return <Tag key={i}>{msg.content}</Tag>;
    })
  );
}

export default function Toast({ messages = [], time = 4000, type="warning", onClose }) {
  const [isClosing, setIsClosing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [remainingTime, setRemainingTime] = useState(time);
  const startTimeRef = useRef(null);
  const timerRef = useRef(null);
  const remainingTimeRef = useRef(time);
  const onCloseRef = useRef(onClose);

  const colors = {
    error: {
      bg: "bg-red-100 border-red-400 text-red-800",
      sliderBg: "bg-red-500",
    },
    success: {
      bg: "bg-green-100 border-green-400 text-green-800",
      sliderBg: "bg-green-500",
    },
    info: {
      bg: "bg-blue-100 border-blue-400 text-blue-800",
      sliderBg: "bg-blue-500",
    },
    default: { // Using a "default" key for the last case
      bg: "bg-yellow-100 border-yellow-400 text-yellow-800",
      sliderBg: "bg-yellow-500",
    },
  };
  colors.warning = colors.default;
  const { bg, sliderBg } = colors[type] || colors.default;

  // onClose ref'ini güncelle
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Update remaining time ref when time prop changes
  useEffect(() => {
    remainingTimeRef.current = time;
    setRemainingTime(time);
  }, [time]);

  useEffect(() => {
    const handleClose = () => {
      setIsClosing(true);
      setTimeout(() => onCloseRef.current(), 300);
    };

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
      timerRef.current = setTimeout(handleClose, remainingTimeRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isHovered, isClosing]);

  if (messages.length === 0) return null;

  return (
    <div 
      className={`relative border ${bg} px-4 
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
        <ToastMessages messages={messages} />

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
      <div className={`absolute bottom-0 left-0 h-1 ${sliderBg} animate-slide-right-to-left ${
        isHovered ? 'pause-animation' : ''
      }`} />
    </div>
  );
}