import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Box, Button, Paper, Typography, Grid, CircularProgress, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close'; // 削除ボタン用のアイコン

// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
// ★ Cloudinary情報★
// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
const CLOUDINARY_CLOUD_NAME = 'ddgrrcn6r'; 
const CLOUDINARY_UPLOAD_PRESET = 'businesscardapp_unsigned_preset'; 
// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★

// ----------------------------------------------------
// --- 新機能：並び替え可能な画像アイテムのコンポーネント ---
// ----------------------------------------------------
const SortableItem = ({ image, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: image.id }); // 各アイテムにユニークなIDが必要

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    position: 'relative', // 削除ボタンを配置するため
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <img src={image.previewUrl} alt="preview" style={{ width: '100%', borderRadius: '4px', display: 'block' }} />
      <IconButton
        aria-label="delete"
        onClick={() => onRemove(image.id)}
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 1)',
          },
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </div>
  );
};


// ----------------------------------------------------
// --- UploadPageコンポーネント本体（大改造） ---
// ----------------------------------------------------
const UploadPage = () => {
  const [images, setImages] = useState([]); // ここに入るデータの形が変わります
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState('');
  const navigate = useNavigate();

  // dnd-kit用のセンサーを設定（おまじないだと思ってOK）
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // --- 新機能：画像がアップロードされた時の処理 ---
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    
    // 各ファイルに、ユニークなIDと、プレビューURLを付けてオブジェクト化する
    const newImageObjects = files.map(file => ({
      id: `${file.name}-${Date.now()}`, // ドラッグ＆ドロップで識別するためのID
      file: file,
      previewUrl: URL.createObjectURL(file)
    }));

    setImages(prev => [...prev, ...newImageObjects]);
  };

  // --- 新機能：ドラッグが終了した時の処理 ---
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setImages((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex); // 配列の順番を入れ替える
      });
    }
  };

  // --- 新機能：画像が削除された時の処理 ---
  const handleRemoveImage = (idToRemove) => {
    setImages((items) => items.filter(item => item.id !== idToRemove));
  };


  // --- 名刺作成ボタンが押された時の処理（変更なし） ---
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (images.length === 0) {
      setError('画像が選択されていません。');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const uploadPromises = images.map(image => {
        const formData = new FormData();
        formData.append('file', image.file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        return axios.post(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
          formData
        );
      });

      const uploadResponses = await Promise.all(uploadPromises);
      const imageUrls = uploadResponses.map(res => res.data.secure_url);
      const encodedUrls = encodeURIComponent(imageUrls.join(','));
      const newUrl = `${window.location.origin}/card?images=${encodedUrls}`;
      
      setGeneratedUrl(newUrl);
      setLoading(false);

    } catch (err) {
      console.error('Upload failed:', err);
      setError('画像のアップロード中にエラーが発生しました。');
      setLoading(false);
    }
  };

  // --- UIの描画部分（大改造） ---
  return (
    <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <Paper elevation={3} sx={{ maxWidth: '600px', width: '100%', p: 4 }}>
        <Typography variant="h4" gutterBottom>縦スワイプ型名刺作成</Typography>
        {error && <Typography color="error">{error}</Typography>}
        
        {/* ----- 画像アップロードボタン ----- */}
        <Button variant="contained" component="label" fullWidth sx={{ mb: 2 }}>
          画像を選択
          <input type="file" hidden multiple accept="image/*" onChange={handleImageUpload} />
        </Button>
        
        {/* ----- ここからがドラッグ＆ドロップの表示エリア ----- */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={images} // 並び替えたいアイテムの配列を渡す
            strategy={rectSortingStrategy} // 並び替えの戦略（グリッド形式）
          >
            <Grid container spacing={2} sx={{ mb: 2 }}>
              {images.map((image) => (
                <Grid item xs={4} key={image.id}>
                  <SortableItem image={image} onRemove={handleRemoveImage} />
                </Grid>
              ))}
            </Grid>
          </SortableContext>
        </DndContext>
        {/* ----- ここまで ----- */}
        
        {/* ----- 名刺作成ボタン（変更なし） ----- */}
        <Button 
          type="button" // formのsubmitではなく、ただのボタンにする
          variant="contained" 
          color="primary" 
          fullWidth 
          disabled={loading || images.length === 0}
          onClick={handleSubmit} // クリックでhandleSubmitを呼び出す
        >
          {loading ? <CircularProgress size={24} /> : '名刺を作成'}
        </Button>

        {/* ----- URL表示エリア（変更なし） ----- */}
        {generatedUrl && (
          <Box sx={{ mt: 4, p: 2, border: '1px dashed grey', borderRadius: '4px' }}>
            <Typography variant="h6" gutterBottom>完成！</Typography>
            <Typography variant="body2" gutterBottom>以下のURLを相手に共有してください。</Typography>
            <Box sx={{ p: 1, backgroundColor: '#f5f5f5', borderRadius: '4px', my: 1 }}>
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
