import React from 'react';

export const Card = React.forwardRef(({
  children,
  className = '',
  hoverable = false,
  ...props
}, ref) => {
  const cardClass = hoverable ? 'card-hover' : 'card';
  return (
    <div
      ref={ref}
      className={`${cardClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';
export default Card;
