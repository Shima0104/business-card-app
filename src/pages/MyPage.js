import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { db, collection, query, where, getDocs } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { Box, Paper, Typography, CircularProgress, List, ListItem, ListItemText, Button, ListItemAvatar, Avatar } from '@mui/material';

const MyPage = () => {
  const { user } = useAuth();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    
    if (!user) return;

    const fetchCards = async () => {
      try {
        // 1. なにを探すかを指定する
        const cardsRef = collection(db, "cards");

        // 2. cardsの中から、"ownerId"がuserIDと一致するデータを探す
        const q = query(cardsRef, where("ownerId", "==", user.uid));

        // 3. データ一式を受け取る
        const querySnapshot = await getDocs(q);

        // 4. 一つずつデータとIDを取り出す
        const userCards = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setCards(userCards);

      } catch (err) {
        setError("名刺の読み込みに失敗しました。");
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, [user]);


  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }
  if (error) {
    return <Box sx={{ p: 4, textAlign: 'center' }}><Typography color="error">{error}</Typography></Box>;
  }

  return (
    <Box sx={{ p: 4 }}>
      <Paper sx={{ maxWidth: '900px', mx: 'auto', p: 4 }}>
        <Typography variant="h4" gutterBottom>
          マイページ
        </Typography>
        
        {cards.length === 0 ? (
          <Typography variant="body1">
            まだ作成した名刺はありません。新しい名刺を作成しましょう！
          </Typography>
        ) : (
         <List sx={{ width: '100%' }}>
            {cards.map(card => (
              <ListItem 
                key={card.id} 
                divider // ★ 各アイテムの間に境界線を引く
                secondaryAction={
                  <Button 
                    component={RouterLink} 
                    to={`/edit/${card.id}`} 
                    variant="outlined"
                  >
                    編集
                  </Button>
                }
                sx={{ py: 2 }} // ★ 上下の余白を広げる
              >
                {/* ★★★ サムネイル表示 ★★★ */}
                <ListItemAvatar>
                  <Avatar 
                    variant="rounded" // 四角い、アバターにする
                    src={card.slides && card.slides[0] ? card.slides[0].imageUrl : undefined} // ★ 最初のスライドの画像を指定
                    sx={{ width: 56, height: 56, mr: 2 }} // サイズと右の余白
                  >
                    {/* もし画像がなければ、代わりに文字を表示する*/}
                  </Avatar>
                </ListItemAvatar>
                {/* ★★★ ここまで ★★★ */}
                
                <ListItemText 
                  primary={card.cardName || '無題の名刺'} 
                  secondary={`最終更新日: ${card.updatedAt?.toDate().toLocaleDateString() || '不明'}`} 
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default MyPage;
