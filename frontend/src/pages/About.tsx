import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { 
  BookOpenIcon,
  UserIcon,
  BookmarkIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import { GitHub, LinkedIn, Language, Instagram } from '@mui/icons-material';
import Logo from '../components/Logo';

const About: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const navigation = [
    { name: 'Home', href: '/', icon: BookOpenIcon },
    { name: 'Browse', href: '/browse', icon: BookmarkIcon },
    { name: 'About', href: '/about', icon: BookOpenIcon },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and Desktop Navigation */}
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Logo />
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900 hover:border-gray-300"
                  >
                    <item.icon className="h-5 w-5 mr-1.5" />
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Profile Icon */}
            <div className="flex-1 flex items-center justify-center px-2 lg:ml-6 lg:justify-end">
              <Button className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center" component={Link} to="/profile">
                <UserIcon className="h-5 w-5 text-gray-500" />
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <span className="sr-only">Open main menu</span>
                <Bars3Icon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`${isMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
          <div className="pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            ))}
            <Link
              to="/profile"
              className="flex items-center px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              <UserIcon className="h-5 w-5 mr-3" />
              Profile
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: { xs: 4, sm: 8 }, mb: { xs: 4, sm: 8 }, px: { xs: 2, sm: 3, md: 4 } }}>
        <Box textAlign="center" mb={{ xs: 4, sm: 6 }}>
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontSize: { xs: '2rem', sm: '3rem', md: '3.75rem' },
              fontWeight: 'bold'
            }}
          >
            About Booksy
          </Typography>
        
        </Box>

        <Grid container spacing={{ xs: 2, md: 4 }}>
          <Grid item xs={12}>
            <Paper 
              elevation={6} 
              sx={{ 
                p: { xs: 4, sm: 6 }, 
                bgcolor: 'linear-gradient(145deg, #f8fafc 0%, #e2e8f0 100%)',
                borderRadius: 4,
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '4px',
                  background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #667eea 100%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 3s ease-in-out infinite',
                },
                '@keyframes shimmer': {
                  '0%': { backgroundPosition: '-200% 0' },
                  '100%': { backgroundPosition: '200% 0' },
                }
              }}
            >
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography 
                  variant="h3" 
                  gutterBottom
                  sx={{ 
                    fontSize: { xs: '2rem', sm: '2.5rem' },
                    fontWeight: 300,
                    color: '#1a202c',
                    letterSpacing: '-0.025em',
                    mb: 1
                  }}
                >
                  Meet the Founder
                </Typography>
                <Box 
                  sx={{ 
                    width: 60, 
                    height: 3, 
                    bgcolor: 'primary.main', 
                    mx: 'auto',
                    borderRadius: 2,
                    background: 'linear-gradient(90deg, #667eea, #764ba2)'
                  }} 
                />
              </Box>
              
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', md: 'row' },
                gap: { xs: 4, md: 6 },
                alignItems: 'center'
              }}>
                <Box sx={{ 
                  position: 'relative',
                  display: 'flex',
                  justifyContent: 'center',
                  minWidth: { md: 280 }
                }}>
                  <Box
                    sx={{
                      position: 'relative',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: -8,
                        left: -8,
                        right: -8,
                        bottom: -8,
                        background: 'linear-gradient(45deg, #667eea, #764ba2, #667eea)',
                        borderRadius: '50%',
                        zIndex: 0,
                        backgroundSize: '200% 200%',
                        animation: 'gradientRotate 4s ease infinite',
                      },
                      '@keyframes gradientRotate': {
                        '0%': { backgroundPosition: '0% 50%' },
                        '50%': { backgroundPosition: '100% 50%' },
                        '100%': { backgroundPosition: '0% 50%' },
                      }
                    }}
                  >
                    <Box
                      component="img"
                      src="/founder.jpg"
                      alt="Tathagata Dey"
                      sx={{
                        width: { xs: 200, sm: 240 },
                        height: { xs: 200, sm: 240 },
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '6px solid white',
                        position: 'relative',
                        zIndex: 1,
                        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.05)',
                        }
                      }}
                    />
                  </Box>
                </Box>
                
                <Box sx={{ 
                  flex: 1,
                  textAlign: { xs: 'center', md: 'left' }
                }}>
                  <Typography 
                    variant="h4" 
                    gutterBottom
                    sx={{ 
                      fontSize: { xs: '1.75rem', sm: '2rem' },
                      fontWeight: 600,
                      color: '#1a202c',
                      mb: 1
                    }}
                  >
                    Tathagata Dey
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: 'primary.main',
                      fontWeight: 500,
                      mb: 3,
                      fontSize: { xs: '1.1rem', sm: '1.25rem' }
                    }}
                  >
                    AI Developer & Founder
                  </Typography>
                  
                  <Typography 
                    paragraph 
                    sx={{ 
                      fontSize: { xs: '1rem', sm: '1.1rem' },
                      lineHeight: 1.7,
                      color: '#4a5568',
                      mb: 3
                    }}
                  >
                    Booksy was founded by Tathagata Dey, an AI Developer and researcher with a passion for 
                    literature and technology. Combining his love for reading, writing, and building innovative 
                    tech products, Tathagata envisioned a modern, user-friendly platform that would bridge 
                    the gap between readers, authors, and publishers.
                  </Typography>

                  
                  <Box>
                    <Typography 
                      variant="h6" 
                      gutterBottom
                      sx={{ 
                        fontSize: { xs: '1.1rem', sm: '1.25rem' },
                        fontWeight: 600,
                        color: '#1a202c',
                        mb: 2
                      }}
                    >
                      Connect & Follow
                    </Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 2,
                      justifyContent: { xs: 'center', md: 'flex-start' },
                      flexWrap: 'wrap'
                    }}>
                      {[
                        { icon: Language, href: "https://iamtatha.github.io", label: "Portfolio", color: "#667eea" },
                        { icon: GitHub, href: "https://github.com/iamtatha", label: "GitHub", color: "#333" },
                        { icon: LinkedIn, href: "https://www.linkedin.com/in/tathagata-dey-580245172/", label: "LinkedIn", color: "#0077b5" },
                        { icon: Instagram, href: "https://instagram.com/epistemophilic_nerd", label: "Instagram", color: "#e4405f" }
                      ].map((social, index) => (
                        <IconButton
                          key={index}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            width: 48,
                            height: 48,
                            bgcolor: 'white',
                            color: social.color,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            border: '1px solid #e2e8f0',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              bgcolor: social.color,
                              color: 'white',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                            }
                          }}
                        >
                          <social.icon sx={{ fontSize: 24 }} />
                        </IconButton>
                      ))}
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper 
              elevation={8} 
              sx={{ 
                p: { xs: 4, sm: 6 }, 
                background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 25%, #3b82f6 50%, #1e40af 75%, #1e3a8a 100%)',
                color: 'white',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 3,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.95) 0%, rgba(30, 64, 175, 0.95) 25%, rgba(59, 130, 246, 0.95) 50%, rgba(30, 64, 175, 0.95) 75%, rgba(30, 58, 138, 0.95) 100%)',
                  backgroundSize: '400% 400%',
                  animation: 'elegantGradient 8s ease infinite',
                  zIndex: 1,
                },
                '@keyframes elegantGradient': {
                  '0%': { backgroundPosition: '0% 50%' },
                  '50%': { backgroundPosition: '100% 50%' },
                  '100%': { backgroundPosition: '0% 50%' },
                },
                '& > *': {
                  position: 'relative',
                  zIndex: 2,
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(255, 255, 255, 0.08) 0%, transparent 50%)',
                  zIndex: 1,
                }
              }}
            >
              <Typography 
                variant="h4" 
                gutterBottom
                sx={{ 
                  fontSize: { xs: '1.75rem', sm: '2.125rem' },
                  fontWeight: 600,
                  mb: 2,
                  letterSpacing: '-0.025em',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                ✨ Support Booksy
              </Typography>
              <Typography 
                variant="h6" 
                paragraph
                sx={{ 
                  fontSize: { xs: '1.1rem', sm: '1.25rem' },
                  mb: 4,
                  opacity: 0.95,
                  fontWeight: 400,
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}
              >
                Help Us Keep the Books Flowing!
              </Typography>
 
              <Typography paragraph sx={{ fontSize: { xs: '1rem', sm: '1.1rem' }, mb: 4, opacity: 0.9, lineHeight: 1.6 }}>
                Your donation, no matter how small, helps us:
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'center',
                gap: 3,
                mb: 4,
                '& > div': {
                  flex: 1,
                  maxWidth: { sm: '220px' },
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.15)',
                    transform: 'translateY(-2px)',
                  }
                }
              }}>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>🖥️ Server Hosting</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.9rem' }}>Keep the platform running 24/7</Typography>
                </Box>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>🗄️ Database Storage</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.9rem' }}>Store your books and reviews safely</Typography>
                </Box>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>🔒 Security & Updates</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.9rem' }}>Maintain a secure experience</Typography>
                </Box>
              </Box>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 3,
                justifyContent: 'center',
                alignItems: 'center',
                mt: 4
              }}>
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.15)',
                    color: 'white',
                    fontWeight: 600,
                    px: 5,
                    py: 2,
                    borderRadius: 3,
                    backdropFilter: 'blur(20px)',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.25)',
                      transform: 'translateY(-3px)',
                      boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                      borderColor: 'rgba(255, 255, 255, 0.4)',
                    },
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                  href="upi://pay?pa=tathagata2403-1@okhdfcbank&pn=Tathagata%20Dey&aid=uGICAgIDNpYCPaw"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  💳 Donate via UPI
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    color: 'white',
                    borderColor: 'rgba(255, 255, 255, 0.4)',
                    fontWeight: 600,
                    px: 5,
                    py: 2,
                    borderRadius: 3,
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    borderWidth: '2px',
                    '&:hover': {
                      borderColor: 'rgba(255, 255, 255, 0.8)',
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                      transform: 'translateY(-3px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                    },
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                  href="https://github.com/sponsors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ⭐ Sponsor on GitHub
                </Button>
              </Box>
              <Typography 
                variant="body2" 
                sx={{ 
                  mt: 4, 
                  opacity: 0.85,
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  fontStyle: 'italic',
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}
              >
                Every contribution helps us maintain this free platform for book lovers worldwide. Thank you! 🙏
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: { xs: 3, sm: 4 }, bgcolor: 'grey.50' }}>
              <Typography 
                variant="h4" 
                gutterBottom
                sx={{ 
                  fontSize: { xs: '1.75rem', sm: '2.125rem' }
                }}
              >
                Our Mission
              </Typography>
              <Typography paragraph>
                Booksy is dedicated to creating a vibrant community where book lovers can discover, 
                share, and discuss their favorite reads. 
                Our platform brings together readers, authors, and sellers in one place, making it 
                easier than ever to explore new books, share recommendations, and engage in meaningful 
                discussions about literature.
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: { xs: 3, sm: 4 }, bgcolor: 'grey.50' }}>
              <Typography 
                variant="h4" 
                gutterBottom
                sx={{ 
                  fontSize: { xs: '1.75rem', sm: '2.125rem' }
                }}
              >
                Features
              </Typography>
              <Typography component="div">
                <ul style={{ paddingLeft: '20px' }}>
                  <li>Discover new books based on your interests</li>
                  <li>Connect with fellow readers and authors</li>
                  <li>Create and manage your reading lists</li>
                  <li>Share reviews and ratings</li>
                  <li>Track your reading progress</li>
                  <li>Join book discussions and communities</li>
                </ul>
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper elevation={0} sx={{ p: { xs: 3, sm: 4 }, bgcolor: 'grey.50', mt: { xs: 2, sm: 4 } }}>
              <Typography 
                variant="h4" 
                gutterBottom
                sx={{ 
                  fontSize: { xs: '1.75rem', sm: '2.125rem' }
                }}
              >
                Join Our Community
              </Typography>
              <Typography paragraph>
                Whether you're an avid reader, an aspiring author, or just looking for your next 
                great read, Booksy is here to help you connect with the perfect book and the perfect 
                reading community. Join us today and become part of a growing community of book lovers 
                who share your passion for reading and literature.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

export default About; 