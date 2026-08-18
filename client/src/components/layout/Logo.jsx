import { Link } from 'react-router-dom';

/** BorrowBox wordmark + cube logo. */
export default function Logo({ className = '' }) {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`}>
      <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="9" fill="#6D5EF3" />
        <path d="M9 12.5 16 8l7 4.5v7L16 24l-7-4.5v-7z" fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
        <path d="M16 8v8m0 0-7-3.5M16 16l7-3.5" stroke="#C2EE4A" strokeWidth="2" strokeLinejoin="round" />
      </svg>
      <span className="font-display text-lg font-extrabold tracking-tight">
        Borrow<span className="text-brand-500">Box</span>
      </span>
    </Link>
  );
}
