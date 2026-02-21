# 你都叫对了吗？ — Chinese Kinship Calculator

A React + Vite app to help users learn and remember Chinese kinship relationships (family relationships).

## ✨ Features

### Supported Relationships

- **Grandparents** — 爷爷, 奶奶, 外公, 外婆
- **Parents** — 爸爸, 妈妈
- **Siblings** — 哥哥, 弟弟, 姐姐, 妹妹
- **Children** — 儿子, 女儿
- **Nephews/Nieces** — 侄子, 侄女, 外甥, 外甥女
- **First Cousins** — 堂哥, 表妹 (+ age selector)
- **In-Laws** (NEW!) — 岳父, 婆婆, 大舅子, 嫂子, 姐夫, etc.

### User Experience

- 📱 **Calculator-style UI** — Intuitive path construction
- 🔊 **Pronunciation Support** — Click the volume icon to hear pronunciation
- 🎨 **macOS-style Design** — Clean, modern interface
- ⚡ **Responsive** — Works on desktop & mobile

## 🚀 Getting Started

### Install Dependencies

```bash
npm install
```

### Development Server

```bash
npm run dev
# Open http://localhost:5173
```

### Build for Production

```bash
npm run build
# Output: dist/
```

## 📚 Documentation

### For Users

- Try the app at: https://kinship-calculator.vercel.app

### For Developers

- 📖 [Quick Start Guide](./QUICK_START.md) — 30-second overview
- 🏗️ [In-Law Implementation](./IN_LAW_IMPLEMENTATION.md) — Architecture details
- 📊 [Architecture Diagrams](./ARCHITECTURE_DIAGRAMS.md) — Visual flows & examples
- 🧪 [Test Suite](./test_inlaw.js) — All test cases
- 📋 [Complete Guide](./IN_LAW_COMPLETE_GUIDE.md) — Everything in detail

## 🧪 Testing

```bash
# Run all in-law relationship tests
node test_inlaw.js

# Expected output: Passed: 23/23 ✓
```

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **State Management**: React Hooks (useState)
- **Build Tool**: Vite
- **Deployment**: Vercel

## 📦 Recent Updates

### In-Law Relationships (Latest)

✅ Added support for spouse's family  
✅ Added support for spouse relationships  
✅ Clean modular architecture  
✅ 16 new relationships, 23/23 tests passing

See: [IN_LAW_IMPLEMENTATION.md](./IN_LAW_IMPLEMENTATION.md)

### Pronunciation Feature

✅ Click 🔊 icon to hear pronunciation  
✅ Adjustable speed and clarity  
✅ Supports Mandarin Chinese

## 📄 License

MIT

## 🙋 Support

See the documentation files for detailed information on how everything works and how to extend it.
