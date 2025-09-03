class ImageStorage {
    constructor() {
        this.storageKey = 'blog_cover_images';
        this.images = this.loadImages();
    }

    loadImages() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            console.error('Erro ao carregar imagens:', error);
            return {};
        }
    }

    saveImages() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.images));
        } catch (error) {
            console.error('Erro ao salvar imagens:', error);
        }
    }

    async saveImage(postId, imageFile) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                this.images[postId] = {
                    data: e.target.result,
                    timestamp: Date.now(),
                    filename: imageFile.name,
                    type: imageFile.type
                };
                this.saveImages();
                resolve(e.target.result);
            };

            reader.onerror = () => {
                reject(new Error('Erro ao ler a imagem'));
            };

            reader.readAsDataURL(imageFile);
        });
    }

    getImage(postId) {
        return this.images[postId]?.data || null;
    }

    removeImage(postId) {
        if (this.images[postId]) {
            delete this.images[postId];
            this.saveImages();
            return true;
        }
        return false;
    }

    hasImage(postId) {
        return !!this.images[postId];
    }

    // Limpar imagens antigas (opcional)
    cleanupOldImages(daysToKeep = 30) {
        const cutoff = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
        let removedCount = 0;

        Object.keys(this.images).forEach(postId => {
            if (this.images[postId].timestamp < cutoff) {
                delete this.images[postId];
                removedCount++;
            }
        });

        if (removedCount > 0) {
            this.saveImages();
            console.log(`Removidas ${removedCount} imagens antigas`);
        }
    }
}

// Instância singleton
export const imageStorage = new ImageStorage();