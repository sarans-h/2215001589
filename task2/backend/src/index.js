import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const API_BASE_URL = process.env.API_BASE_URL || 'http://20.244.56.144/evaluation-service';

// Authentication details
const AUTH_PAYLOAD = {
    email: "saransh.gupta_cs22@gla.ac.in",
    name: "saransh gupta",
    rollNo: "2215001589",
    accessCode: "CNneGT",
    clientID: "e54cee08-d3d7-4663-b48b-1f6e251b3928",
    clientSecret: "qNaJcUAchKqUrWUF"
};

let authToken = null;

// Helper function to sleep
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// Get auth token once at startup
async function initAuth() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(AUTH_PAYLOAD)
        });

        if (!response.ok) {
            throw new Error(`Auth failed with status: ${response.status}`);
        }

        const data = await response.json();
        authToken = data.access_token;
        console.log('Got auth token successfully');
    } catch (error) {
        console.error('Auth error:', error);
        throw error;
    }
}

// API call function with retries
async function callApi(url, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            // Add delay between requests
            await sleep(1000);

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Accept': 'application/json'
                }
            });

            // If we get a 503, wait and retry
            if (response.status === 503) {
                console.log(`Got 503 for ${url}, attempt ${i + 1}/${retries}`);
                await sleep(2000 * (i + 1)); // Exponential backoff
                continue;
            }

            if (!response.ok) {
                throw new Error(`API call failed with status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            if (i === retries - 1) throw error;
            await sleep(2000 * (i + 1)); // Exponential backoff
        }
    }
    throw new Error(`Failed after ${retries} retries`);
}

// Initialize server
async function startServer() {
    await initAuth();

    app.use(express.json());

    // Get top users endpoint
    app.get('/users', async (req, res) => {
        try {
            const userData = await callApi(`${API_BASE_URL}/users`);
            if (!userData.users) {
                throw new Error('No users data received');
            }

            const users = Object.entries(userData.users).map(([id, name]) => ({
                id,
                name,
                commentCount: 0
            }));

            // Process first 10 users to find top 5
            const limitedUsers = users.slice(0, 10);
            
            for (const user of limitedUsers) {
                try {
                    const postsData = await callApi(`${API_BASE_URL}/users/${user.id}/posts`);
                    if (postsData.posts && Array.isArray(postsData.posts)) {
                        // Get first 5 posts per user
                        const limitedPosts = postsData.posts.slice(0, 5);
                        for (const post of limitedPosts) {
                            try {
                                const commentsData = await callApi(`${API_BASE_URL}/posts/${post.id}/comments`);
                                if (commentsData.comments && Array.isArray(commentsData.comments)) {
                                    user.commentCount += commentsData.comments.length;
                                }
                            } catch (error) {
                                console.log(`Skipping comments for post ${post.id}:`, error.message);
                            }
                        }
                    }
                } catch (error) {
                    console.log(`Skipping posts for user ${user.id}:`, error.message);
                }
            }

            const topUsers = limitedUsers
                .sort((a, b) => b.commentCount - a.commentCount)
                .slice(0, 5);

            res.json(topUsers);
        } catch (error) {
            console.error('Error in /users:', error);
            res.status(500).json({ error: 'Failed to fetch data' });
        }
    });

    // Get posts endpoint
    app.get('/posts', async (req, res) => {
        try {
            const type = req.query.type || 'popular';
            if (!['popular', 'latest'].includes(type)) {
                return res.status(400).json({ error: 'Invalid type parameter' });
            }

            const userData = await callApi(`${API_BASE_URL}/users`);
            if (!userData.users) {
                throw new Error('No users data received');
            }

            const allPosts = [];
            // Get first 5 users
            const limitedUsers = Object.entries(userData.users).slice(0, 5);

            for (const [userId, userName] of limitedUsers) {
                try {
                    const postsData = await callApi(`${API_BASE_URL}/users/${userId}/posts`);
                    if (postsData.posts && Array.isArray(postsData.posts)) {
                        // Get first 5 posts per user
                        const limitedPosts = postsData.posts.slice(0, 5);
                        for (const post of limitedPosts) {
                            try {
                                const commentsData = await callApi(`${API_BASE_URL}/posts/${post.id}/comments`);
                                allPosts.push({
                                    ...post,
                                    userId,
                                    userName,
                                    commentCount: commentsData.comments?.length || 0
                                });
                            } catch (error) {
                                console.log(`Skipping comments for post ${post.id}:`, error.message);
                                allPosts.push({
                                    ...post,
                                    userId,
                                    userName,
                                    commentCount: 0
                                });
                            }
                        }
                    }
                } catch (error) {
                    console.log(`Skipping posts for user ${userId}:`, error.message);
                }
            }

            if (type === 'popular') {
                const maxComments = Math.max(...allPosts.map(post => post.commentCount));
                res.json(allPosts.filter(post => post.commentCount === maxComments));
            } else {
                res.json(allPosts.sort((a, b) => b.id - a.id).slice(0, 5));
            }
        } catch (error) {
            console.error('Error in /posts:', error);
            res.status(500).json({ error: 'Failed to fetch data' });
        }
    });

    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}

// Start everything
startServer().catch(console.error); 