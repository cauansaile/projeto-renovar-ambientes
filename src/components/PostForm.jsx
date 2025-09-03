import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePosts } from '../hooks/usePosts';
import ImageUpload from './ImageUpload';
import './PostForm.css';

const PostForm = ({ isEdit = false }) => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { createPost, updatePost, getPostById } = usePosts();
    
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: '',
        tags: '',
        excerpt: '',
        status: 'draft',
        featured: false
    });
    
    const [coverImage, setCoverImage] = useState(null);
    const [removeCover, setRemoveCover] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isEdit && id) {
            fetchPost();
        }
    }, [isEdit, id]);

    const fetchPost = () => {
        const post = getPostById(id);
        if (post) {
            setFormData({
                title: post.title,
                content: post.content,
                category: post.category,
                tags: Array.isArray(post.tags) ? post.tags.join(', ') : post.tags || '',
                excerpt: post.excerpt || '',
                status: post.status || 'draft',
                featured: post.featured || false
            });

            if (post.coverImage) {
                setCoverImage(post.coverImage);
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageChange = (file) => {
        setCoverImage(file);
        setRemoveCover(false);
    };

    const generateSlug = (title) => {
        return title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const postData = {
                ...formData,
                slug: generateSlug(formData.title),
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
            };

            if (isEdit) {
                await updatePost(id, postData, coverImage, removeCover);
            } else {
                await createPost(postData, coverImage);
            }

            navigate('/admin/posts');
        } catch (error) {
            setError('Erro ao salvar post: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="post-form-container">
            <h2>{isEdit ? 'Editar Post' : 'Criar Novo Post'}</h2>
            
            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="post-form">
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="title">Título *</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="category">Categoria *</label>
                        <input
                            type="text"
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="excerpt">Resumo</label>
                    <textarea
                        id="excerpt"
                        name="excerpt"
                        value={formData.excerpt}
                        onChange={handleInputChange}
                        rows="3"
                        placeholder="Breve descrição do post..."
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="content">Conteúdo *</label>
                    <textarea
                        id="content"
                        name="content"
                        value={formData.content}
                        onChange={handleInputChange}
                        rows="10"
                        required
                        placeholder="Escreva o conteúdo do post aqui..."
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="tags">Tags</label>
                    <input
                        type="text"
                        id="tags"
                        name="tags"
                        value={formData.tags}
                        onChange={handleInputChange}
                        placeholder="tag1, tag2, tag3"
                    />
                    <small>Separe as tags por vírgula</small>
                </div>

                <ImageUpload
                    onImageChange={handleImageChange}
                    currentImage={typeof coverImage === 'string' ? coverImage : null}
                    postId={id}
                />

                {coverImage && typeof coverImage === 'string' && (
                    <div className="form-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={removeCover}
                                onChange={(e) => setRemoveCover(e.target.checked)}
                            />
                            Remover imagem de capa atual
                        </label>
                    </div>
                )}

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="status">Status</label>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                        >
                            <option value="draft">Rascunho</option>
                            <option value="published">Publicado</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="featured"
                                checked={formData.featured}
                                onChange={handleInputChange}
                            />
                            Post em destaque
                        </label>
                    </div>
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/posts')}
                        className="btn-secondary"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary"
                    >
                        {loading ? 'Salvando...' : (isEdit ? 'Atualizar' : 'Criar')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PostForm;