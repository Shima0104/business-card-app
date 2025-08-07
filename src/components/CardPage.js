import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // ★ URLのID部分を取得するためのフック
import { db } from '../firebase'; // ★ Firebase接続モジュール
import { doc, getDoc } from "firebase/firestore"; // ★ Firestoreからデータを取得するための呪文
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
        <SwiperSlide key={index} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
          <img src={slide.imageUrl} alt={`slide-${index}`} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
          
          {/* ★ 新機能：リンクボタンの表示 */}
          {slide.linkUrl && (
            <Button
              variant="contained"
              href={slide.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                position: 'absolute',
                bottom: '10%', // 表示位置は、お好みで調整してください
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 1)',
                }
              }}
            >
              {slide.buttonText || '詳しくはこちら'}
            </Button>
          )}
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default CardPage;
