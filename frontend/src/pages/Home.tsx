import * as React from 'react';
import { Link } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  BookOpenIcon,
  UserIcon,
  BookmarkIcon,
  ClockIcon,
  StarIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import {
  Typography,
  Button,
  Box,
  Avatar,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Rating,
  CircularProgress,
  Alert,
  AvatarGroup,
  Tooltip,
} from '@mui/material';
import { bookApi, userApi, FollowedUserBookActivity } from '../services/api';
import { Book, Review } from '../types/book';
import { reviewApi } from '../services/api';
import Logo from '../components/Logo';

const Home: React.FunctionComponent = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [books, setBooks] = React.useState<Book[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [recentReviews, setRecentReviews] = React.useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = React.useState(true);
  const [reviewsError, setReviewsError] = React.useState<string | null>(null);
  const [popularBooks, setPopularBooks] = React.useState<{ book: Book; reviewCount: number }[]>([]);
  const [popularLoading, setPopularLoading] = React.useState(true);
  const [popularError, setPopularError] = React.useState<string | null>(null);
  const [searchResults, setSearchResults] = React.useState<Book[]>([]);
  const [followedUsersBooks, setFollowedUsersBooks] = React.useState<FollowedUserBookActivity[]>([]);
  const [followedBooksLoading, setFollowedBooksLoading] = React.useState(true);
  const [followedBooksError, setFollowedBooksError] = React.useState<string | null>(null);

  const navigation = [
    { name: 'Home', href: '/', icon: BookOpenIcon },
    { name: 'Browse', href: '/browse', icon: BookmarkIcon },
    { name: 'About', href: '/about', icon: BookOpenIcon },
    // { name: 'My Books', href: '/my-books', icon: HeartIcon },
  ];

  React.useEffect(() => {
    const fetchBooks = async () => {
      try {
        console.log('Fetching books...');
        const response = await bookApi.getBooks();
        console.log('Books response:', response);
        setBooks(response);
      } catch (err) {
        console.error('Error fetching books:', err);
        setError('Failed to fetch books');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();

    // Fetch popular books this week
    const fetchPopularBooks = async () => {
      try {
        setPopularLoading(true);
        setPopularError(null);
        const data = await reviewApi.getPopularBooksThisWeek();
        console.log("Fetched Popular Books", data);
        setPopularBooks(data);
      } catch (err) {
        setPopularError('Failed to fetch popular books this week');
      } finally {
        setPopularLoading(false);
      }
    };
    fetchPopularBooks();
  }, []);

  React.useEffect(() => {
    const fetchRecentReviews = async () => {
      try {
        setReviewsLoading(true);
        setReviewsError(null);
        const reviews = await reviewApi.getRecentReviews();
        setRecentReviews(reviews);
      } catch (err) {
        setReviewsError('Failed to fetch recent reviews');
      } finally {
        setReviewsLoading(false);
      }
    };
    fetchRecentReviews();
  }, []);

  React.useEffect(() => {
    const fetchFollowedUsersBooks = async () => {
      try {
        setFollowedBooksLoading(true);
        setFollowedBooksError(null);
        const data = await userApi.getFollowedUsersBooks();
        console.log('Fetched followed users books:', data);
        setFollowedUsersBooks(data);
      } catch (err) {
        console.error('Error fetching followed users books:', err);
        setFollowedBooksError('Failed to fetch books from followed users');
      } finally {
        setFollowedBooksLoading(false);
      }
    };

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    console.log('Current user:', user);
    if (user._id) {
      fetchFollowedUsersBooks();
    } else {
      setFollowedBooksLoading(false);
    }
  }, []);

  const handleHeroSearch = () => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }
    const results = books.filter(
      (book) =>
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(results);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Alert severity="error">{error}</Alert>
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

            {/* Search Bar */}
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

      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0">
          <img
            className="w-full h-[500px] object-cover"
            src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2000"
            alt="Library"
          />
          <div className="absolute inset-0 bg-gray-900 bg-opacity-50"></div>
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Discover Your Next Great Read
          </h1>
          <p className="mt-6 text-xl text-gray-300 max-w-3xl">
            Explore new books and authors. Rated by the community.
          </p>
          <div className="mt-10 max-w-xl">
            <div className="relative">
              
              <form
                className="w-full px-4 py-3 rounded-md bg-white/10 text-white focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 focus-within:ring-white"
                onSubmit={e => { e.preventDefault(); handleHeroSearch(); }}
              >
                <Box display="flex" alignItems="center">
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search books..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <MagnifyingGlassIcon className="h-5 w-5 text-white/60" />
                        </InputAdornment>
                      ),
                      style: {
                        color: 'white',
                        backgroundColor: 'transparent',
                      },
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '0.25rem',
                        color: 'white',
                        '& fieldset': {
                          borderColor: 'white',
                        },
                        '&:hover fieldset': {
                          borderColor: '#ccc',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'white',
                        },
                      },
                      '& .MuiInputBase-input::placeholder': {
                        color: 'white',
                        opacity: 1,
                      },
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleHeroSearch();
                      }
                    }}
                  />
                  <Button
                    variant="text"
                    sx={{
                      ml: 2,
                      borderRadius: 2,
                      minWidth: 48,
                      minHeight: 48,
                      background: 'transparent',
                      color: 'white',
                      boxShadow: 'none',
                      '&:hover': {
                        background: 'rgba(255,255,255,0.1)',
                        boxShadow: 'none',
                      },
                    }}
                    onClick={handleHeroSearch}
                  >
                    Search
                  </Button>
                </Box>
              </form>

              
            </div>
          </div>
        </div>
      </div>

      {/* Books Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {searchResults.length > 0 && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Search Results</h2>
            <Grid container spacing={3} sx={{ mb: 6 }}>
              {searchResults.map((book) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={book._id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                    <CardMedia
                      component="img"
                      image={book.coverImage}
                      alt={book.title}
                      sx={{ height: 180, objectFit: 'cover' }}
                    />
                    <CardContent sx={{ flex: 1 }}>
                      <Typography variant="h6" gutterBottom>{book.title}</Typography>
                      <Typography variant="subtitle2" color="text.secondary">by {book.author}</Typography>
                      <Box display="flex" alignItems="center" gap={1} mt={1}>
                        <Typography variant="body2" color="text.secondary">
                          {book.averageRating?.toFixed(1) || 'N/A'} / 5
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </div>
        )}
        {/* Popular Books This Week */}
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Popular Books This Week</h2>
        {popularLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="120px">
            <CircularProgress />
          </Box>
        ) : popularError ? (
          <Alert severity="error">{popularError}</Alert>
        ) : popularBooks.length === 0 ? (
          <Typography variant="body1" color="text.secondary">No popular books found for this week.</Typography>
        ) : (
          <Grid container spacing={3} sx={{ mb: 6 }}>
            {popularBooks.map(({ book, reviewCount }) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={book._id}>
                <Link to={`/books/${book._id}`} className="group" style={{ textDecoration: 'none' }}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                    <CardMedia
                      component="img"
                      image={book.coverImage}
                      alt={book.title}
                      sx={{ height: 180, objectFit: 'cover' }}
                    />
                    <CardContent sx={{ flex: 1 }}>
                      <Typography variant="h6" gutterBottom>{book.title}</Typography>
                      <Typography variant="subtitle2" color="text.secondary">by {book.author}</Typography>
                      <Box display="flex" alignItems="center" gap={1} mt={1}>
                        <Typography variant="body2" color="text.secondary">
                          {reviewCount} review{reviewCount !== 1 ? 's' : ''} this week
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Link>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Books from Followed Users */}
        {(() => {
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          const isLoggedIn = user._id;
          
          // Don't show section if user is not logged in
          if (!isLoggedIn) {
            return null;
          }
          
          // Show loading state
          if (followedBooksLoading) {
            return (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="120px">
                <CircularProgress />
              </Box>
            );
          }
          
          // Show error if there's an error
          if (followedBooksError) {
            return <Alert severity="error">{followedBooksError}</Alert>;
          }
          
          // Don't show section if no followed users' books
          if (followedUsersBooks.length === 0) {
            return null;
          }
          
          // Render the section with books
          return (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-900">From People You Follow</h2>
              <Grid container spacing={3} sx={{ mb: 6 }}>
                {followedUsersBooks.map((item) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={item.book._id}>
                    <Link to={`/books/${item.book._id}`} style={{ textDecoration: 'none' }}>
                      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardMedia
                          component="img"
                          image={item.book.coverImage}
                          alt={item.book.title}
                          sx={{ height: 180, objectFit: 'cover' }}
                        />
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            {item.book.title}
                          </Typography>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            by {item.book.author}
                          </Typography>
                          
                          <Box sx={{ mt: 2 }}>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                              <StarIcon className="h-5 w-5 text-yellow-500" />
                              <Typography variant="body2" color="text.secondary">
                                {item.reviewCount} review{item.reviewCount !== 1 ? 's' : ''}
                              </Typography>
                              <ClockIcon className="h-5 w-5 ml-2" />
                              <Typography variant="body2" color="text.secondary">
                                {item.readCount} read{item.readCount !== 1 ? 's' : ''}
                              </Typography>
                            </Box>

                            <Box sx={{ mt: 2 }}>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                Recent Activity:
                              </Typography>
                              <AvatarGroup max={3} sx={{ justifyContent: 'flex-start' }}>
                                {item.recentActivity.map((activity, index) => (
                                  <Tooltip
                                    key={index}
                                    title={`${activity.user.username} ${activity.type === 'review' ? 'reviewed' : 'read'} this book`}
                                  >
                                    <Avatar
                                      src={activity.user.profileImage}
                                      alt={activity.user.username}
                                      sx={{ width: 24, height: 24 }}
                                    >
                                      {activity.user.username[0]}
                                    </Avatar>
                                  </Tooltip>
                                ))}
                              </AvatarGroup>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Link>
                  </Grid>
                ))}
              </Grid>
            </div>
          );
        })()}

        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {books.map((book) => (
            <Link key={book._id} to={`/books/${book._id}`} className="group">
              <div className="aspect-w-3 aspect-h-4 rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-full h-full object-center object-cover transform transition-transform group-hover:scale-105"
                />
              </div>
              <div className="mt-4 flex flex-col">
                <h3 className="text-lg font-medium text-gray-900 group-hover:text-indigo-600">
                  {book.title}
                </h3>
                <p className="mt-1 text-sm text-gray-500">{book.author}</p>
                <p className="mt-1 text-sm text-gray-500">{book.description.substring(0, 100)}...</p>
                <div className="mt-2 flex items-center">
                  <span className="text-yellow-400">★</span>
                  <span className="ml-1 text-sm text-gray-500">{book.averageRating.toFixed(1)}</span>
                  <span className="ml-2 text-sm text-gray-500">({book.totalReviews} reviews)</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Reviews Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Recent Reviews</h2>
        {reviewsLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="120px">
            <CircularProgress />
          </Box>
        ) : reviewsError ? (
          <Alert severity="error">{reviewsError}</Alert>
        ) : recentReviews.length === 0 ? (
          <Typography variant="body1" color="text.secondary">No recent reviews found.</Typography>
        ) : (
          <Grid container spacing={3}>
            {recentReviews.map((review) => {
              const book = typeof review.book === 'object' ? review.book : null;
              return (
                <Grid item xs={12} md={6} lg={3} key={review._id}>
                  <Link to={`/books/${book?._id}`} className="group" style={{ textDecoration: 'none' }}>
                    <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                      {book && (
                        <CardMedia
                          component="img"
                          image={book.coverImage}
                          alt={book.title}
                          sx={{ height: 180, objectFit: 'cover' }}
                        />
                      )}
                      <CardContent sx={{ flex: 1 }}>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <Avatar
                            src={review.user.profileImage}
                            alt={review.user.username}
                            sx={{ width: 32, height: 32 }}
                          >
                            {review.user.username[0].toUpperCase()}
                          </Avatar>
                          <Typography variant="subtitle2" color="text.primary">
                            {review.user.username}
                          </Typography>
                        </Box>
                        {book && (
                          <Typography variant="h6" gutterBottom>
                            {book.title}
                          </Typography>
                        )}
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <Rating value={review.rating} readOnly size="small" />
                          <Typography variant="body2" color="text.secondary">
                            {review.rating}/5
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {review.comment}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Link>
                </Grid>
              );
            })}
          </Grid>
        )}
      </div>
    </Box>
  );
};

export default Home; 