import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography } from '@mui/material';

interface LogoProps {
  color?: string | 'text.primary';
}

const Logo: React.FC<LogoProps> = ({ color = 'text.primary' }) => {
  return (
    <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
      <Box sx={{ height: 40, width: 40, mr: 1 }}>
        <img 
          src="/logo.png" 
          alt="Booksy Logo" 
          style={{ height: '100%', width: '100%', objectFit: 'contain' }}
        />
      </Box>
      <Typography 
        variant="h6" 
        sx={{ 
          fontWeight: 'bold',
          color: color,
          fontSize: '1.5rem',
          lineHeight: 1
        }}
      >
        Booksy
      </Typography>
    </Link>
  );
};

export default Logo; 