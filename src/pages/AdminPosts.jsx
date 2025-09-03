import React from 'react';
import { Link } from 'react-router-dom';
import { FiEdit, FiTrash2, FiEye, FiPlus, FiImage } from 'react-icons/fi';
import { usePosts } from '../hooks/usePosts';
import './AdminPosts.css';

const AdminPosts = () => {
    const { posts, loading, deletePost } = usePosts();

    const handleDelete = (id) => {
        if (!confirm('Tem certeza que deseja deletar este post?')) return;
        deletePost(id);
    };

    if (loading) return <div className="loading">Carregando...</div>;

    return (
        <div className="admin-posts">
            <div className="page-header">
                <h1>Gerenciar Posts</h1>
                <Link to="/admin/posts/new" className="btn-primary">
                    <FiPlus size={20} />
                    Novo Post
                </Link>
            </div>

            <div className="posts-table">
                <table>
                    <thead>
                        <tr>
                            <th>Imagem</th>
                            <th>Título</th>
                            <th>Categoria</th>
                            <th>Status</th>
                            <th>Data</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {posts.map((post) => (
                            <tr key={post.id}>
                                <td>
                                    {post.coverImage ? (
                                        <img
                                            src={post.coverImage}
                                            alt={post.title}
                                            className="post-thumbnail"
                                        />
                                    ) : (
                                        <div className="no-image">
                                            <FiImage size={20} />
                                        </div>
                                    )}
                                </td>
                                <td>
                                    <div className="post-title">
                                        {post.title}
                                        {post.featured && (
                                            <span className="featured-badge">Destaque</span>
                                        )}
                                    </div>
                                </td>
                                <td>{post.category}</td>
                                <td>
                                    <span className={`status-badge ${post.status}`}>
                                        {post.status === 'published' ? 'Publicado' : 'Rascunho'}
                                    </span>
                                </td>
                                <td>
                                    {new Date(post.createdAt).toLocaleDateString('pt-BR')}
                                </td>
                                <td>
                                    <div className="actions">
                                        <Link
                                            to={`/blog/${post.slug}`}
                                            target="_blank"
                                            className="action-btn view"
                                            title="Visualizar"
                                        >
                                            <FiEye size={16} />
                                        </Link>
                                        <Link
                                            to={`/admin/posts/edit/${post.id}`}
                                            className="action-btn edit"
                                            title="Editar"
                                        >
                                            <FiEdit size={16} />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(post.id)}
                                            className="action-btn delete"
                                            title="Deletar"
                                        >
                                            <FiTrash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {posts.length === 0 && (
                    <div className="empty-state">
                        <p>Nenhum post encontrado</p>
                        <Link to="/admin/posts/new" className="btn-primary">
                            Criar primeiro post
                        </Link>
                    </div>
                )}
            </div>

            <div className="storage-info">
                <p>💡 Dados armazenados localmente no seu navegador</p>
            </div>
        </div>
    );
};

export default AdminPosts;