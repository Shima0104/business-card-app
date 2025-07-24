import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Box, Typography, Paper } from '@mui/material';
import { useSwipeable } from 'react-swipeable';

const SwipeableCardView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [error, setError] = React.useState(null);
  const [cardData, setCardData] = React.useState([]);
  const [reverseOrder, setReverseOrder] = React.useState(false);

  useEffect(() => {
    console.log('Card ID:', id);
    
    // Get images from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const imageUrls = urlParams.get('images');
    console.log('Image URLs:', imageUrls);

    if (imageUrls) {
      try {
        // Split and validate image URLs
        const urls = imageUrls.split(',').map(url => url.trim());
        console.log('Loaded image URLs:', urls);
        
        // Create card data with image URLs
        const data = urls.map((url, index) => ({
          id: index + 1,
          image: url,
          title: index === 0 ? 'Profile' : index === 1 ? 'Skills' : 'Contact'
        }));
        setCardData(data);
      } catch (error) {
        console.error('Error loading images:', error);
        setError('画像の読み込みに失敗しました');
      }
    } else {
      // If no images in URL parameters, use default images
      const defaultData = [
        {
          id: 1,
          image: 'https://via.placeholder.com/800x1200/1a237e/ffffff?text=Profile',
          title: 'Profile',
        },
        {
          id: 2,
          image: 'https://via.placeholder.com/800x1200/1a237e/ffffff?text=Skills',
          title: 'Skills',
        },
        {
          id: 3,
          image: 'https://via.placeholder.com/800x1200/1a237e/ffffff?text=Contact',
          title: 'Contact',
        },
      ];
      setCardData(defaultData);
    }
  }, [id]);

  const handlers = useSwipeable({
    onSwipedUp: (event) => {
      console.log('Swiped Up:', event);
      // 下から上へのドラッグで次のカード
      const newIndex = currentIndex + 1;
      if (newIndex < cardData.length) {
        setCurrentIndex(newIndex);
        console.log('Switched to next card:', newIndex);
      }
    },
    onSwipedDown: (event) => {
      console.log('Swiped Down:', event);
      // 上から下へのドラッグで前のカード
      const newIndex = currentIndex - 1;
      if (newIndex >= 0) {
        setCurrentIndex(newIndex);
        console.log('Switched to previous card:', newIndex);
      }
    },
    onSwiping: (event) => {
      console.log('Swiping:', event);
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
    trackTouch: true,
    delta: 50,
    rotationAngle: 0,
    preventScrollOnSwipe: true,
    touchEventOptions: {
      passive: false,
    },
    threshold: 100,  // スワイプの閾値を調整
    preventScroll: true,
    trackMouse: true,
    trackTouch: true,
    touchEventOptions: {
      passive: false,
    },
    onSwiping: (event) => {
      console.log('Swiping:', event);
    },
    onSwiped: (event) => {
      console.log('Swiped:', event);
    },
  });

  if (error) {
    return (
      <Box
        sx={{
          width: '100vw',
          height: '100vh',
          backgroundColor: '#1a237e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
        }}
      >
        <Typography variant="h4">{error}</Typography>
      </Box>
    );
  }

  return (
    <Paper
      {...handlers}
      elevation={3}
      sx={{
        touchAction: 'pan-y',
        '-webkit-user-select': 'none',
        '-moz-user-select': 'none',
        '-ms-user-select': 'none',
        'user-select': 'none',
        width: '100vw',
        height: '100vh',
        backgroundColor: '#1a237e',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        position: 'relative',
        cursor: 'grab',
        '&:active': {
          cursor: 'grabbing',
        },
        '@media (min-width: 768px)': {
          width: '80vw',
          height: '80vh',
          maxWidth: '1200px',
          maxHeight: '800px',
          margin: '10vh auto',
        },
      }}
      onMouseDown={(e) => console.log('Mouse Down:', e)}
      onMouseMove={(e) => console.log('Mouse Move:', e)}
      onMouseUp={(e) => console.log('Mouse Up:', e)}
    >
      {cardData.map((card, index) => (
        <motion.div
          key={card.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: index === currentIndex ? 1 : 0, 
            y: index === currentIndex ? 0 : 20,
            scale: index === currentIndex ? 1 : 0.95,
            transition: {
              duration: 0.5,
              ease: "easeInOut"
            }
          }}
          transition={{ 
            duration: 0.5,
            ease: "easeInOut"
          }}
          className="card"
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            zIndex: index === currentIndex ? 1 : 0,
            opacity: index === currentIndex ? 1 : 0,
            transform: `translateY(${currentIndex === index ? 0 : 100}%)`,
            transition: 'opacity 0.5s ease, transform 0.5s ease',
            background: '#fff',
            willChange: 'opacity, transform',
            touchAction: 'none',
            '-webkit-user-select': 'none',
            '-moz-user-select': 'none',
            '-ms-user-select': 'none',
            'user-select': 'none',
            '@media (min-width: 768px)': {
              width: '90%',
              height: '90%',
              maxWidth: '1000px',
              maxHeight: '700px',
              margin: '5% auto',
            },
          }}
        >
          {card.image.startsWith('http') ? (
            <img
              src={card.image}
              alt={card.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                '@media (min-width: 768px)': {
                  width: 'auto',
                  height: 'auto',
                  maxWidth: '900px',
                  maxHeight: '600px',
                },
                zIndex: 0,
              }}
            />
          ) : (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 2,
                color: '#fff',
              }}
            >
              <Typography variant="h4">{card.title}</Typography>
              <Typography variant="body1">画像が読み込めませんでした</Typography>
            </Box>
          )}
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              zIndex: 2,
              position: 'absolute',
              color: '#fff',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            }}
          >
            {card.title}
          </Typography>
        </motion.div>
      ))}
    </Paper>
  );
};

export default SwipeableCardView;
