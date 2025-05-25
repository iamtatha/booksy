import React, { useState } from 'react';
import { Box, Container, Typography, IconButton, Link as MuiLink, Grid, useTheme, useMediaQuery, Drawer, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import { GitHub, LinkedIn, Language, Instagram, Menu as MenuIcon, Home as HomeIcon, BookmarkBorder as BrowseIcon, Info as AboutIcon, Person as ProfileIcon, Close as CloseIcon } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import Logo from './Logo';

const Footer: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navigationItems = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Browse', href: '/browse', icon: BrowseIcon },
    { name: 'About', href: '/about', icon: AboutIcon },
    { name: 'Profile', href: '/profile', icon: ProfileIcon },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const mobileDrawer = (
    <Drawer
      anchor="bottom"
      open={mobileMenuOpen}
      onClose={() => setMobileMenuOpen(false)}
      PaperProps={{
        sx: {
          backgroundColor: 'grey.900',
          color: 'white',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          maxHeight: '70vh'
        }
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ color: 'white' }}>Navigation</Typography>
          <IconButton 
            onClick={() => setMobileMenuOpen(false)}
            sx={{ color: 'grey.400' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <List>
          {navigationItems.map((item) => (
            <ListItem 
              key={item.name} 
              onClick={() => handleNavigation(item.href)}
              sx={{ 
                py: 2,
                '&:hover': { 
                  backgroundColor: 'rgba(255, 255, 255, 0.08)'
                }
              }}
            >
              <ListItemIcon sx={{ color: 'grey.400', minWidth: 40 }}>
                <item.icon />
              </ListItemIcon>
              <ListItemText 
                primary={item.name} 
                sx={{ 
                  '& .MuiListItemText-primary': { 
                    color: 'grey.400',
                    fontSize: '1.1rem'
                  }
                }}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );

  return (
    <Box
      component="footer"
      sx={{
        py: { xs: 6, md: 4 },
        px: 2,
        mt: 'auto',
        backgroundColor: 'grey.900',
        color: 'white',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Booksy Info */}
          <Grid item xs={12} md={4}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 2, 
              justifyContent: { xs: 'space-between', md: 'flex-start' }
            }}>
              <Logo color="white" />
              {isMobile && (
                <IconButton
                  onClick={() => setMobileMenuOpen(true)}
                  sx={{ 
                    color: 'grey.400',
                    '&:hover': { color: 'white' }
                  }}
                >
                  <MenuIcon />
                </IconButton>
              )}
            </Box>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'grey.400', 
                mb: 2,
                textAlign: { xs: 'center', md: 'left' }
              }}
            >
              Your Digital Book Community - Discover, Share, and Discuss Your Favorite Reads
            </Typography>
          </Grid>

          {/* Quick Links - Hide on Mobile */}
          {!isMobile && (
            <Grid item xs={12} sm={6} md={4}>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: 'white', 
                  mb: 2,
                  textAlign: { xs: 'center', md: 'left' }
                }}
              >
                Quick Links
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 1.5,
                alignItems: { xs: 'center', md: 'flex-start' }
              }}>
                {navigationItems.map((item) => (
                  <Link 
                    key={item.name}
                    to={item.href} 
                    style={{ color: 'inherit', textDecoration: 'none' }}
                  >
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'grey.400', 
                        '&:hover': { color: 'white' },
                        fontSize: { xs: '1rem', md: '0.875rem' }
                      }}
                    >
                      {item.name}
                    </Typography>
                  </Link>
                ))}
              </Box>
            </Grid>
          )}

          {/* Social Links */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'white', 
                mb: 2,
                textAlign: { xs: 'center', md: 'left' }
              }}
            >
              Connect With Us
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              gap: 2,
              justifyContent: { xs: 'center', md: 'flex-start' }
            }}>
              <IconButton
                href="https://iamtatha.github.io"
                target="_blank"
                rel="noopener noreferrer"
                size={isMobile ? "medium" : "small"}
                sx={{ 
                  color: 'grey.400', 
                  '&:hover': { color: 'white' },
                  padding: { xs: 1.5, md: 1 }
                }}
              >
                <Language sx={{ fontSize: { xs: 24, md: 20 } }} />
              </IconButton>
              <IconButton
                href="https://github.com/iamtatha"
                target="_blank"
                rel="noopener noreferrer"
                size={isMobile ? "medium" : "small"}
                sx={{ 
                  color: 'grey.400', 
                  '&:hover': { color: 'white' },
                  padding: { xs: 1.5, md: 1 }
                }}
              >
                <GitHub sx={{ fontSize: { xs: 24, md: 20 } }} />
              </IconButton>
              <IconButton
                href="https://www.linkedin.com/in/tathagata-dey-580245172/"
                target="_blank"
                rel="noopener noreferrer"
                size={isMobile ? "medium" : "small"}
                sx={{ 
                  color: 'grey.400', 
                  '&:hover': { color: 'white' },
                  padding: { xs: 1.5, md: 1 }
                }}
              >
                <LinkedIn sx={{ fontSize: { xs: 24, md: 20 } }} />
              </IconButton>
              <IconButton
                href="https://instagram.com/epistemophilic_nerd"
                target="_blank"
                rel="noopener noreferrer"
                size={isMobile ? "medium" : "small"}
                sx={{ 
                  color: 'grey.400', 
                  '&:hover': { color: 'white' },
                  padding: { xs: 1.5, md: 1 }
                }}
              >
                <Instagram sx={{ fontSize: { xs: 24, md: 20 } }} />
              </IconButton>
            </Box>
          </Grid>
        </Grid>

        {/* Bottom Copyright and Creator Info */}
        <Box
          sx={{
            mt: 4,
            pt: 3,
            borderTop: 1,
            borderColor: 'grey.800',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
            textAlign: { xs: 'center', sm: 'left' }
          }}
        >
          <Typography variant="body2" sx={{ color: 'grey.400' }}>
            © {new Date().getFullYear()} Booksy. All rights reserved.
          </Typography>
          <Typography variant="body2" sx={{ color: 'grey.400' }}>
            Created by{' '}
            <MuiLink
              href="https://iamtatha.github.io"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: 'primary.main' }}
            >
              Tathagata Dey
            </MuiLink>
          </Typography>
        </Box>
      </Container>
      {mobileDrawer}
    </Box>
  );
};

export default Footer; 