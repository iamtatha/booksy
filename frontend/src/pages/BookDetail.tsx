import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { reviewApi, userApi, fetchBookById } from '../services/api';
import { Book, Review } from '../types/book';
import Logo from '../components/Logo';
import {
  Container,
  Typography,
  Box,
  Paper,
  Rating,
  Divider,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Avatar,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  styled,
  Snackbar,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { 
  Bars3Icon, 
  XMarkIcon,
  BookOpenIcon,
  UserIcon,
  BookmarkIcon,
  ShoppingCartIcon,
  CalendarIcon,
  LanguageIcon,
  BookmarkSquareIcon,
  DocumentTextIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const StyledLink = styled(RouterLink)(({ theme }) => ({
  color: theme.palette.primary.main,
  opacity: 0.85,
  textDecoration: 'none',
  fontWeight: 500,
  transition: 'all 0.2s ease-in-out',
  position: 'relative',
  padding: '0 2px',
  '&:after': {
    content: '""',
    position: 'absolute',
    width: '100%',
    height: '2px',
    bottom: -2,
    left: 0,
    backgroundColor: theme.palette.primary.main,
    opacity: 0.3,
    transform: 'scaleX(0)',
    transformOrigin: 'bottom right',
    transition: 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out',
  },
  '&:hover': {
    color: theme.palette.primary.main,
    opacity: 1,
    '&:after': {
      transform: 'scaleX(1)',
      transformOrigin: 'bottom left',
      opacity: 0.15,
    },
  },
}));

const LoadingLink = styled('span')(({ theme }) => ({
  color: theme.palette.primary.main,
  opacity: 0.5,
  cursor: 'wait',
  textDecoration: 'none',
  fontWeight: 500,
}));

const BookDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [book, setBook] = useState<Book | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newReview, setNewReview] = useState({
    rating: 0,
    content: '',
  });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const reviewsToShow = showAllReviews ? reviews : reviews.slice(0, 5);
  const [inWishlist, setInWishlist] = useState(false);
  const [inRecentlyRead, setInRecentlyRead] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [loadingProfile, setLoadingProfile] = useState<string | null>(null);
  const navigation = [
    { name: 'Home', href: '/', icon: BookOpenIcon },
    { name: 'Browse', href: '/browse', icon: BookmarkIcon },
    { name: 'About', href: '/about', icon: BookOpenIcon },
    // { name: 'My Books', href: '/my-books', icon: HeartIcon },
    // { name: 'Profile', href: '/profile', icon: UserIcon },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [bookData, reviewsData] = await Promise.all([
          fetchBookById(id!),
          reviewApi.getBookReviews(id!)
        ]);
        setBook(bookData);
        setReviews(reviewsData);
      } catch (err) {
        setError('Failed to fetch book details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    const initializeUserLists = async () => {
      try {
        // Get user's wishlist and recently read books
        const [wishlistResponse, recentlyReadResponse] = await Promise.all([
          userApi.getWishlist(),
          userApi.getRecentlyRead()
        ]);
        
        // Check if current book is in wishlist
        const isInWishlist = wishlistResponse.some((book: Book) => book._id?.toString() === id);
        setInWishlist(isInWishlist);
  
        // Check if current book is in recently read
        const isInRecentlyRead = recentlyReadResponse.some((book: Book) => book._id?.toString() === id);
        setInRecentlyRead(isInRecentlyRead);
  
        console.log("WISHLIST From BookDetail.tsx", isInWishlist);
        console.log("RECENTLY READ From BookDetail.tsx", isInRecentlyRead);
      } catch (error) {
        console.error('Error initializing user lists:', error);
      }
    };

    console.log("RECENTLY READ From BookDetail.tsx", id);

    if (id) {
      console.log("Calling initializeUserLists", id);
      initializeUserLists();
    }
  }, [id]);

  const handleReviewSubmit = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      console.log(newReview.rating);
      setSubmitting(true);
      console.log(newReview.content);
      console.log(id!);
      const review = await reviewApi.createReview(id!, {
        rating: newReview.rating,
        content: newReview.content
      });
      console.log(review);
      setReviews([review, ...reviews]);
      setNewReview({ rating: 0, content: '' });
      setShowReviewForm(false);
    } catch (err: any) {
      setError(err.message || 'Failed to submit review');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!book?._id) return;
    try {
      console.log('Toggling wishlist for book:', book._id);
      await userApi.toggleWishlist(book._id);
      setInWishlist(!inWishlist); // Toggle the state directly since we know the API call succeeded
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  const handleToggleRecentlyRead = async () => {
    if (!book?._id) return;
    try {
      console.log('Toggling recently read for book:', book._id);
      await userApi.toggleRecentlyRead(book._id);
      setInRecentlyRead(!inRecentlyRead); // Toggle the state directly since we know the API call succeeded
    } catch (error) {
      console.error('Error toggling recently read:', error);
    }
  };

  const handleUserProfileClick = async (username: string | undefined) => {
    if (!username) {
      setFeedbackMessage({
        type: 'error',
        message: 'Cannot navigate to profile: Username not available'
      });
      return;
    }

    setLoadingProfile(username);
    try {
      // First try to get the user profile to verify it exists
      const userProfile = await userApi.getProfile(username);
      if (!userProfile) {
        setFeedbackMessage({
          type: 'error',
          message: `User "${username}" not found`
        });
        return;
      }
      // Navigate using the user's ID from the profile response
      navigate(`/user/${userProfile._id}`);
    } catch (error) {
      console.error('Error navigating to user profile:', error);
      setFeedbackMessage({
        type: 'error',
        message: 'Failed to navigate to user profile. Please try again later.'
      });
    } finally {
      setLoadingProfile(null);
    }
  };

  const renderUserLink = (username: string | undefined, displayName: string) => {
    if (!username) return displayName;
    
    if (loadingProfile === username) {
      return (
        <LoadingLink>
          {displayName} <CircularProgress size={12} sx={{ ml: 0.5 }} />
        </LoadingLink>
      );
    }

    return (
      <StyledLink 
        to="#"
        onClick={(e) => {
          e.preventDefault();
          handleUserProfileClick(username);
        }}
      >
        {displayName}
      </StyledLink>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !book) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error || 'Book not found'}</Alert>
      </Container>
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
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and Desktop Navigation */}
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Logo />
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => (
                  <RouterLink
                    key={item.name}
                    to={item.href}
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900 hover:border-gray-300"
                  >
                    <item.icon className="h-5 w-5 mr-1.5" />
                    {item.name}
                  </RouterLink>
                ))}
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden sm:flex sm:items-center sm:gap-4">
              <Button
                variant="contained"
                color="primary"
                startIcon={<PencilSquareIcon className="h-5 w-5" />}
                onClick={() => setShowReviewForm(true)}
                size="small"
              >
                Write Review
              </Button>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<ShoppingCartIcon className="h-5 w-5" />}
                href={book.amazonLink}
                target="_blank"
                size="small"
              >
                Buy on Amazon
              </Button>
              <Button 
                component={RouterLink} 
                to="/profile"
                className="w-8 h-8 min-w-0 rounded-full bg-gray-200 flex items-center justify-center p-0"
              >
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
                {isMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`${isMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
          <div className="pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <RouterLink
                key={item.name}
                to={item.href}
                className="flex items-center px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </RouterLink>
            ))}
            <RouterLink
              to="/profile"
              className="flex items-center px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              <UserIcon className="h-5 w-5 mr-3" />
              Profile
            </RouterLink>
          </div>
        </div>
      </nav>

      {/* Book Detail Content */}
      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, mb: 4, borderRadius: 2 }}>
          <Grid container spacing={{ xs: 2, sm: 4 }}>
            {/* Book Image */}
            <Grid item xs={12} sm={6} md={4}>
              <Box
                component="img"
                src={book.coverImage}
                alt={book.title}
                sx={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: { xs: '300px', sm: '500px' },
                  objectFit: 'cover',
                  borderRadius: 2,
                  boxShadow: 3,
                }}
              />
            </Grid>

            {/* Book Details */}
            <Grid item xs={12} sm={6} md={8}>
              <Stack spacing={{ xs: 1, sm: 2 }}>
                <Typography variant="h3" component="h1" sx={{ 
                  fontWeight: 'bold',
                  fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' }
                }}>
                  {book.title}
                </Typography>
                <Typography variant="h5" color="text.secondary" sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  fontSize: { xs: '1.1rem', sm: '1.5rem' }
                }}>
                  by {renderUserLink(book.author_username || book.author, book.author)}
                </Typography>
                
                <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                  <Rating value={book.averageRating} precision={0.5} readOnly size="small" />
                  <Typography variant="body2" color="text.secondary">
                    ({book.totalReviews} reviews)
                  </Typography>
                </Box>

                <Typography variant="body1" sx={{ mt: { xs: 1, sm: 2 } }}>
                  {book.description}
                </Typography>

                {/* Mobile Action Buttons - Only visible on mobile */}
                <Box 
                  sx={{ 
                    display: { xs: 'flex', sm: 'none' },
                    flexDirection: 'column',
                    gap: 1,
                    mt: 2
                  }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<PencilSquareIcon className="h-5 w-5" />}
                    onClick={() => setShowReviewForm(true)}
                    fullWidth
                  >
                    Write Review
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<ShoppingCartIcon className="h-5 w-5" />}
                    href={book.amazonLink}
                    target="_blank"
                    fullWidth
                  >
                    Buy on Amazon
                  </Button>
                </Box>

                <Divider sx={{ my: { xs: 1, sm: 2 } }} />

                <Grid container spacing={{ xs: 1, sm: 2 }}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <CalendarIcon className="h-5 w-5 text-gray-500" />
                      <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        Published: {format(new Date(book.publishedDate), 'MMMM yyyy')}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <LanguageIcon className="h-5 w-5 text-gray-500" />
                      <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        Language: {book.language}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <DocumentTextIcon className="h-5 w-5 text-gray-500" />
                      <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        Pages: {book.pageCount}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <BookmarkSquareIcon className="h-5 w-5 text-gray-500" />
                      <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        Edition: {book.edition}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <BookOpenIcon className="h-5 w-5 text-gray-500" />
                      <Typography variant="body2" sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 0.5,
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                      }}>
                        Publisher: {renderUserLink(book.publisher_username || book.publisher, book.publisher)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Box 
                  display="flex" 
                  gap={2} 
                  mt={2}
                  flexDirection={{ xs: 'column', sm: 'row' }}
                  width="100%"
                >
                  <Button
                    variant={inWishlist ? "contained" : "outlined"}
                    color="primary"
                    onClick={handleToggleWishlist}
                    fullWidth
                    sx={{ flex: { sm: 1 } }}
                  >
                    {inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                  </Button>
                  <Button
                    variant={inRecentlyRead ? "contained" : "outlined"}
                    color="secondary"
                    onClick={handleToggleRecentlyRead}
                    fullWidth
                    sx={{ flex: { sm: 1 } }}
                  >
                    {inRecentlyRead ? "Remove from Recently Read" : "Add to Recently Read"}
                  </Button>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {/* Reviews Section */}
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 2 }}>
          <Box 
            display="flex" 
            justifyContent="space-between" 
            alignItems="center" 
            mb={3}
            flexDirection={{ xs: 'column', sm: 'row' }}
            gap={{ xs: 2, sm: 0 }}
          >
            <Typography variant="h5" component="h2" sx={{ 
              fontWeight: 'bold',
              fontSize: { xs: '1.25rem', sm: '1.5rem' }
            }}>
              Reviews
            </Typography>
            <Button
              variant="outlined"
              onClick={() => setShowAllReviews(!showAllReviews)}
              fullWidth
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              {showAllReviews ? 'Show Less' : 'Show All Reviews'}
            </Button>
          </Box>

          {reviewsToShow.map((review) => (
            <Card key={review._id} sx={{ mb: 2, borderRadius: 2 }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box 
                  display="flex" 
                  alignItems={{ xs: 'flex-start', sm: 'center' }} 
                  gap={2} 
                  mb={1}
                  flexDirection={{ xs: 'column', sm: 'row' }}
                >
                  <Avatar>
                    {review.user?.username ? review.user.username[0].toUpperCase() : 'U'}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ 
                      fontWeight: 'bold',
                      fontSize: { xs: '0.9rem', sm: '1rem' }
                    }}>
                      {renderUserLink(review.user?._id || review.user?.username, review.user?.username || 'Anonymous User')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                      {format(new Date(review.createdAt), 'MMMM d, yyyy')}
                    </Typography>
                  </Box>
                </Box>
                <Rating value={review.rating} readOnly size="small" />
                <Typography variant="body1" sx={{ 
                  mt: 1,
                  fontSize: { xs: '0.9rem', sm: '1rem' }
                }}>
                  {review.comment}
                </Typography>
              </CardContent>
            </Card>
          ))}

          {reviews.length === 0 && (
            <Typography variant="body1" color="text.secondary" align="center" py={4}>
              No reviews yet. Be the first to review this book!
            </Typography>
          )}
        </Paper>
      </Container>

      {/* Review Dialog */}
      <Dialog 
        open={showReviewForm} 
        onClose={() => setShowReviewForm(false)} 
        maxWidth="sm" 
        fullWidth
        fullScreen={window.innerWidth < 600}
      >
        <DialogTitle sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          Write a Review
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography component="legend" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              Rating
            </Typography>
            <Rating
              value={newReview.rating}
              onChange={(_, value) => setNewReview({ ...newReview, rating: value || 0 })}
              size="large"
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Your Review"
              value={newReview.content}
              onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, sm: 3 } }}>
          <Button onClick={() => setShowReviewForm(false)}>Cancel</Button>
          <Button
            onClick={handleReviewSubmit}
            variant="contained"
            disabled={submitting || !newReview.rating || !newReview.content}
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!feedbackMessage}
        autoHideDuration={6000}
        onClose={() => setFeedbackMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setFeedbackMessage(null)} 
          severity={feedbackMessage?.type || 'info'}
          sx={{ width: '100%' }}
        >
          {feedbackMessage?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BookDetail; 