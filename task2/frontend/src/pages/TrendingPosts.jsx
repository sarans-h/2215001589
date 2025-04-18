import { useState, useEffect } from 'react'

function TrendingPosts() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTrendingPosts = async () => {
      try {
        const response = await fetch('http://localhost:8080/posts?type=popular')
        if (!response.ok) {
          throw new Error('Failed to fetch trending posts')
        }
        const data = await response.json()
        setPosts(data)
        setLoading(false)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }

    fetchTrendingPosts()
  }, [])

  if (loading) return <div className="text-center py-8 text-lg">Loading...</div>
  if (error) return <div className="text-center py-8 text-red-600">{error}</div>

  return (
    <div>
      <h1 className="text-3xl font-bold text-blue-600 mb-6">Trending Posts</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {posts.map(post => (
          <div key={post.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-semibold">
                {post.userName.charAt(0).toUpperCase()}
              </div>
              <h3 className="ml-3 font-medium text-gray-800">{post.userName}</h3>
            </div>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{post.title}</h2>
              <p className="text-gray-600 line-clamp-3">{post.content}</p>
            </div>
            <div className="pt-4 border-t border-gray-100">
              <span className="text-gray-500 text-sm">
                💬 {post.commentCount} comments
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TrendingPosts 