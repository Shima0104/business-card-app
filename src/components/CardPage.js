import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db, doc, getDoc } from '../firebase'; // 総合受付から、すべてを受け取る
import { getContrastingTextColor } from '../utils/colors'; // 賢い計算機を、受け取る
import { Swiper, SwiperSlide } from 'swiper/react';
import { Mousewheel } from 'swiper/modules';
import 'swiper/css';
import { Box, CircularProgress, Typography, Button } from '@mui/material';

const CardPage = () => {
  const { cardId } = useParams();
  
  // ★ カード全体の情報を、まとめて管理する、一つの「大きな箱」
  const [cardData, setCardData] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCardData = async () => {
      try {
        if (!cardId) throw new Error("カードIDが見つかりません。");
        
        const docRef = doc(db, "cards", cardId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          // ★ Firestoreから取得した、すべてのデータを、大きな箱に、丸ごと、入れる
          setCardData(docSnap.data());
        } else {
          throw new Error("指定された名刺は見つかりませんでした。");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCardData();
  }, [cardId]);


  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100dvh' }}><CircularProgress /></Box>;
  }
  if (error) {
    return <Box sx={{ p: 4, textAlign: 'center' }}><Typography color="error">{error}</Typography></Box>;
  }
  // ★ cardDataが、まだ、空っぽ（null）の場合も、安全のために、考慮しておく
  if (!cardData) {
    return <Box sx={{ p: 4, textAlign: 'center' }}><Typography>データを読み込めませんでした。</Typography></Box>;
  }

  return (
    <Swiper
      direction={'vertical'}
      slidesPerView={1}
      mousewheel={true}
      modules={[Mousewheel]}
      style={{ width: '100vw', height: '100dvh', backgroundColor: 'white' }}
    >
      {/* ★ 大きな箱(cardData)の中の、slidesという引き出し(配列)を、使う */}
      {cardData.slides.sort((a, b) => a.order - b.order).map((slide, index) => (
        <SwiperSlide key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '90%', maxWidth: '400px', height: '90%', maxHeight: '800px' }}>
            
            <Box sx={{ flexGrow: 1, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <img src={slide.imageUrl} alt={`slide-${index}`} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '8px' }} />
            </Box>

            {slide.linkUrl && (
              <Box sx={{ pt: 2, flexShrink: 0 }}>
                <Button
                  variant="contained"
                  href={slide.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    // ★ 大きな箱(cardData)の中の、themeColorという引き出しを、使う
                    backgroundColor: cardData.themeColor || '#2196f3',
                    color: getContrastingTextColor(cardData.themeColor),
                    '&:hover': {
                      backgroundColor: cardData.themeColor || '#2196f3',
                      filter: 'brightness(90%)',
                    }
                  }}
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
