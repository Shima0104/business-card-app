import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Mousewheel } from 'swiper/modules';
import 'swiper/css';
import { Box } from '@mui/material';

const CardPage = () => {
  const [searchParams] = useSearchParams();
  const imagesParam = searchParams.get('images');
  
  let images = [];
  if (imagesParam) {
    // カンマで区切られた文字列を、デコードしてから配列に戻す
    images = decodeURIComponent(imagesParam).split(',');
  }
  
  if (images.length === 0) {
    return <Box sx={{ p: 4 }}>表示する画像がありません。URLが正しいか確認してください。</Box>;
  }

  return (
    <Swiper
      direction={'vertical'}
      slidesPerView={1}
      mousewheel={true}
      modules={[Mousewheel]}
      style={{ width: '100vw', height: '100vh', backgroundColor: 'black' }}
    >
      {images.map((url, index) => (
        <SwiperSlide key={index} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <img src={url} alt={`slide-${index}`} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default CardPage;
