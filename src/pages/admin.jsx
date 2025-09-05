import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import "./admin.css";

const imagensDisponiveis = [
  "https://cdn.pixabay.com/photo/2022/01/04/05/29/kitchen-6914223_1280.jpg",
  "https://cdn.pixabay.com/photo/2016/12/30/07/59/kitchen-1940174_1280.jpg",
  "https://cdn.pixabay.com/photo/2015/01/08/18/26/man-593333_1280.jpg",
  "https://cdn.pixabay.com/photo/2020/08/25/18/29/workplace-5517755_1280.jpg"
];

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState({
    title: "",
    content: "",
    label: "",
    file: null,
    image: ""
  });
  const [selectedPost, setSelectedPost] = useState(null);
  const [modal, setModal] = useState({ type: "", post: null });
  const [message, setMessage] = useState({ type: "", text: "" });

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      setIsAuthenticated(true);
      loadPosts();
    }
  }, []);

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: "", text: "" }), 5000);
      return () => clearTimeout(timer);
    }
  }, [message.text]);

  const loadPosts = async () => {
    try {
      const res = await fetch(`${API_URL}/posts`);
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Erro ao criar post" });
      
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
        setIsAuthenticated(true);
        loadPosts();
      } else {
        setMessage({ type: "error", text: "Login falhou. Verifique suas credenciais." });
      }
    } catch {
      setMessage({ type: "error", text: "Erro ao fazer login" });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setPosts([]);
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      let body;
      let headers = { Authorization: `Bearer ${token}` };

      if (form.file) {
        body = new FormData();
        body.append("title", form.title);
        body.append("content", form.content);
        body.append("label", form.label);
        body.append("file", form.file);
      } else {
        body = JSON.stringify({
          title: form.title,
          content: form.content,
          label: form.label,
          image: form.image
        });
        headers["Content-Type"] = "application/json";
      }

      const res = await fetch(`${API_URL}/posts`, {
        method: "POST",
        headers,
        body
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Post criado com sucesso!" });
        setForm({ title: "", content: "", label: "", file: null, image: "" });
        loadPosts();
      } else {
        setMessage({ type: "error", text: "Erro ao criar post" });
      }
    } catch {
      setMessage({ type: "error", text: "Erro ao criar post" });
    }
  };

  const handleEditPost = async (e) => {
    e.preventDefault();
    try {
      let body;
      let headers = { Authorization: `Bearer ${token}` };

      if (form.file) {
        body = new FormData();
        body.append("title", form.title);
        body.append("content", form.content);
        body.append("label", form.label);
        body.append("file", form.file);
      } else {
        body = JSON.stringify({
          title: form.title,
          content: form.content,
          label: form.label,
          image: form.image
        });
        headers["Content-Type"] = "application/json";
      }

      const res = await fetch(`${API_URL}/posts/${selectedPost.id}`, {
        method: "PUT",
        headers,
        body
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Post atualizado com sucesso!" });
        setForm({ title: "", content: "", label: "", file: null, image: "" });
        setSelectedPost(null);
        setModal({ type: "", post: null });
        loadPosts();
      } else {
        setMessage({ type: "error", text: "Erro ao atualizar post" });
      }
    } catch {
      setMessage({ type: "error", text: "Erro ao atualizar post" });
    }
  };

  const handleDeletePost = async () => {
    try {
      const res = await fetch(`${API_URL}/posts/${selectedPost.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Post excluído com sucesso!" });
        setSelectedPost(null);
        setModal({ type: "", post: null });
        loadPosts();
      } else {
        setMessage({ type: "error", text: "Erro ao excluir post" });
      }
    } catch {
      setMessage({ type: "error", text: "Erro ao excluir post" });
    }
  };

  const openModal = (type, post) => {
    setModal({ type, post });
    setSelectedPost(post);
    if (post) {
      setForm({
        title: post.title,
        content: post.content,
        label: post.label,
        file: null,
        image: post.image || ""
      });
    }
  };

  return (
    <div className="admin">
      <h1>Painel Administrativo</h1>

      {message.text && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      {!isAuthenticated ? (
        <LoginForm onLogin={handleLogin} />
      ) : (
        <AdminPanel
          posts={posts}
          form={form}
          setForm={setForm}
          handleLogout={handleLogout}
          handleCreatePost={handleCreatePost}
          openModal={openModal}
        />
      )}

      {modal.type === "edit" && (
        <EditModal
          form={form}
          setForm={setForm}
          handleEditPost={handleEditPost}
          closeModal={() => setModal({ type: "", post: null })}
        />
      )}

      {modal.type === "delete" && (
        <DeleteModal
          handleDeletePost={handleDeletePost}
          closeModal={() => setModal({ type: "", post: null })}
        />
      )}
    </div>
  );
};

const LoginForm = ({ onLogin }) => (
  <form onSubmit={onLogin}>
    <input type="text" name="username" placeholder="Usuário" required />
    <input type="password" name="password" placeholder="Senha" required />
    <button type="submit">Entrar</button>
  </form>
);

const AdminPanel = ({ posts, form, setForm, handleLogout, handleCreatePost, openModal }) => (
  <div>
    <button onClick={handleLogout} className="logout">Sair</button>

    <form onSubmit={handleCreatePost}>
      <input
        type="text"
        placeholder="Título"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        required
      />
      <textarea
        placeholder="Conteúdo"
        value={form.content}
        onChange={(e) => setForm({ ...form, content: e.target.value })}
        required
      />
      <input
        type="text"
        placeholder="Label"
        value={form.label}
        onChange={(e) => setForm({ ...form, label: e.target.value })}
        required
      />

      {/* seletor de imagens pré-carregadas */}
      <label>Escolher imagem pré-carregada:</label>
      <select
        value={form.image}
        onChange={(e) => setForm({ ...form, image: e.target.value })}
      >
        <option value="">Selecione...</option>
        {imagensDisponiveis.map((img, i) => (
          <option key={i} value={img}>
            Imagem {i + 1}
          </option>
        ))}
      </select>

      {/* upload opcional */}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setForm({ ...form, file: e.target.files[0], image: "" })}
      />

      <button type="submit">Criar Post</button>
    </form>

    <PostsPreview posts={posts} onEdit={(post) => openModal("edit", post)} onDelete={(post) => openModal("delete", post)} />
  </div>
);

const PostsPreview = ({ posts, onEdit, onDelete }) => (
  <div className="posts-preview">
    {posts.map((post) => (
      <div key={post.id} className="post-preview">
        <h3>{post.title}</h3>
        <div className="content-preview">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
            {post.content}
          </ReactMarkdown>
        </div>
        {post.image && <img src={post.image} alt={post.title} width="100" />}
        <span>{post.label}</span>
        <button onClick={() => onEdit(post)}>Editar</button>
        <button onClick={() => onDelete(post)}>Excluir</button>
      </div>
    ))}
  </div>
);

const EditModal = ({ form, setForm, handleEditPost, closeModal }) => (
  <div className="modal">
    <form onSubmit={handleEditPost}>
      <input
        type="text"
        placeholder="Título"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        required
      />
      <textarea
        placeholder="Conteúdo"
        value={form.content}
        onChange={(e) => setForm({ ...form, content: e.target.value })}
        required
      />
      <input
        type="text"
        placeholder="Label"
        value={form.label}
        onChange={(e) => setForm({ ...form, label: e.target.value })}
        required
      />

      {/* seletor de imagens pré-carregadas */}
      <label>Escolher imagem pré-carregada:</label>
      <select
        value={form.image}
        onChange={(e) => setForm({ ...form, image: e.target.value, file: null })}
      >
        <option value="">Selecione...</option>
        {imagensDisponiveis.map((img, i) => (
          <option key={i} value={img}>
            Imagem {i + 1}
          </option>
        ))}
      </select>

      {/* upload opcional */}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setForm({ ...form, file: e.target.files[0], image: "" })}
      />

      <button type="submit">Salvar Alterações</button>
      <button type="button" onClick={closeModal}>Cancelar</button>
    </form>
  </div>
);

const DeleteModal = ({ handleDeletePost, closeModal }) => (
  <div className="modal">
    <h3>Tem certeza que deseja excluir este post?</h3>
    <button onClick={handleDeletePost}>Sim, excluir</button>
    <button onClick={closeModal}>Cancelar</button>
  </div>
);

export default Admin;