import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import { db, collection, addDoc, serverTimestamp, doc, getDoc, setDoc, deleteDoc } from '../firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Box, Button, Paper, Typography, Grid, CircularProgress, TextField, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../hooks/useAuth';

const CLOUDINARY_CLOUD_NAME = 'ddgrrcn6r'; 
const CLOUDINARY_UPLOAD_PRESET = 'businesscardapp_unsigned_preset'; 

// --- SortableImageEditor Component (Complete and Correct) ---
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
          <TextField label="ボタンのテキスト" variant="standard" fullWidth size="small" value={image.buttonText} onChange={(e) => onUpdate(image.id, 'buttonText', e.target.value)} sx={{ mt: 1 }} />
          <TextField label="リンク先のURL" variant="standard" fullWidth size="small" value={image.linkUrl} onChange={(e) => onUpdate(image.id, 'linkUrl', e.target.value)} sx={{ mt: 1 }} />
        </div>
      </Paper>
    </div>
  );
};

// --- CardEditor Component (Complete and Correct) ---
const CardEditor = () => {
  const { cardId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); 

  const [images, setImages] = useState([]);
  const [themeColor, setThemeColor] = useState('#2196f3');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const fetchAndVerify = async () => {
      if (!cardId) {
        setIsOwner(true);
        setLoading(false);
        return;
      }
      setLoading(true);
      const docRef = doc(db, "cards", cardId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (user && user.uid === data.ownerId) {
          setIsOwner(true);
          setThemeColor(data.themeColor || '#2196f3');
          setImages(data.slides.sort((a,b) => a.order - b.order).map(slide => ({
            id: `firebase-${slide.imageUrl}`, file: null, previewUrl: slide.imageUrl,
            buttonText: slide.buttonText, linkUrl: slide.linkUrl,
          })));
        } else {
          setIsOwner(false);
        }
      } else {
        setError("お探しの名刺は見つかりませんでした。");
      }
      setLoading(false);
    };
    if (user) { 
        fetchAndVerify();
    } else if (cardId) { 
        setIsOwner(false);
        setLoading(false);
    } else { 
        setIsOwner(true);
        setLoading(false);
    }
  }, [cardId, user]);

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const newImageObjects = files.map(file => ({
      id: `${file.name}-${Date.now()}`, file: file, previewUrl: URL.createObjectURL(file), buttonText: '', linkUrl: '',
    }));
    setImages(prev => [...prev, ...newImageObjects]);
  };

  const handleUpdateImageInfo = (id, field, value) => {
    setImages(prev => prev.map(img => img.id === id ? { ...img, [field]: value } : img));
  };

  const handleRemoveImage = (idToRemove) => {
    setImages(items => items.filter(item => item.id !== idToRemove));
  };
  
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

  const handleSave = async () => {
    if (!user) { setError("この操作を行うには、ログインが必要です。"); return; }
    if (images.length === 0) { setError('画像が1枚以上必要です。'); return; }
    setLoading(true); setError(null);
    try {
      const imageUrls = [];
      for (const image of images) {
        if (image.file) {
          const formData = new FormData();
          formData.append('file', image.file);
          formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
          const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: formData });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error.message);
          imageUrls.push(data.secure_url);
        } else {
          imageUrls.push(image.previewUrl);
        }
      }
      const cardSlides = images.map((image, index) => ({
        imageUrl: imageUrls[index], buttonText: image.buttonText, linkUrl: image.linkUrl, order: index,
      }));
      const cardData = { slides: cardSlides, themeColor: themeColor, updatedAt: serverTimestamp(), ownerId: user.uid };
      if (cardId) {
        const docRef = doc(db, "cards", cardId);
        await setDoc(docRef, cardData, { merge: true });
        alert("名刺を更新しました！");
      } else {
        const docRef = await addDoc(collection(db, "cards"), { ...cardData, createdAt: serverTimestamp() });
        navigate(`/edit/${docRef.id}`);
      }
    } catch (err) {
      setError(`保存中にエラーが発生しました: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !cardId) return;
    if (window.confirm("この名刺を本当に削除しますか？\nこの操作は元に戻せません。")) {
      setLoading(true); setError(null);
      try {
        await deleteDoc(doc(db, "cards", cardId));
        navigate('/');
      } catch (err) {
        setError("削除中にエラーが発生しました。");
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
  }
  if (!isOwner && cardId) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" color="error">アクセス権がありません</Typography>
        <Typography>このページを編集する権限がありません。</Typography>
        <Button component={RouterLink} to="/login" variant="contained" sx={{ mt: 2 }}>ログインページへ</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Paper elevation={3} sx={{ maxWidth: '800px', mx: 'auto', p: 4 }}>
        <Typography variant="h4" gutterBottom>{cardId ? '名刺を編集' : '新しい名刺を作成'}</Typography>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="subtitle1">テーマカラー:</Typography>
          <input type="color" value={themeColor} onChange={(e) => setThemeColor(e.target.value)} style={{ width: '100px', height: '40px', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}/>
        </Box>
        {error && <Typography color="error">{error}</Typography>}
        <label htmlFor="image-upload-button">
          <input id="image-upload-button" type="file" hidden multiple accept="image/*" onChange={handleImageUpload}/>
          <Button variant="contained" component="span" fullWidth sx={{ mb: 3 }}>画像を追加</Button>
        </label>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={images.map(img => img.id)} strategy={rectSortingStrategy}>
            <Grid container spacing={3}>
              {images.map((image) => (
                <Grid item xs={12} sm={6} md={4} key={image.id}>
                  <SortableImageEditor image={image} onUpdate={handleUpdateImageInfo} onRemove={handleRemoveImage} />
                </Grid>
              ))}
            </Grid>
          </SortableContext>
        </DndContext>
        <Button variant="contained" color="primary" fullWidth disabled={loading || images.length === 0} onClick={handleSave} sx={{ mt: 3, py: 1.5 }}>
          {loading ? <CircularProgress size={24} /> : (cardId ? '内容を更新' : '名刺を作成')}
        </Button>
        {cardId && (
          <Button variant="outlined" color="error" fullWidth disabled={loading} onClick={handleDelete} sx={{ mt: 2 }}>
            この名刺を削除する
          </Button>
        )}
      </Paper>
    </Box>
  );
};

export default CardEditor;
