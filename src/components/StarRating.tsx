'use client';

interface StarRatingProps {
  value: number;          // 1-5
  onChange?: (v: number) => void;
  readonly?: boolean;
}

export function StarRating({ value, onChange, readonly = false }: StarRatingProps) {
  return (
    <span className="win98-stars" style={{ cursor: readonly ? 'default' : 'pointer' }}>
      {[1, 2, 3, 4, 5].map(n => (
        <span
          key={n}
          className={n <= value ? '' : 'empty'}
          onClick={() => !readonly && onChange?.(n)}
          title={readonly ? undefined : `${n} star${n !== 1 ? 's' : ''}`}
        >
          {n <= value ? '★' : '☆'}
        </span>
      ))}
    </span>
  );
}
