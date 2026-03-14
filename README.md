# 🎵 Sorting Algorithm Visualizer

> **Watch algorithms dance, hear data sing!** 🎶

A beautiful, interactive sorting algorithm visualizer that doesn't just show you how algorithms work — it lets you *hear* them too! Built with React, TypeScript, and a passion for making computer science concepts come alive.

## ✨ What makes this special?

🎵 **Audio Visualization** - Each value has its own musical note! Higher values = higher frequencies. You can literally *hear* the algorithms working.

🎨 **Smooth Animations** - 60fps silky-smooth bar animations with color-coded states (comparing, swapping, completed)

💾 **Persistent Settings** - Your preferences are remembered between sessions. Set it up once, enjoy forever!

🎯 **7 Classic Algorithms** - From bubble sort's gentle bubbling to quicksort's lightning-fast partitioning

🎛️ **Fine-tuned Controls** - Adjust everything: speed, size, frequency range, sort direction, and more

🎭 **Beautiful Icons** - Each algorithm gets its own personality with carefully chosen icons

## 🚀 Quick Start

```bash
# Clone the magic
git clone https://github.com/your-username/sorting-algo-visualizer
cd sorting-algo-visualizer

# Install dependencies
npm install

# Start the show!
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and prepare to be amazed! 🎭

## 🧮 The Algorithms

| Algorithm | Icon | Time Complexity | Space | What it sounds like |
|-----------|------|----------------|-------|-------------------|
| **Bubble Sort** | 🫧 | O(n²) | O(1) | Gentle bubbling as values float up |
| **Selection Sort** | 👆 | O(n²) | O(1) | Methodical searching and selecting |
| **Insertion Sort** | ⬇️ | O(n²) | O(1) | Cards being sorted one by one |
| **Merge Sort** | 🔀 | O(n log n) | O(n) | Harmonious merging of sequences |
| **Quick Sort** | ⚡ | O(n log n) | O(log n) | Lightning-fast partitioning |
| **Heap Sort** | 🌳 | O(n log n) | O(1) | Tree structures reorganizing |
| **Counting Sort** | # | O(n + k) | O(k) | Systematic counting patterns |

## 🎛️ Features that Spark Joy

### 🎵 Audio Experience
- **Real-time audio feedback** - hear the data as it moves
- **Customizable frequency range** (50Hz - 4000Hz)
- **Welcome chime** on first interaction
- **Toggle on/off** when you need focus

### 🎨 Visual Delights
- **Color-coded states**: Blue for comparing, Red for swapping, Green for completion
- **Final sweep animation** - watch the satisfaction of completion
- **Responsive design** - looks great on any screen
- **Dark theme** with carefully chosen colors

### ⚙️ Customization Galore
- **Array size**: 10 to 150 elements
- **Speed control**: From zen-slow to lightning-fast
- **Sort direction**: Ascending or descending
- **Even gaps**: For better visual distribution
- **All settings persist** between sessions!

### 🎯 Smart UX
- **Draft input mode** - type freely without aggressive validation
- **Disabled states** prevent conflicts during animation
- **Go back feature** - return to original unsorted state
- **Keyboard accessible** with proper ARIA labels

## 🛠️ Technical Highlights

### ⚡ Performance
- **Generator-based algorithms** for smooth step-by-step execution
- **requestAnimationFrame** for butter-smooth 60fps animations
- **Efficient state management** with refs for hot paths
- **Minimal re-renders** through careful dependency management

### 🎵 Audio Magic
- **Web Audio API** for real-time tone generation
- **Exponential gain ramping** for pleasant audio transitions
- **Frequency mapping** that scales data values to musical notes
- **Audio context management** with proper cleanup

### 💾 State Persistence
- **localStorage integration** with error handling
- **Settings auto-save** on every change
- **Algorithm selection memory** across sessions
- **Graceful fallbacks** for unsupported browsers

## 🎮 How to Use

1. **Pick an algorithm** from the sidebar (each has its unique icon!)
2. **Adjust settings** - size, speed, audio preferences
3. **Hit play** ▶️ and watch the magic happen
4. **Turn on audio** 🔊 for the full experience
5. **Experiment** with different algorithms and settings

### Pro Tips 💡
- Try **Merge Sort with audio** - it sounds like a digital symphony!
- Use **Even Gaps** for better visual patterns
- **Final Sweep** makes completion super satisfying
- **Speed = 1** to see every single step in detail

## 🔧 Development

Built with modern tools and practices:
- **React 19** with hooks and functional components
- **TypeScript** for type safety and better DX
- **Vite** for lightning-fast development
- **CSS Variables** for consistent theming
- **ESLint** for code quality

### Project Structure
```
src/
├── App.tsx           # Main app with state orchestration
├── Sidebar.tsx       # Algorithm selection with icons
├── Visualizer.tsx    # Main visualization component
├── algorithms.ts     # All sorting implementations
├── App.css          # Component styles
└── index.css        # Global styles & theme
```

## 🤝 Contributing

Found a bug? Have an idea? Contributions are welcome!

**Ideas for future enhancements:**
- More algorithms (Radix Sort, Shell Sort, etc.)
- Algorithm comparison mode
- Export visualization as GIF/video
- Custom color themes
- 3D visualization mode
- Educational mode with step explanations

## 🎉 Fun Facts

- The audio system maps array values to frequencies linearly, creating unique "musical signatures" for each algorithm
- The project uses JavaScript generators to pause and resume algorithm execution at any step
- All 7 algorithms are implemented from scratch with proper complexity handling
- The color palette uses zinc scales for a modern, professional look
- Settings persistence works completely offline - no servers needed!

## 📜 License

MIT License - feel free to learn, modify, and share!

---

**Made with 💜 by a developer who believes computer science should be beautiful, interactive, and fun!**

*"The best way to understand an algorithm is to watch it dance and hear it sing."* 🎵✨

## 🌟 Star this repo if it made you smile! ⭐
