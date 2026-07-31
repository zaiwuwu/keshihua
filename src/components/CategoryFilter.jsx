export default function CategoryFilter({ categories, active, onChange }) {
  const allCats = ['全部', ...categories];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {allCats.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat === '全部' ? '' : cat)}
          className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap font-medium transition ${
            (cat === '全部' && !active) || cat === active
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
