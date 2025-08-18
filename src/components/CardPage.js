import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // ★ URLのID部分を取得するためのフック
import { db, doc, getDoc } from '../firebase';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Mousewheel } from 'swiper/modules';
import 'swiper/css';
import { Box, CircularProgress, Typography, Button } from '@mui/material';

const CardPage = () => {
  const { cardId } = useParams(); // URLから :cardId の部分を取得する (例: /card/kjG8dJk...)
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- ★ このページが表示された時に、一度だけ実行される処理 ---
  useEffect(() => {
    const fetchCardData = async () => {
      try {
        if (!cardId) {
          throw new Error("カードIDが見つかりません。");
        }
        
        // Firestoreの "cards" というコレクションから、指定されたcardIdのドキュメントを探す
        const docRef = doc(db, "cards", cardId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          // ドキュメントが見つかったら、その中のslides配列をステートに保存
          const cardData = docSnap.data();
          setSlides(cardData.slides.sort((a, b) => a.order - b.order)); // orderで並び替え
        } else {
          throw new Error("指定された名刺は見つかりませんでした。");
        }
      } catch (err) {
        console.error("Failed to fetch card data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCardData();
  }, [cardId]); // cardIdが変わった時だけ、この処理を再実行する


  // --- UIの描画部分 ---
  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>;
  }
  if (error) {
    return <Box sx={{ p: 4, textAlign: 'center' }}><Typography color="error">{error}</Typography></Box>;
  }

  return (
    <Swiper
      direction={'vertical'}
      slidesPerView={1}
      mousewheel={true}
      modules={[Mousewheel]}
      style={{ width: '100vw', height: '100vh', backgroundColor: 'white' }}
    >
      {slides.map((slide, index) => (
    <SwiperSlide key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      
      {/* ★ 全体を囲む、カードコンテナ */}
      <Box 
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '90%', // 画面幅の90%を使う
          maxWidth: '400px', // ただし、最大幅は400pxまで
          height: '90%', // 画面の高さの90%を使う
          maxHeight: '800px',// ただし、最大高さは800pxまで
        }}
      >

        {/* 1. 画像エリア (残りのスペースをすべて使う) */}
        <Box 
          sx={{
            flexGrow: 1, // ★ このBoxが、可能な限り、高さを広げる
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden', // はみ出した部分は隠す
          }}
        >
          <img 
            src={slide.imageUrl} 
            alt={`slide-${index}`} 
            style={{ 
              maxWidth: '100%', 
              maxHeight: '100%', 
              objectFit: 'contain',
              borderRadius: '8px', // 画像の角を少し丸めると、より美しくなります
            }} 
          />
        </Box>

        {/* 2. ボタンエリア (必要な分だけ、高さを取る) */}
        {slide.linkUrl && (
          <Box sx={{ pt: 2, flexShrink: 0 }}>
            <Button
              variant="contained"
              href={slide.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {slide.buttonText || '詳しくはこちら'}
            </Button>
          </Box>
        )}
      </Box>

    </SwiperSlide>
  ))}
</Swiper>
  );
};

export default CardPage;
