'use client';

import { useState } from 'react';
import { FiStar } from 'react-icons/fi';

// The review API requires a signed-in customer who has purchased the product
// (server/controllers/reviewController.js). The storefront has no customer
// login yet, so this form can't actually submit — it just explains that.
export default function ReviewForm() {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Please sign in to submit a review.');
  };

  return (
    <form onSubmit={submit} className="rounded-[8px] border border-zinc-200 bg-white p-6">
      <h3 className="inline-block border-b-2 border-[var(--primary)] pb-2 text-base font-bold text-zinc-900">Submit Your Review</h3>
      <p className="mt-3 text-sm text-zinc-500">Your email address will not be published. Required fields are marked *</p>

      <label className="mb-1.5 mt-4 block text-sm font-medium text-zinc-700">Write your opinion about the product</label>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write Your Review Here..."
        rows={4}
        className="w-full rounded-[8px] border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-700 outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
      />

      <label className="mb-1.5 mt-4 block text-sm font-medium text-zinc-700">Your Rating:</label>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
            className="p-0.5"
          >
            <FiStar size={22} className={star <= (hoverRating || rating) ? 'fill-amber-400 text-amber-400' : 'text-zinc-300'} />
          </button>
        ))}
      </div>

      {message && <p className="mt-3 text-sm text-[var(--primary)]">{message}</p>}

      <button
        type="submit"
        className="mt-4 rounded-[8px] bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
      >
        Submit Review
      </button>
    </form>
  );
}
