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
            <Paper elevation={0} sx={{ p: { xs: 3, sm: 4 }, bgcolor: 'grey.50' }}>
              <Typography 
                variant="h4" 
                gutterBottom
                sx={{ 
                  fontSize: { xs: '1.75rem', sm: '2.125rem' }
                }}
              >
                Founder and Developer
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 3, sm: 4 },
                alignItems: { xs: 'center', sm: 'flex-start' }
              }}>
                <Box
                  component="img"
                  src="/founder.jpg"
                  alt="Tathagata Dey"
                  sx={{
                    width: { xs: 150, sm: 200 },
                    height: { xs: 150, sm: 200 },
                    borderRadius: '50%',
                    objectFit: 'cover',
                    boxShadow: 3,
                  }}
                />
                <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                  <Typography paragraph>
                    Booksy was founded by Tathagata Dey, an AI Developer and researcher. Tathagata loves to read, write and build
                    tech products.
                    With a vision to create a modern, user-friendly platform for book lovers, He 
                    developed Booksy to bridge the gap between readers, authors, and publishers.
                  </Typography>
                  <Typography paragraph>
                    The platform combines cutting-edge technology with a deep understanding of what readers 
                    need, resulting in an intuitive and engaging experience for all users. Tathagata continues 
                    to lead the development of Booksy, constantly adding new features and improvements based 
                    on community feedback.
                  </Typography>
                  <Box sx={{ mt: { xs: 2, sm: 3 } }}>
                    <Typography 
                      variant="h6" 
                      gutterBottom
                      sx={{ 
                        fontSize: { xs: '1.1rem', sm: '1.25rem' }
                      }}
                    >
                      Connect with me:
                    </Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 1,
                      justifyContent: { xs: 'center', sm: 'flex-start' },
                      '& .MuiIconButton-root': { 
                        color: 'primary.main',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.04)'
                        }
                      }
                    }}>
                      <IconButton
                        href="https://iamtatha.github.io"
                        target="_blank"
                        rel="noopener noreferrer"
                        size={isMobile ? "medium" : "large"}
                      >
                        <Language />
                      </IconButton>
                      <IconButton
                        href="https://github.com/iamtatha"
                        target="_blank"
                        rel="noopener noreferrer"
                        size={isMobile ? "medium" : "large"}
                      >
                        <GitHub />
                      </IconButton>
                      <IconButton
                        href="https://www.linkedin.com/in/tathagata-dey-580245172/"
                        target="_blank"
                        rel="noopener noreferrer"
                        size={isMobile ? "medium" : "large"}
                      >
                        <LinkedIn />
                      </IconButton>
                      <IconButton
                        href="https://instagram.com/epistemophilic_nerd"
                        target="_blank"
                        rel="noopener noreferrer"
                        size={isMobile ? "medium" : "large"}
                      >
                        <Instagram />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: { xs: 3, sm: 4 }, 
                bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%)',
                  zIndex: 1,
                },
                '& > *': {
                  position: 'relative',
                  zIndex: 2,
                }
              }}
            >
              <Typography 
                variant="h4" 
                gutterBottom
                sx={{ 
                  fontSize: { xs: '1.75rem', sm: '2.125rem' },
                  fontWeight: 'bold',
                  mb: 2
                }}
              >
                💝 Support Booksy
              </Typography>
              <Typography 
                variant="h6" 
                paragraph
                sx={{ 
                  fontSize: { xs: '1.1rem', sm: '1.25rem' },
                  mb: 3,
                  opacity: 0.95
                }}
              >
                Help Us Keep the Books Flowing!
              </Typography>
              <Typography paragraph sx={{ fontSize: { xs: '1rem', sm: '1.1rem' }, mb: 3 }}>
                Booksy is an independent, unfunded project built with passion for the book community. 
                Running our servers, maintaining the database, and keeping the platform secure comes with ongoing costs.
              </Typography>
              <Typography paragraph sx={{ fontSize: { xs: '1rem', sm: '1.1rem' }, mb: 3 }}>
                Your donation, no matter how small, helps us:
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'center',
                gap: 2,
                mb: 3,
                '& > div': {
                  flex: 1,
                  maxWidth: { sm: '200px' }
                }
              }}>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>🖥️ Server Hosting</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Keep the platform running 24/7</Typography>
                </Box>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>🗄️ Database Storage</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Store your books and reviews safely</Typography>
                </Box>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>🔒 Security & Updates</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Maintain a secure experience</Typography>
                </Box>
              </Box>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                justifyContent: 'center',
                alignItems: 'center',
                mt: 4
              }}>
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    fontWeight: 'bold',
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.3)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                  href="https://www.paypal.com/donate" // Replace with your actual donation link
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  💳 Donate via PayPal
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    color: 'white',
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    fontWeight: 'bold',
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                  href="https://github.com/sponsors" // Replace with your GitHub sponsors link
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ⭐ Sponsor on GitHub
                </Button>
              </Box>
              <Typography 
                variant="body2" 
                sx={{ 
                  mt: 3, 
                  opacity: 0.8,
                  fontSize: { xs: '0.875rem', sm: '1rem' }
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
                share, and discuss their favorite reads. We believe that books have the power to 
                connect people, inspire ideas, and transform lives.
              </Typography>
              <Typography paragraph>
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