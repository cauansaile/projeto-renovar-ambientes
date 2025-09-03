import React from 'react';
import { useParams } from 'react-router-dom';
import { FiCalendar, FiUser, FiTag, FiArrowLeft } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { usePosts } from '../hooks/usePosts';
import './blog.css';

const BlogPost = () => {
    const { slug } = useParams();
    const { getPostBySlug } = usePosts();
    
    const post = getPostBySlug(slug);

    if (!post) {
        return (
            <div className="blog-container">
                <div className="not-found">
                    <h2>Post não encontrado</h2>
                    <p>O post que você está procurando não existe ou foi removido.</p>
                    <Link to="/blog" className="back-button">
                        <FiArrowLeft size={16} />
                        Voltar para o Blog
                    </Link>
                </div>
            </div>
        );
    }

    // Formatar data para exibição
    const formatDate = (dateString) => {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            timeZone: 'America/Sao_Paulo'
        };
        return new Date(dateString).toLocaleDateString('pt-BR', options);
    };

    // Função para capitalizar a primeira letra
    const capitalizeFirst = (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    return (
        <div className="blog-container">
            {/* Botão Voltar */}
            <div className="back-navigation">
                <Link to="/blog" className="back-link">
                    <FiArrowLeft size={18} />
                    Voltar para todos os posts
                </Link>
            </div>

            <article className="blog-post">
                {/* Imagem de Capa */}
                {post.coverImage && (
                    <div className="post-cover">
                        <img 
                            src={post.coverImage} 
                            alt={post.title}
                            loading="lazy"
                        />
                    </div>
                )}
                
                {/* Cabeçalho do Post */}
                <header className="post-header">
                    <div className="post-meta">
                        <span className="meta-item">
                            <FiCalendar size={14} />
                            {formatDate(post.createdAt)}
                        </span>
                        
                        {post.category && (
                            <span className="meta-item category-badge">
                                <FiTag size={14} />
                                {capitalizeFirst(post.category)}
                            </span>
                        )}

                        {post.author && (
                            <span className="meta-item">
                                <FiUser size={14} />
                                Por {post.author.name || 'Administrador'}
                            </span>
                        )}
                    </div>

                    <h1 className="post-title">{post.title}</h1>
                    
                    {post.excerpt && (
                        <p className="post-excerpt">{post.excerpt}</p>
                    )}
                </header>

                {/* Conteúdo do Post */}
                <div className="post-content-wrapper">
                    <div 
                        className="post-content"
                        dangerouslySetInnerHTML={{ 
                            __html: post.content
                                .replace(/\n/g, '<br/>')
                                .replace(/<br\/><br\/>/g, '</p><p>')
                        }}
                    />
                </div>

                {/* Rodapé do Post */}
                {(post.tags && post.tags.length > 0) && (
                    <footer className="post-footer">
                        <div className="tags-section">
                            <h3 className="tags-title">
                                <FiTag size={16} />
                                Tags:
                            </h3>
                            <div className="tags-list">
                                {post.tags.map((tag, index) => (
                                    <span key={index} className="tag">
                                        #{tag.trim()}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </footer>
                )}

                {/* Navegação entre Posts */}
                <div className="post-navigation">
                    <Link to="/blog" className="nav-button">
                        <FiArrowLeft size={16} />
                        Ver todos os posts
                    </Link>
                    
                    {post.category && (
                        <Link 
                            to={`/blog?category=${post.category}`} 
                            className="nav-button"
                        >
                            Ver mais em {post.category}
                            <FiArrowLeft size={16} className="rotate-180" />
                        </Link>
                    )}
                </div>
            </article>

            {/* Newsletter ou Call-to-Action (opcional) */}
            <div className="blog-cta">
                <h3>Gostou do conteúdo?</h3>
                <p>Inscreva-se para receber mais dicas sobre ambientes renovados</p>
                <form className="newsletter-form">
                    <input 
                        type="email" 
                        placeholder="Seu e-mail" 
                        className="email-input"
                    />
                    <button type="submit" className="subscribe-btn">
                        Inscrever
                    </button>
                </form>
            </div>
        </div>
    );
};

export default BlogPost;