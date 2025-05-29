import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Avatar,
  Grid,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardMedia,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Button,
} from '@mui/material';
import { 
    BookOpenIcon,
    BookmarkIcon,
    MagnifyingGlassIcon,
    BellIcon,
    UserIcon,   
    GlobeAltIcon,
    InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { AccountCircle } from '@mui/icons-material';
import { userApi, API_URL } from '../services/api';
import { User } from '../types/user';
import { Book, Review } from '../types/book';
import { format, isValid } from 'date-fns';
import Logo from '../components/Logo';

interface ReviewWithBook extends Review {
  bookDetails: {
    title: string;
    author: string;
    coverImage: string;
  };
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return isValid(date) ? format(date, 'MMMM yyyy') : 'Unknown date';
};

const formatReviewDate = (dateString: string): string => {
  const date = new Date(dateString);
  return isValid(date) ? format(date, 'MMMM d, yyyy') : 'Unknown date';
};

const getFullImageUrl = (imageUrl: string | undefined | null): string | undefined => {
  if (!imageUrl) return undefined;
  if (imageUrl.startsWith('http')) return imageUrl;
  // Get the base URL without /api
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? window.location.origin
    : 'https://booksy-fkc6.onrender.com/';
  if (imageUrl.startsWith('/uploads')) return `${baseUrl}${imageUrl}`;
  return `${baseUrl}/uploads/${imageUrl}`;
};

const UserProfile = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [reviews, setReviews] = useState<ReviewWithBook[]>([]);
  const [recentlyReadBooks, setRecentlyReadBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [stats, setStats] = useState({
    followers: 0,
    following: 0,
    reviews: 0,
    readBooks: 0
  });
  const navigate = useNavigate();
  const [bio, setBio] = useState<string>('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const navigation = [
    { name: 'Home', href: '/', icon: BookOpenIcon },
    { name: 'Browse', href: '/browse', icon: BookmarkIcon },
    { name: 'About', href: '/about', icon: BookOpenIcon },
    // { name: 'My Books', href: '/my-books', icon: HeartIcon },
  ];
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) {
        setError('User ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch all user data in parallel
        const [
          userData,
          bioData,
          imageUrl,
          followerCount,
          followingCount,
          readBooksCount,
          reviewsData,
          recentlyReadData
        ] = await Promise.all([
          userApi.getProfile(userId),
          userApi.getBio(userId),
          userApi.getProfileImage(userId),
          userApi.getFollowerCount(userId),
          userApi.getFollowingCount(userId),
          userApi.getReadBooksCount(userId),
          userApi.getUserReviews(userId),
          userApi.getRecentlyRead(userId)
        ]);

        if (!userData) {
          setError('User not found');
          return;
        }

        // Set initial follow status from the user data
        setIsFollowing(userData.isFollowing || false);

        // Transform reviews data to include book details
        const transformedReviews = await Promise.all(
          reviewsData.map(async (review: Review) => {
            try {
              if (!review.book) return null;
              const bookId = typeof review.book === 'string' ? review.book : review.book._id;
              const bookDetails = await userApi.getBookDetails(bookId);
              return {
                ...review,
                bookDetails: {
                  title: bookDetails.title,
                  author: bookDetails.author,
                  coverImage: bookDetails.coverImage
                }
              } as ReviewWithBook;
            } catch (err) {
              console.error('Error fetching book details:', err);
              return null;
            }
          })
        );

        // Filter out null reviews
        const validReviews = transformedReviews.filter((review): review is ReviewWithBook => review !== null);

        setUser(userData);
        setBio(bioData || '');
        setProfileImage(imageUrl);
        setStats({
          followers: followerCount,
          following: followingCount,
          reviews: validReviews.length,
          readBooks: readBooksCount
        });
        setReviews(validReviews);
        setRecentlyReadBooks(recentlyReadData);

      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSearchInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (!value.trim()) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    try {
      setIsSearching(true);
      setSearchError(null);
      const results = await userApi.searchUsers(value);
      console.log(results);
      setSearchResults(results);
      setShowSearchDropdown(true);
    } catch (error) {
      setSearchError('Failed to search users');
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchResultClick = (userId: string) => {
    console.log('Clicked user:', userId);
    setShowSearchDropdown(false);
    setSearchQuery('');
    navigate(`/user/${userId}`);
  };

  const handleFollowToggle = async () => {
    if (!userId) return;
    
    try {
      setFollowLoading(true);
      const response = await userApi.toggleFollow(userId);
      setIsFollowing(response.isFollowing);
      setStats(prev => ({
        ...prev,
        followers: response.followerCount,
        following: response.followingCount
      }));
    } catch (error) {
      console.error('Error toggling follow:', error);
      // Show error message if needed
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        minHeight: '100vh' 
      }}>
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (error || !user) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        minHeight: '100vh' 
      }}>
        <Box sx={{ flex: 1 }}>
          <Container maxWidth="lg">
            <Alert severity="error" sx={{ mt: 4 }}>
              {error || 'User not found'}
            </Alert>
          </Container>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      minHeight: '100vh',
      bgcolor: 'white'
    }}>
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

            {/* Search Bar */}
            <div className="flex-1 flex items-center justify-center px-2 lg:ml-6 lg:justify-end">
              <Box sx={{ position: 'relative', width: '100%', maxWidth: 'lg' }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search users by name..."
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  InputProps={{
                    startAdornment: (
                      <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 mr-2" />
                    ),
                    endAdornment: isSearching && (
                      <CircularProgress size={20} />
                    ),
                  }}
                />
                {showSearchDropdown && searchResults.length > 0 && (
                  <Paper
                    sx={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      mt: 1,
                      maxHeight: 400,
                      overflow: 'auto',
                      zIndex: 1000,
                      boxShadow: 3,
                    }}
                  >
                    <List>
                      {searchResults.map((user) => (
                        <ListItem
                          key={user._id}
                          button
                          onClick={() => handleSearchResultClick(user._id)}
                          sx={{
                            '&:hover': {
                              bgcolor: 'rgba(0, 0, 0, 0.04)',
                            },
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar src={getFullImageUrl(user.profileImage)}>
                              {!user.profileImage && <AccountCircle />}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={user.name}
                            secondary={`@${user.username}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                )}
              </Box>
            </div>

            <Button className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center" component={Link} to="/profile">
                <UserIcon className="h-5 w-5 text-gray-500" />
            </Button>

            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <span className="sr-only">Open main menu</span>
                {/* Mobile menu icon logic removed to fix linter errors */}
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
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="px-4 space-y-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
              </div>
              <button className="flex items-center w-full px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50">
                <BellIcon className="h-5 w-5 mr-3" />
                Notifications
              </button>
              <button className="flex items-center w-full px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50">
                <UserIcon className="h-5 w-5 mr-3" />
                Profile
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <Box sx={{ flex: 1 }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          {/* Search Results */}
          {searchError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {searchError}
            </Alert>
          )}
          {/* Profile Card */}
          <Paper 
            elevation={0} 
            sx={{ 
              borderRadius: '10px',
              overflow: 'hidden',
              mb: 4,
              boxShadow: '0 2px 12px rgba(0,0,0,0.1)'
            }}
          >
            {/* Banner */}
            <Box 
              sx={{ 
                height: '200px', 
                background: 'linear-gradient(45deg, #1e3c72 30%, #2a5298 90%)',
                position: 'relative'
              }}
            />

            {/* Profile Info Section */}
            <Box sx={{ px: 3, pb: 3, position: 'relative' }}>
              {/* Avatar */}
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  border: '4px solid white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  position: 'relative',
                  top: '-60px',
                  mb: -4
                }}
                src={getFullImageUrl(profileImage)}
                alt={user.name || 'Profile Image'}
              >
                {!profileImage && <AccountCircle sx={{ fontSize: 60 }} />}
              </Avatar>

              {/* User Info */}
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box>
                    <Typography variant="h4" gutterBottom>
                      {user.name}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                      @{user.username}
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    color={isFollowing ? "error" : "primary"}
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                    sx={{ minWidth: 100 }}
                  >
                    {followLoading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      isFollowing ? 'Unfollow' : 'Follow'
                    )}
                  </Button>
                </Box>
                
                <Typography variant="body1" sx={{ mt: 2, mb: 3 }}>
                  {bio || 'No bio available'}
                </Typography>

                {/* Stats */}
                <Grid container spacing={4}>
                  <Grid item xs={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6">{stats.reviews}</Typography>
                      <Typography variant="body2" color="text.secondary">Reviews</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6">{stats.readBooks}</Typography>
                      <Typography variant="body2" color="text.secondary">Books Read</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={3}>
                    <Box 
                      sx={{ 
                        textAlign: 'center', 
                        cursor: 'pointer',
                        '&:hover': {
                          '& .MuiTypography-root': {
                            color: 'primary.main'
                          }
                        }
                      }}
                      onClick={() => navigate(`/user/${userId}/followers`)}
                    >
                      <Typography variant="h6">{stats.following}</Typography>
                      <Typography variant="body2" color="text.secondary">Following</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={3}>
                    <Box 
                      sx={{ 
                        textAlign: 'center',
                        cursor: 'pointer',
                        '&:hover': {
                          '& .MuiTypography-root': {
                            color: 'primary.main'
                          }
                        }
                      }}
                      onClick={() => navigate(`/user/${userId}/followers`)}
                    >
                      <Typography variant="h6">{stats.followers}</Typography>
                      <Typography variant="body2" color="text.secondary">Followers</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Paper>

          {/* Tabs Section */}
          <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                mb: 2
              }}
            >
              <Tab label="Reviews" />
              <Tab label="Books Read" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              {/* Reviews content */}
              <Grid container spacing={3}>
                {reviews.length === 0 ? (
                  <Grid item xs={12}>
                    <Typography variant="body1" color="text.secondary" align="center">
                      No reviews yet
                    </Typography>
                  </Grid>
                ) : (
                  reviews.map((review) => (
                    <Grid item xs={12} key={review._id}>
                      <Card>
                        <CardContent>
                          <Box sx={{ display: 'flex', gap: 2 }}>
                            <img
                              src={review.bookDetails.coverImage}
                              alt={review.bookDetails.title}
                              style={{
                                width: 100,
                                height: 150,
                                objectFit: 'cover',
                                borderRadius: '4px'
                              }}
                            />
                            <Box>
                              <Typography variant="h6" gutterBottom>
                                {review.bookDetails.title}
                              </Typography>
                              <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                                by {review.bookDetails.author}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Typography variant="body2" color="primary">
                                  Rating: {review.rating}/5
                                </Typography>
                              </Box>
                              <Typography variant="body1">{review.comment}</Typography>
                              <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                                Reviewed on {formatReviewDate(review.createdAt)}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))
                )}
              </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              {/* Books Read content */}
              <Grid container spacing={3}>
                {recentlyReadBooks.length === 0 ? (
                  <Grid item xs={12}>
                    <Typography variant="body1" color="text.secondary" align="center">
                      No books read yet
                    </Typography>
                  </Grid>
                ) : (
                  recentlyReadBooks.map((book) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={book._id}>
                      <Card sx={{ height: '100%' }}>
                        <CardMedia
                          component="img"
                          height="200"
                          image={book.coverImage}
                          alt={book.title}
                          sx={{ objectFit: 'cover' }}
                        />
                        <CardContent>
                          <Typography variant="h6" noWrap gutterBottom>
                            {book.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            by {book.author}
                          </Typography>
                          {book.averageRating && (
                            <Typography variant="body2" color="text.secondary">
                              Rating: {book.averageRating.toFixed(1)}/5
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))
                )}
              </Grid>
            </TabPanel>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default UserProfile; 