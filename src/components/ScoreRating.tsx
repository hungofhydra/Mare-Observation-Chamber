interface ScoreRatingProps {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
}

export function ScoreRating({ value, onChange, readonly = false }: ScoreRatingProps) {
  if (readonly) {
    return (
      <span style={{ fontWeight: 'bold', fontFamily: "'VT323', monospace", fontSize: 15 }}>
        {value}/10
      </span>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <input
        type="number"
        className="win98-input"
        min={0}
        max={10}
        step={0.5}
        value={value}
        onChange={e => onChange?.(Number(e.target.value))}
        style={{ width: 56, height: 22, textAlign: 'center' }}
      />
      <span style={{ fontSize: 11 }}>/10</span>
    </div>
  );
}
