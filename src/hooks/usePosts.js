import { useState, useEffect } from 'react';
import { imageStorage } from '../services/imageStorage';

export const usePosts = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Carregar posts do localStorage
    const loadPosts = () => {
        try {
            const storedPosts = localStorage.getItem('blog_posts');
            if (storedPosts) {
                const parsedPosts = JSON.parse(storedPosts);
                
                // Adicionar imagens aos posts
                const postsWithImages = parsedPosts.map(post => ({
                    ...post,
                    coverImage: imageStorage.getImage(post.id)
                }));
                
                setPosts(postsWithImages);
            }
        } catch (error) {
            console.error('Erro ao carregar posts:', error);
        } finally {
            setLoading(false);
        }
    };

    // Salvar posts no localStorage
    const savePosts = (updatedPosts) => {
        try {
            localStorage.setItem('blog_posts', JSON.stringify(updatedPosts));
            setPosts(updatedPosts);
        } catch (error) {
            console.error('Erro ao salvar posts:', error);
        }
    };

    // Criar novo post
    const createPost = async (postData, coverImage) => {
        const newPost = {
            id: Date.now().toString(),
            ...postData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const currentPosts = JSON.parse(localStorage.getItem('blog_posts') || '[]');
        const updatedPosts = [...currentPosts, newPost];
        
        // Salvar imagem se fornecida
        if (coverImage) {
            await imageStorage.saveImage(newPost.id, coverImage);
            newPost.coverImage = imageStorage.getImage(newPost.id);
        }

        savePosts(updatedPosts);
        return newPost;
    };

    // Atualizar post
    const updatePost = async (id, postData, coverImage, removeCover = false) => {
        const currentPosts = [...posts];
        const postIndex = currentPosts.findIndex(post => post.id === id);
        
        if (postIndex === -1) return null;

        const updatedPost = {
            ...currentPosts[postIndex],
            ...postData,
            updatedAt: new Date().toISOString()
        };

        // Gerenciar imagem
        if (removeCover) {
            imageStorage.removeImage(id);
            updatedPost.coverImage = null;
        } else if (coverImage) {
            await imageStorage.saveImage(id, coverImage);
            updatedPost.coverImage = imageStorage.getImage(id);
        }

        currentPosts[postIndex] = updatedPost;
        savePosts(currentPosts);
        return updatedPost;
    };

    // Deletar post
    const deletePost = (id) => {
        const currentPosts = [...posts];
        const updatedPosts = currentPosts.filter(post => post.id !== id);
        
        // Remover imagem associada
        imageStorage.removeImage(id);
        
        savePosts(updatedPosts);
    };

    // Buscar post por ID
    const getPostById = (id) => {
        const post = posts.find(post => post.id === id);
        return post ? { ...post } : null;
    };

    // Buscar post por slug
    const getPostBySlug = (slug) => {
        const post = posts.find(post => post.slug === slug);
        return post ? { ...post } : null;
    };

    useEffect(() => {
        loadPosts();
    }, []);

    return {
        posts,
        loading,
        createPost,
        updatePost,
        deletePost,
        getPostById,
        getPostBySlug,
        refreshPosts: loadPosts
    };
};