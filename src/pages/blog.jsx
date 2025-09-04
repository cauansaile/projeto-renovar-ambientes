import React, { useState, useEffect } from "react";
import "./blog.css";
import NavBar from "../components/navbar";

const imagensPreCarregadas = [
  "https://cdn.pixabay.com/photo/2015/01/08/18/26/man-593333_1280.jpg",
  "https://cdn.pixabay.com/photo/2020/08/25/18/29/workplace-5517755_1280.jpg",
  "https://cdn.pixabay.com/photo/2021/11/27/08/55/woodworking-6827533_1280.jpg",
  "https://cdn.pixabay.com/photo/2016/12/30/07/59/kitchen-1940174_1280.jpg",
  "https://cdn.pixabay.com/photo/2022/01/04/05/29/kitchen-6914223_1280.jpg"
];

// Função para obter uma imagem aleatória
const obterImagemAleatoria = () => {
  const indiceAleatorio = Math.floor(Math.random() * imagensPreCarregadas.length);
  return imagensPreCarregadas[indiceAleatorio];
};

const RenovarBlog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [, setNavbarScrolled] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const handleScroll = () => {
      setNavbarScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    loadPosts();

    // Pré-carregar imagens
    imagensPreCarregadas.forEach(src => {
      const img = new Image();
      img.src = src;
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);


  const loadPosts = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/posts`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const postsData = await res.json();
      setPosts(postsData);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
      setError(
        "Não foi possível carregar os posts. Por favor, tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePostClick = (post) => {
    const identifier = post.slug || post.id;
    window.location.href = `/blog/${identifier}`;
  };

  return (
    <>
      <NavBar />
      <div className="renovar-blog">
        <HeroSection />
        <PostsSection
          posts={posts}
          loading={loading}
          error={error}
          onRetry={loadPosts}
          onPostClick={handlePostClick}
        />
      </div>
    </>
  );
};

const HeroSection = () => {
  return (
    <section className="hero">
      <div className="overlay">
        <h1 className="title">Bem vindo ao Blog renovar</h1>
        
      </div>
    </section>
  );
};

const PostsSection = ({ posts, loading, error, onRetry, onPostClick }) => {
  return (
    <section className="posts-section">
      <div className="section-title">
        <h2>POSTAGENS RECENTES</h2>
        <p>FIQUE ATUALIZADO COM NOSSOS ÚLTIMOS ARTIGOS E INSIGHTS</p>
      </div>

      <main id="blog-posts">
        {loading && <LoadingState />}
        {error && <ErrorState error={error} onRetry={onRetry} />}
        {!loading && !error && posts.length === 0 && <EmptyState />}
        {!loading && !error && posts.length > 0 && (
          <PostsGrid posts={posts} onPostClick={onPostClick} />
        )}
      </main>
    </section>
  );
};

const LoadingState = () => {
  return <div className="loading"></div>;
};

const ErrorState = ({ error, onRetry }) => {
  return (
    <div className="empty-state">
      <h3>Não foi possível carregar os posts</h3>
      <p>{error}</p>
      <button className="cta-button" onClick={onRetry}>
        Tentar Novamente
      </button>
    </div>
  );
};

const EmptyState = () => {
  return (
    <div className="empty-state">
      <h3>Nenhum post ainda</h3>
    </div>
  );
};

const PostsGrid = ({ posts, onPostClick }) => {
  return (
    <div className="posts-grid">
      {posts.reverse().map((post) => (
        <PostCard key={post.id} post={post} onClick={() => onPostClick(post)} />
      ))}
    </div>
  );
};

/*const PostCard = ({ post, onClick }) => {
  return (
    <div className="post" onClick={onClick}>
      <img
        src="https://cdn.pixabay.com/photo/2015/01/08/18/26/man-593333_1280.jpg"
        alt={post.title}
      />
      <div className="post-content">
        <h2>
          {post.title.length > 25
            ? post.title.substring(0, 25) + "..."
            : post.title}
        </h2>
        <p>
          {post.content.length > 50
            ? post.content.substring(0, 50) + "..."
            : post.content}
        </p>
        <div className="post-meta">
          <span className="label">
            {post.label.length > 25
              ? post.label.substring(0, 25) + "..."
              : post.label}
          </span>
          <span className="date">{post.date}</span>
        </div>
      </div>
    </div>
  );
};*/

const PostCard = ({ post, onClick }) => {
  // Gera uma imagem aleatória para cada post
  const [imagemAleatoria] = useState(obterImagemAleatoria());

  return (
    <div className="post" onClick={onClick}>
      <img
        src={imagemAleatoria}
        alt={post.title}
        onError={(e) => {
          // Fallback caso a imagem não carregue
          e.target.src = "https://cdn.pixabay.com/photo/2015/01/08/18/26/man-593333_1280.jpg";
        }}
      />
      <div className="post-content">
        <h2>
          {post.title.length > 25
            ? post.title.substring(0, 25) + "..."
            : post.title}
        </h2>
        <p>
          {post.content.length > 50
            ? post.content.substring(0, 50) + "..."
            : post.content}
        </p>
        <div className="post-meta">
          <span className="label">
            {post.label.length > 25
              ? post.label.substring(0, 25) + "..."
              : post.label}
          </span>
          <span className="date">{post.date}</span>
        </div>
      </div>
    </div>
  );
};

export default RenovarBlog;