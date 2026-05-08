import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { getChapters } from "../services/api";
import "../assets/styles/CommunityPage.css";

const RAW_API_BASE = import.meta.env.VITE_API_URL || "https://citysense-api.onrender.com";
const API_BASE = RAW_API_BASE.replace(/\/+$/, "");

function CommunityPage() {
  const { user, showToast } = useApp();
  const userId = user?._id || user?.id;
  const username = user?.username || user?.name || "Anonymous";

  const [posts, setPosts] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState("");
  const [text, setText] = useState("");
  const [location_text, setLocation] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [likingPostId, setLikingPostId] = useState(null);
  const [deletingPostId, setDeletingPostId] = useState(null);
  const [error, setError] = useState(null);
  const [postsError, setPostsError] = useState(null);

  // Time string — same pattern as Journal/Challenges
  const [timeStr, setTimeStr] = useState('');
  useEffect(() => {
    const updateTime = () => {
      const d = new Date(), h = d.getHours(), m = d.getMinutes();
      const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
      const hh = h % 12 || 12, ampm = h >= 12 ? 'PM' : 'AM';
      setTimeStr(`${days[d.getDay()]}, ${String(hh).padStart(2,'0')}:${String(m).padStart(2,'0')} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch chapters — uses the shared API service (same as ChaptersPage/MapPage)
  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const citiesData = await getChapters();
        // API returns a flat array of City objects: [{ id, name, chapters: [...] }, ...]
        if (Array.isArray(citiesData) && citiesData.length > 0) {
          const allChapters = citiesData.flatMap((city) =>
            (city.chapters || []).map((ch) => ({
              ...ch,
              city: city.name,
            }))
          );
          setChapters(allChapters);
          if (allChapters.length > 0) {
            setSelectedChapter(allChapters[0].id);
          }
          setError(null);
        } else {
          setError("No chapters found. Please try again later.");
        }
      } catch (err) {
        console.error("Error fetching chapters:", err);
        if (err instanceof TypeError) {
          setError("Network error: Unable to connect to server. Check your internet connection.");
        } else {
          setError(`Failed to load chapters: ${err.message}`);
        }
      }
    };
    fetchChapters();
  }, []);

  // Fetch posts for selected chapter
  useEffect(() => {
    if (selectedChapter) {
      const fetchPosts = async () => {
        setLoadingPosts(true);
        setPostsError(null);
        try {
          const res = await fetch(`${API_BASE}/community/posts/chapter/${selectedChapter}`);
          if (!res.ok) {
            throw new Error(`Server error: ${res.status} ${res.statusText}`);
          }
          const data = await res.json();
          setPosts(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error("Error fetching posts:", err);
          if (err instanceof TypeError) {
            setPostsError("Network error: Unable to load stories. Check your internet connection.");
          } else {
            setPostsError(`Failed to load stories: ${err.message}`);
          }
          setPosts([]);
        } finally {
          setLoadingPosts(false);
        }
      };
      fetchPosts();
    }
  }, [selectedChapter]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || !selectedChapter || !userId) {
      setError("Please fill in all required fields and ensure you're logged in");
      return;
    }

    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("username", username);
    formData.append("chapter_id", selectedChapter);
    formData.append("text", text);
    formData.append("location", location_text || "");
    if (image) {
      formData.append("image", image);
    }

    try {
      const response = await fetch(`${API_BASE}/community/posts`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const newPost = await response.json();
        setPosts([newPost, ...posts]);
        setText("");
        setLocation("");
        setImage(null);
        setImagePreview("");
        showToast('✦', 'Story published!');
      } else if (response.status === 400) {
        const errorData = await response.json();
        setError(errorData.detail || "Invalid input. Please check your post content.");
      } else if (response.status === 401) {
        setError("You must be logged in to create a post.");
      } else if (response.status === 413) {
        setError("Image file is too large. Please use a smaller image.");
      } else {
        setError(`Failed to create post (${response.status}). Please try again.`);
      }
    } catch (err) {
      console.error("Error creating post:", err);
      if (err instanceof TypeError) {
        setError("Network error: Unable to create post. Check your internet connection.");
      } else {
        setError(`Error creating post: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    if (!userId) {
      setError("Please log in to like posts");
      return;
    }
    
    setLikingPostId(postId);
    try {
      const formData = new FormData();
      formData.append("user_id", userId);

      const response = await fetch(
        `${API_BASE}/community/posts/${postId}/like`,
        {
          method: "PUT",
          body: formData,
        }
      );
      if (response.ok) {
        const updatedPost = await response.json();
        setPosts(posts.map((p) => (p.id === postId ? updatedPost : p)));
        setError(null);
      } else if (response.status === 400) {
        setError("Invalid post ID. Please try again.");
      } else if (response.status === 401) {
        setError("Please log in to like posts");
      } else if (response.status === 404) {
        setError("Post not found. It may have been deleted.");
        setPosts(posts.filter((p) => p.id !== postId));
      } else {
        setError(`Failed to like post (${response.status}). Please try again.`);
      }
    } catch (err) {
      console.error("Error liking post:", err);
      if (err instanceof TypeError) {
        setError("Network error: Unable to like post. Check your internet connection.");
      } else {
        setError(`Error liking post: ${err.message}`);
      }
    } finally {
      setLikingPostId(null);
    }
  };

  const handleDelete = async (postId) => {
    if (!userId) {
      setError("Please log in to delete posts");
      return;
    }
    
    if (window.confirm("Are you sure you want to delete this post?")) {
      setDeletingPostId(postId);
      setError(null);
      try {
        const formData = new FormData();
        formData.append("user_id", userId);

        const response = await fetch(
          `${API_BASE}/community/posts/${postId}`,
          {
            method: "DELETE",
            body: formData,
          }
        );
        if (response.ok) {
          setPosts(posts.filter((p) => p.id !== postId));
          showToast('✕', 'Post deleted');
        } else if (response.status === 400) {
          setError("Invalid post ID. Please try again.");
        } else if (response.status === 401) {
          setError("Please log in to delete posts");
        } else if (response.status === 403) {
          setError("You can only delete your own posts");
        } else if (response.status === 404) {
          setError("Post not found. It may have already been deleted.");
          setPosts(posts.filter((p) => p.id !== postId));
        } else {
          setError(`Failed to delete post (${response.status}). Please try again.`);
        }
      } catch (err) {
        console.error("Error deleting post:", err);
        if (err instanceof TypeError) {
          setError("Network error: Unable to delete post. Check your internet connection.");
        } else {
          setError(`Error deleting post: ${err.message}`);
        }
      } finally {
        setDeletingPostId(null);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  const selectedChapterData = chapters.find((ch) => ch.id === selectedChapter);

  // Show error if user not logged in
  if (!user || !userId) {
    return (
      <div className="page active" id="page-community" style={{ display: 'grid', gridTemplateColumns: '360px 1fr' }}>
        <aside className="left-panel anim-in">
          <div className="greeting-block">
            <div className="greeting-time-line">{timeStr}</div>
            <div className="greeting-name">Community<br/><em>Stories</em> 🌍</div>
            <div className="greeting-sub">Please <span className="gs-hi">log in</span> to view and share community stories.</div>
          </div>
        </aside>
        <div className="right-panel community-right">
          <div style={{ textAlign: 'center', padding: '80px 28px', color: 'var(--text3)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '22px', fontWeight: 600, color: 'var(--text)', marginBottom: '8px' }}>Sign in Required</div>
            <div style={{ fontSize: '13px', color: 'var(--text2)' }}>You need to be logged in to access this feature.</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page active" id="page-community" style={{ display: 'grid', gridTemplateColumns: '360px 1fr' }}>

      {/* ────── LEFT PANEL ────── */}
      <aside className="left-panel anim-in">
        <div className="greeting-block">
          <div className="greeting-time-line">{timeStr}</div>
          <div className="greeting-name">Community<br/><em>Stories</em> 🌍</div>
          <div className="greeting-sub">Share your experiences and <span className="gs-hi">discoveries</span> with the community.</div>
        </div>

        {/* Stats */}
        <div className="sec-divider"><span className="sec-icon">◈</span><span className="sec-label">Community Stats</span><div className="sec-line"></div></div>
        <div className="stats-grid">
          <div className="stat-tile"><div className="stat-emoji">📝</div><div className="stat-num">{posts.length}</div><div className="stat-lbl">Stories</div></div>
          <div className="stat-tile"><div className="stat-emoji">📖</div><div className="stat-num">{chapters.length}</div><div className="stat-lbl">Chapters</div></div>
          <div className="stat-tile"><div className="stat-emoji">👥</div><div className="stat-num">{new Set(posts.map(p => p.user_id)).size}</div><div className="stat-lbl">Authors</div></div>
        </div>

        {/* Chapter Selector */}
        <div className="sec-divider"><span className="sec-icon">📍</span><span className="sec-label">Select Chapter</span><div className="sec-line"></div></div>
        <div className="comm-chapter-wrapper">
          <div className="comm-chapter-list">
            {chapters.map((chapter) => (
              <div
                key={chapter.id}
                className={`comm-chapter-pill ${selectedChapter === chapter.id ? 'selected' : ''}`}
                onClick={() => setSelectedChapter(chapter.id)}
              >
                <span className="comm-ch-emoji">{chapter.emoji}</span>
                <div className="comm-ch-info">
                  <div className="comm-ch-name">{chapter.area}</div>
                  <div className="comm-ch-meta">{chapter.num} · {chapter.city}</div>
                </div>
                {selectedChapter === chapter.id && <span className="comm-ch-active">●</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Compose shortcut */}
        <div className="sec-divider"><span className="sec-icon">✦</span><span className="sec-label">Quick Post</span><div className="sec-line"></div></div>
        <div style={{ padding: '0 16px 20px' }}>
          <div className="comm-compose-mini">
            <div style={{ fontSize: '18px', marginBottom: '6px' }}>✍️</div>
            <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '3px' }}>Share a Story</div>
            <div style={{ fontSize: '11px', color: 'var(--text2)', lineHeight: 1.5 }}>Write about your experience in <em style={{ color: 'var(--gold)' }}>{selectedChapterData?.area || 'a chapter'}</em></div>
          </div>
        </div>
      </aside>

      {/* ────── RIGHT PANEL ────── */}
      <div className="right-panel community-right">

        {/* Hero banner — same pattern as Challenges hero */}
        <div className="comm-hero">
          <div className="comm-hero-emoji">🌍</div>
          <div className="comm-hero-text">
            <h2>Community <em>Stories</em></h2>
            <p>Real experiences from city explorers. Share your walks, discoveries, and neighbourhood moments.</p>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="comm-error-banner">
            <span>⚠️</span>
            <span style={{ flex: 1, fontSize: '12.5px' }}>{error}</span>
            <button className="comm-error-close" onClick={() => setError(null)}>✕</button>
          </div>
        )}

        {/* Compose card */}
        <div className="comm-compose-card">
          <div className="comm-compose-header">
            <div className="comm-compose-avatar">{username[0].toUpperCase()}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '2px' }}>{username}</div>
              <div style={{ fontSize: '10px', fontFamily: "'Courier Prime',monospace", color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.08em' }}>
                {selectedChapterData ? `${selectedChapterData.emoji} ${selectedChapterData.area}` : 'Select a chapter'}
              </div>
            </div>
          </div>
          <form onSubmit={handleSubmit}>
            <textarea
              id="text-input"
              className="comm-textarea"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What did you discover today?"
              rows="3"
              required
            />
            <div className="comm-compose-actions">
              <div className="comm-action-row">
                <label htmlFor="location-input" className="comm-action-chip">
                  <span>📍</span>
                  <input
                    id="location-input"
                    type="text"
                    className="comm-inline-input"
                    value={location_text}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Add location"
                  />
                </label>
                <label htmlFor="image-input" className="comm-action-chip comm-action-upload">
                  <span>🖼</span>
                  <span className="comm-action-label">Photo</span>
                  <input
                    id="image-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
              <button
                type="submit"
                className="comm-publish-btn"
                disabled={loading || !selectedChapter || !text.trim()}
              >
                {loading ? "Publishing…" : "✦ Publish"}
              </button>
            </div>
            {imagePreview && (
              <div className="comm-img-preview">
                <img src={imagePreview} alt="Preview" />
                <button
                  type="button"
                  className="comm-img-remove"
                  onClick={() => { setImage(null); setImagePreview(""); }}
                >✕</button>
              </div>
            )}
          </form>
        </div>

        {/* Feed header */}
        <div className="comm-feed-header">
          <div className="section-h">
            {selectedChapterData
              ? <>{selectedChapterData.emoji} <em>{selectedChapterData.area}</em></>
              : <>Community <em>Feed</em></>
            }
          </div>
          {loadingPosts && <span className="badge badge-gold">⏳ Loading</span>}
        </div>

        {/* Feed content */}
        {loadingPosts ? (
          <div className="comm-loading">
            <div className="comm-spinner"></div>
            <p>Loading stories…</p>
          </div>
        ) : postsError ? (
          <div className="comm-feed-error">
            <p>⚠️ {postsError}</p>
            <button className="add-btn" onClick={() => window.location.reload()}>Retry</button>
          </div>
        ) : posts.length === 0 ? (
          <div className="comm-empty">
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>📭</div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '20px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>No stories yet</div>
            <div style={{ fontSize: '12.5px', color: 'var(--text2)' }}>Be the first to share your experience in this chapter! 🚀</div>
          </div>
        ) : (
          <div className="comm-posts-list anim-in">
            {posts.map((post) => (
              <div key={post.id} className="comm-post-card">
                <div className="comm-post-header">
                  <div className="comm-post-user">
                    <div className="comm-avatar">{post.username[0].toUpperCase()}</div>
                    <div>
                      <div className="comm-username">{post.username}</div>
                      <div className="comm-date">{formatDate(post.created_at)}</div>
                    </div>
                  </div>
                  {userId === post.user_id && (
                    <button
                      className="comm-delete-btn"
                      onClick={() => handleDelete(post.id)}
                      title="Delete post"
                      disabled={deletingPostId === post.id}
                    >
                      {deletingPostId === post.id ? "⏳" : "✕"}
                    </button>
                  )}
                </div>

                {post.image_url && (
                  <div className="comm-post-image">
                    <img src={`${API_BASE}${post.image_url}`} alt="Post" />
                  </div>
                )}

                <div className="comm-post-body">
                  <p className="comm-post-text">{post.text}</p>
                  {post.location && (
                    <div className="comm-post-location">
                      <span className="badge badge-sky">📍 {post.location}</span>
                    </div>
                  )}
                </div>

                <div className="comm-post-footer">
                  <button
                    className="comm-like-btn"
                    onClick={() => handleLike(post.id)}
                    disabled={likingPostId === post.id}
                  >
                    {likingPostId === post.id ? "⏳" : `👍 ${post.likes}`}
                  </button>
                  <span className="comm-footer-meta">
                    {selectedChapterData && `${selectedChapterData.emoji} ${selectedChapterData.area}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CommunityPage;
