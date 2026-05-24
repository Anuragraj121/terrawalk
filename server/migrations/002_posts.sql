CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  session_id UUID REFERENCES sessions(id),
  photo_url TEXT,
  caption TEXT,
  cells_claimed INT DEFAULT 0,
  distance_m FLOAT DEFAULT 0,
  duration_s FLOAT DEFAULT 0,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(post_id, user_id)
);

CREATE INDEX idx_posts_user ON posts(user_id);
CREATE INDEX idx_posts_created ON posts(created_at DESC);
CREATE INDEX idx_likes_post ON likes(post_id);
