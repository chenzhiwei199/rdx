import React, { useCallback, useEffect, useRef, useState } from 'react';
export function Tooltip(props: {
  trigger?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const { trigger } = props;
  const [isVisible, setVisible] = useState(false);
  const timerRef = useRef(null);
  const triggerRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
    };
  });
  const handleMouseEnter = useCallback(() => {
    timerRef.current = setTimeout(() => {
      setVisible(true);
    }, 300);
  }, []);
  const handleMouseLeave = useCallback(() => {
    clearTimeout(timerRef.current);
    setVisible(false);
  }, []);
  const getLeft = () => {
    const { width } = triggerRef.current.getBoundingClientRect();
    return -1 * width / 2;
  };
  return (
    <span onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <span className='tooltip-trigger' ref={triggerRef}>
        {trigger}
        {
          isVisible && <div
            style={{
              marginLeft: getLeft(),
              position: 'absolute',
              background: '#333',
              boxShadow: '0 8px 16px 0 rgba(0,0,0,.08)',
              color: 'white',
              // left: getLeft(),
              borderRadius: '2px',
              padding: '12px 40px 12px 12px',
            }}
          >
            {props.children}
            <div
              style={{
                position: 'absolute',
                width: '8px',
                height: '8px',
                left: 'calc(50% - 4px)',
                top: '-4px',
                boxShadow: '-1px -1px 1px 0 rgba(0,0,0,.1)',
                transform: 'rotate(45deg)',
                background: '#333',
              }}
            ></div>
          </div>
        }
      </span>
    </span>
  );
}
