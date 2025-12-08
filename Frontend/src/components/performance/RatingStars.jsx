import React from 'react';
import { Star } from 'lucide-react';

const RatingStars = ({ rating, onRatingChange, interactive = false, size = "md" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };

  const handleClick = (newRating) => {
    if (interactive && onRatingChange) {
      onRatingChange(newRating);
    }
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleClick(star)}
          disabled={!interactive}
          className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} ${
            sizeClasses[size]
          }`}
        >
          <Star
            className={`${
              star <= rating
                ? 'fill-gray-900 text-gray-900'
                : 'fill-gray-300 text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

export default RatingStars;