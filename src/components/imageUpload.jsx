import React, { useRef, useState } from 'react';
import { FiUpload, FiX, FiImage } from 'react-icons/fi';
import './ImageUpload.css';

const ImageUpload = ({ onImageChange, currentImage, label = "Imagem de Capa", postId }) => {
    const fileInputRef = useRef(null);
    const [preview, setPreview] = useState(currentImage || null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (file) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreview(e.target.result);
                onImageChange(file);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleInputChange = (e) => {
        const file = e.target.files[0];
        if (file) handleFileChange(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileChange(files[0]);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const removeImage = () => {
        setPreview(null);
        onImageChange(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="image-upload">
            <label className="image-upload-label">{label}</label>
            
            <div
                className={`image-upload-area ${isDragging ? 'dragging' : ''} ${preview ? 'has-preview' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleInputChange}
                    className="image-upload-input"
                />
                
                {preview ? (
                    <div className="image-preview">
                        <img src={preview} alt="Preview" className="preview-image" />
                        <button
                            type="button"
                            className="remove-image-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                removeImage();
                            }}
                        >
                            <FiX size={20} />
                        </button>
                    </div>
                ) : (
                    <div className="upload-placeholder">
                        <FiImage size={40} className="upload-icon" />
                        <p>Arraste uma imagem ou clique para selecionar</p>
                        <span>PNG, JPG, JPEG até 5MB</span>
                    </div>
                )}
            </div>

            {preview && (
                <div className="storage-info">
                    <small>⚠️ Imagem salva localmente no navegador</small>
                </div>
            )}
        </div>
    );
};

export default ImageUpload;