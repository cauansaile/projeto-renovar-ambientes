import React, { useState, useEffect } from "react";
import "./admin.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

const AdminPanel = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    label: "",
    image: "",
  });
  const [editPost, setEditPost] = useState(null);
  const [editData, setEditData] = useState({
    title: "",
    content: "",
    label: "",
    image: "",
  });
  const [images] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  // --- Login ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (password === "1234") {
        setIsLoggedIn(true);
      } else {
        alert("Senha incorreta!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- Buscar posts ---
  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/posts`);
      if (!res.ok) throw new Error("Erro ao buscar posts");
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchPosts();
    }
  }, [isLoggedIn]);

  // --- Criar novo post ---
  const handleSubmitPost = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPost),
      });
      if (!res.ok) throw new Error("Erro ao criar post");
      await fetchPosts();
      setNewPost({ title: "", content: "", label: "", image: "" });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Editar post ---
  const handleEditPost = async () => {
    if (!editPost) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/posts/${editPost.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      if (!res.ok) throw new Error("Erro ao editar post");
      await fetchPosts();
      setEditPost(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Deletar post ---
  const handleDeletePost = async (id) => {
    if (!window.confirm("Tem certeza que deseja deletar este post?")) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/posts/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erro ao deletar post");
      await fetchPosts();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Upload de imagem ---
  const handleUploadImage = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Erro ao fazer upload");

      const data = await res.json();
      if (type === "new") {
        setNewPost({ ...newPost, image: data.imageUrl });
      } else {
        setEditData({ ...editData, image: data.imageUrl });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Render ---
  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <form className="login-form" onSubmit={handleLogin}>
          <h2>Login</h2>
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <h1>Painel Administrativo</h1>

      {/* Criar Post */}
      <form className="form-card" onSubmit={handleSubmitPost}>
        <h2>Criar Novo Post</h2>
        <input
          type="text"
          placeholder="Título"
          value={newPost.title}
          onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
          required
        />
        <textarea
          placeholder="Conteúdo em markdown"
          value={newPost.content}
          onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Label"
          value={newPost.label}
          onChange={(e) => setNewPost({ ...newPost, label: e.target.value })}
          required
        />

        {/* Imagem */}
        <div className="image-picker">
          <label>Escolher imagem existente:</label>
          <div className="image-options">
            {images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt="Opção"
                onClick={() => setNewPost({ ...newPost, image: img })}
                className={newPost.image === img ? "selected" : ""}
              />
            ))}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleUploadImage(e, "new")}
          />
          {newPost.image && <img src={newPost.image} alt="Preview" />}
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Criando..." : "Criar Post"}
        </button>
      </form>

      {/* Lista de Posts */}
      <div className="posts-list">
        <h2>Posts</h2>
        {posts.map((post) => (
          <div key={post.id} className="post-item">
            <h3>{post.title}</h3>
            <p>{post.label}</p>
            <div className="actions">
              <button
                onClick={() => {
                  setEditPost(post);
                  setEditData(post);
                }}
              >
                Editar
              </button>
              <button onClick={() => handleDeletePost(post.id)}>Excluir</button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Edição */}
      {editPost && (
        <div className="modal">
          <div className="modal-content">
            <h2>Editar Post</h2>
            <input
              type="text"
              value={editData.title}
              onChange={(e) =>
                setEditData({ ...editData, title: e.target.value })
              }
            />
            <textarea
              value={editData.content}
              onChange={(e) =>
                setEditData({ ...editData, content: e.target.value })
              }
            />
            <input
              type="text"
              value={editData.label}
              onChange={(e) =>
                setEditData({ ...editData, label: e.target.value })
              }
            />

            <div className="image-picker">
              <label>Escolher imagem existente:</label>
              <div className="image-options">
                {images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt="Opção"
                    onClick={() => setEditData({ ...editData, image: img })}
                    className={editData.image === img ? "selected" : ""}
                  />
                ))}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleUploadImage(e, "edit")}
              />
              {editData.image && <img src={editData.image} alt="Preview" />}
            </div>

            {/* Preview Markdown */}
            <h3>Preview:</h3>
            <div className="content-preview">
              <ReactMarkdown
                children={editData.content}
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
              />
            </div>

            <button onClick={handleEditPost} disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </button>
            <button onClick={() => setEditPost(null)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
