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

  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className="relative w-full h-32 bg-black/40 hover:bg-black/60 backdrop-blur-sm border border-white/10 hover:border-white/20 rounded-xl p-4 text-center cursor-pointer transform hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 ease-out shadow-lg hover:shadow-xl overflow-hidden flex flex-col items-center justify-center"
      >
        {/* Background shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full">
          <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
          <div className="text-sm font-bold text-white mb-1 tracking-tight leading-tight">
            {name}
          </div>
          <div className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
            {count} títulos
          </div>
        </div>

        {/* Subtle corner accent */}
        <div className="absolute top-2 right-2 w-1 h-6 bg-blue-500/50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300" />
      </button>
    </div>
  )
}