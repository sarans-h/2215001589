import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import TopUsers from './pages/TopUsers'
import TrendingPosts from './pages/TrendingPosts'
import Feed from './pages/Feed'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="sticky top-0 bg-white shadow-sm py-4 px-6 z-50">
          <div className="max-w-7xl mx-auto flex justify-center space-x-8">
            <Link to="/" className="px-4 py-2 rounded-md hover:bg-gray-100 text-gray-700 font-medium">Top Users</Link>
            <Link to="/trending" className="px-4 py-2 rounded-md hover:bg-gray-100 text-gray-700 font-medium">Trending Posts</Link>
            <Link to="/feed" className="px-4 py-2 rounded-md hover:bg-gray-100 text-gray-700 font-medium">Feed</Link>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<TopUsers />} />
            <Route path="/trending" element={<TrendingPosts />} />
            <Route path="/feed" element={<Feed />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
