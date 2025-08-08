import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { db, collection, addDoc, serverTimestamp } from '../firebase';

// dnd-kitのインポートを復活させる
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import {
  Box, Button, Paper, Typography, Grid, CircularProgress, TextField, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
// ★ Cloudinary情報★
// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
const CLOUDINARY_CLOUD_NAME = 'ddgrrcn6r'; 
const CLOUDINARY_UPLOAD_PRESET = 'businesscardapp_unsigned_preset'; 
// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★

// ----------------------------------------------------
// --- SortableImageEditorコンポーネント ---
// ----------------------------------------------------
const SortableImageEditor = ({ image, onUpdate, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: image.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Paper variant="outlined" sx={{ p: 2, position: 'relative' }}>
        <img src={image.previewUrl} alt="preview" style={{ width: '100%', borderRadius: '4px', display: 'block' }} />
        <IconButton
          aria-label="delete"
          onPointerDown={(e) => { e.stopPropagation(); onRemove(image.id); }}
          sx={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(255, 255, 255, 0.7)' }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
        <div onPointerDown={(e) => e.stopPropagation()} style={{ cursor: 'text' }}>
          <TextField
            label="ボタンのテキスト"
            variant="standard" fullWidth size="small"
            value={image.buttonText}
            onChange={(e) => onUpdate(image.id, 'buttonText', e.target.value)}
            sx={{ mt: 1 }}
          />
          <TextField
            label="リンク先のURL"
            variant="standard" fullWidth size="small"
            value={image.linkUrl}
            onChange={(e) => onUpdate(image.id, 'linkUrl', e.target.value)}
            sx={{ mt: 1 }}
          />
        </div>
      </Paper>
    </div>
  );
};

// ----------------------------------------------------
// --- UploadPageコンポーネント本体（最終調整版） ---
// ----------------------------------------------------
const UploadPage = () => {
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState(''); // ★ URL表示のワンクッションに使う
  const navigate = useNavigate();

  // dnd-kit用のセンサー設定 (変更なし)
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  // 画像アップロード時の処理 (変更なし)
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const newImageObjects = files.map(file => ({
      id: `${file.name}-${Date.now()}`, file: file, previewUrl: URL.createObjectURL(file), buttonText: '', linkUrl: '',
    }));
    setImages(prev => [...prev, ...newImageObjects]);
  };

  // テキスト入力欄の更新処理 (変更なし)
  const handleUpdateImageInfo = (id, field, value) => {
    setImages(prev => prev.map(img => img.id === id ? { ...img, [field]: value } : img));
  };
  
  // 画像削除の処理 (変更なし)
  const handleRemoveImage = (idToRemove) => {
    setImages(items => items.filter(item => item.id !== idToRemove));
  };
  
  // ★ ドラッグ終了時の処理を復活させる
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setImages((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // 名刺作成ボタンが押された時の処理
  const handleSubmit = async (event) => {
    // ...（中略）...
    setLoading(true);
    setError(null);

    try {
      // ...（Cloudinaryへのアップロード、cardSlidesの作成までは全く同じ）...
      const uploadPromises = images.map(image => {
        const formData = new FormData();
        formData.append('file', image.file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        return axios.post(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, formData);
      });
      const uploadResponses = await Promise.all(uploadPromises);
      const cardSlides = images.map((image, index) => ({
        imageUrl: uploadResponses[index].data.secure_url, buttonText: image.buttonText, linkUrl: image.linkUrl, order: index,
      }));

      // Firestoreにデータを保存する
      const docRef = await addDoc(collection(db, "cards"), {
        slides: cardSlides, createdAt: serverTimestamp(),
      });
      
      // ★★★ ここで、即座に遷移する代わりに、URLを生成してステートに保存する ★★★
      const newUrl = `${window.location.origin}/card/${docRef.id}`;
      setGeneratedUrl(newUrl);

    } catch (err) {
      console.error("Submit failed:", err);
      setError('作成中にエラーが発生しました。');
    } finally {
      // ★ finallyブロックで、ローディングを確実に解除する
      setLoading(false);
    }
  };

  // --- UIの描画部分 ---
  return (
    <Box sx={{ p: 4 }}>
      <Paper elevation={3} sx={{ maxWidth: '800px', mx: 'auto', p: 4 }}>
        <Typography variant="h4" gutterBottom>名刺情報入力</Typography>
        {error && <Typography color="error">{error}</Typography>}
        <label htmlFor="image-upload-button">
         <input
          id="image-upload-button"
          type="file"
          hidden
          multiple
          accept="image/*"
          onChange={handleImageUpload}
        />
       <Button variant="contained" component="span" fullWidth sx={{ mb: 3 }}>
        画像を追加
       </Button>
      </label>
        
        {/* ★★★ DndContextとSortableContextで、グリッド全体を囲む ★★★ */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={images.map(img => img.id)} strategy={rectSortingStrategy}>
            <Grid container spacing={3}>
              {images.map((image) => (
                <Grid item xs={12} sm={6} md={4} key={image.id}>
                  {/* ★ コンポーネント名をSortableImageEditorに変更 */}
                  <SortableImageEditor 
                    image={image} 
                    onUpdate={handleUpdateImageInfo} 
                    onRemove={handleRemoveImage} 
                  />
                </Grid>
              ))}
            </Grid>
          </SortableContext>
        </DndContext>

        <Button 
          variant="contained" color="primary" fullWidth 
          disabled={loading || images.length === 0}
          onClick={handleSubmit} sx={{ mt: 3, py: 1.5 }}
        >
          {loading ? <CircularProgress size={24} /> : 'この内容で名刺を作成する'}
        </Button>

        {/* ★ URL表示エリア (これは以前のまま、完璧に動作する) */}
        {generatedUrl && (
          <Box sx={{ mt: 4, p: 2, border: '1px dashed grey' }}>
            <Typography variant="h6" gutterBottom>完成！</Typography>
            <Typography variant="body2" gutterBottom>以下のURLを相手に共有してください。</Typography>
            <Box sx={{ p: 1, backgroundColor: '#f5f5f5', my: 1 }}>
              <Typography sx={{ wordBreak: 'break-all' }}>{generatedUrl}</Typography>
            </Box>
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button variant="contained" onClick={() => navigator.clipboard.writeText(generatedUrl)}>コピー</Button>
              <Button variant="outlined" href={generatedUrl} target="_blank" rel="noopener noreferrer">開く</Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default UploadPage;
