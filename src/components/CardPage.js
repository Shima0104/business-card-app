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
    return <Box>表示する画像がありません。</Box>;
  }

  return (
    <Swiper
      direction={'vertical'}
      slidesPerView={1}
      mousewheel={true}
      modules={[Mousewheel]}
      style={{ width: '100vw', height: '100vh', backgroundColor: 'black' }}
    >
      {images.map((base64String, index) => (
        <SwiperSlide key={index} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <img src={base64String} alt={`slide-${index}`} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default CardPage;```

#### ステップ4：ルーティングの設定 (`App.js`)

`src/App.js` を開き、新しい `CardPage` へのルートを追加します。

```javascript
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UploadPage from './components/UploadPage';
import CardPage from './components/CardPage'; // これを追加

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UploadPage />} />
        <Route path="/card" element={<CardPage />} /> // これを追加
      </Routes>
    </Router>
  );
}

export default App;
