interface CategoryCardProps {
  name: string
  count: number
  onClick?: () => void
}

const getCategoryIcon = (categoryName: string) => {
  const icons: { [key: string]: string } = {
    'Ação': '⚔️',
    'Romance': '💕',
    'Comédia': '😂',
    'Drama': '🎭',
    'Fantasia': '🔮',
    'Slice of Life': '🌸',
    'Thriller': '🔥',
    'Supernatural': '👻',
    'Aventura': '🗡️',
    'Mistério': '🕵️',
    'Horror': '💀',
    'Sci-Fi': '🚀'
  }
  return icons[categoryName] || '🎌'
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getCategoryGradient = (categoryName: string) => {
  const gradients: { [key: string]: string } = {
    'Ação': 'from-red-600/20 via-orange-600/10 to-yellow-600/20',
    'Romance': 'from-pink-600/20 via-rose-600/10 to-red-600/20',
    'Comédia': 'from-yellow-600/20 via-amber-600/10 to-orange-600/20',
    'Drama': 'from-purple-600/20 via-indigo-600/10 to-blue-600/20',
    'Fantasia': 'from-violet-600/20 via-purple-600/10 to-indigo-600/20',
    'Slice of Life': 'from-green-600/20 via-emerald-600/10 to-teal-600/20',
    'Thriller': 'from-gray-600/20 via-slate-600/10 to-zinc-600/20',
    'Supernatural': 'from-indigo-600/20 via-purple-600/10 to-violet-600/20'
  }
  return gradients[categoryName] || 'from-blue-600/20 via-cyan-600/10 to-teal-600/20'
}

export default function CategoryCard({ name, count, onClick }: CategoryCardProps) {
  const icon = getCategoryIcon(name)
  const gradient = getCategoryGradient(name)

  return (
    <div className="relative group">
      {/* Glow Effect Layer */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-40 blur-xl transition-opacity duration-500 rounded-xl`} />

      <button
        onClick={onClick}
        className="relative w-full h-32 bg-black/40 hover:bg-gray-900/60 backdrop-blur-md border border-white/10 group-hover:border-white/30 rounded-xl p-4 text-center cursor-pointer transform hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 ease-out shadow-lg hover:shadow-2xl overflow-hidden flex flex-col items-center justify-center z-10"
      >
        {/* Background shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full">
          <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300 drop-shadow-md">
            {icon}
          </div>
          <div className="text-sm font-bold text-white mb-1 tracking-tight leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-200">
            {name}
          </div>
          <div className="text-xs text-gray-500 group-hover:text-blue-300 transition-colors font-medium">
            {count} títulos
          </div>
        </div>

        {/* Accent border bottom */}
        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      </button>
    </div>
  )
}