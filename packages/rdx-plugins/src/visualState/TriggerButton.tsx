import React from 'react';

export default ({ onClick }) => {
  return (
    <div
      style={{
        display: 'inline-block',
        textDecoration: 'none',
        background: '#87befd',
        color: '#FFF',
        width: '120px',
        position: 'fixed',
        bottom: 50,
        right: 30,
        height: '120px',
        lineHeight: '120px',
        borderRadius: '50%',
        textAlign: 'center',
        cursor: 'pointer',
        verticalAlign: 'middle',
        overflow: 'hidden',
        transition: '.4s',
        zIndex: 1000
      }}
      onClick={onClick}
    >
      查看链路
    </div>
  );
};
