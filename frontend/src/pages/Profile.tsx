import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Typography,
  Box,
  Paper,
  Avatar,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  Tabs,
  Tab,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  ListItemIcon,
  DialogContentText,
  CardMedia,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import { 
  BookOpenIcon,
  UserIcon,
  HeartIcon,
  BookmarkIcon,
  StarIcon,
  Cog6ToothIcon,
  KeyIcon,
  ArrowLeftOnRectangleIcon,
  MagnifyingGlassIcon,
  BellIcon,
  PencilSquareIcon,
  InformationCircleIcon,
  Bars3Icon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import { AccountCircle } from '@mui/icons-material';
import { format, isValid } from 'date-fns';
import { userApi, API_URL } from '../services/api';
import { bookApi } from '../services/api';
import { Book, Review } from '../types/book';
import { User } from '../types/user';
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

const Profile = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [reviews, setReviews] = useState<ReviewWithBook[]>([]);
  const [listedBooks, setListedBooks] = useState<Book[]>([]);
  const [createdBooks, setCreatedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [booksTabValue, setBooksTabValue] = useState(0);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [openUsernameDialog, setOpenUsernameDialog] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const [stats, setStats] = useState({
    followers: 0,
    following: 0,
    reviews: 0,
    listedBooks: 0,
    createdBooks: 0,
    readBooks: 0,
    wishlistCount: 0
  });

  const [profileImage, setProfileImage] = useState<string | null>(null);

  const [wishlistBooks, setWishlistBooks] = useState<Book[]>([]);
  const [recentlyreadBooks, setReadBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const [bioDialogOpen, setBioDialogOpen] = useState(false);
  const [bio, setBio] = useState<string>('');

  const navigation = [
    { name: 'Home', href: '/', icon: BookOpenIcon },
    { name: 'Browse', href: '/browse', icon: BookmarkIcon },
    { name: 'About', href: '/about', icon: BookOpenIcon },
    // { name: 'My Books', href: '/my-books', icon: HeartIcon },
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      console.log("From Profile.tsx", user);
      const userId = user?._id || user?.id;
      if (!userId) {
        console.log('No user ID available');
        return;
      }
      
      try {
        console.log('Fetching user data for ID:', userId);
        setLoading(true);
        setError(null);

        let reviewsCount = 0;

        // Fetch bio
        try {
          const bioData = await userApi.getBio(userId);
          setBio(bioData);
        } catch (err) {
          console.error('Error fetching bio:', err);
          setError('Failed to load bio');
        }

        // Fetch each data type separately to better identify which one might be failing
        try {
          const reviewsData = await userApi.getUserReviews(userId);
          console.log('Fetched reviews:', reviewsData);
          reviewsCount = reviewsData.length;
          
          // Transform reviews data to include book details
          const transformedReviews = await Promise.all(
            reviewsData.map(async (review: Review) => {
              try {
                if (!review.book) {
                  console.warn('Review has no book ID:', review);
                  return null;
                }
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

          // Filter out any null reviews (where book details couldn't be fetched)
          const validReviews = transformedReviews.filter((review): review is ReviewWithBook => review !== null);
          console.log("Valid reviews:", validReviews);
          setReviews(validReviews);
        } catch (err) {
          console.error('Error fetching reviews:', err);
          setError('Failed to load reviews');
        }

        try {
          const wishlistData = await userApi.getWishlist();
          console.log('Fetched wishlist:', wishlistData);
          setWishlistBooks(wishlistData);
        } catch (err) {
          console.error('Error fetching wishlist:', err);
          setError('Failed to load wishlist');
        }

        try {
          const recentlyreadBooksData = await userApi.getRecentlyRead();
          console.log('Fetched read books:', recentlyreadBooksData);
          setReadBooks(recentlyreadBooksData);
        } catch (err) {
          console.error('Error fetching read books:', err);
          setError('Failed to load read books');
        }

        try {
          const listedBooksData = await userApi.getListedBooks(userId);
          console.log('Fetched listed books:', listedBooksData);
          setListedBooks(listedBooksData);
        } catch (err) {
          console.error('Error fetching listed books:', err);
          setError('Failed to load listed books');
        }

        try {
          const createdBooksData = await userApi.getCreatedBooks(userId);
          console.log('Fetched created books:', createdBooksData);
          setCreatedBooks(createdBooksData);
        } catch (err) {
          console.error('Error fetching created books:', err);
          setError('Failed to load created books');
        }

        try {
          const [followerCount, followingCount, readBooksCount, wishlist, profileImageUrl] = await Promise.all([
            userApi.getFollowerCount(userId),
            userApi.getFollowingCount(userId),
            userApi.getReadBooksCount(userId),
            userApi.getWishlist(),
            userApi.getProfileImage(userId)
          ]);

          console.log('Fetched counts:', {
            followerCount,
            followingCount,
            readBooksCount,
            wishlistCount: wishlist.length,
            profileImageUrl,
            reviewsCount
          });

          console.log('Profile image URL from API:', profileImageUrl);
          console.log('Full image URL:', getFullImageUrl(profileImageUrl));

          // Update stats after all data is fetched
          setStats({
            followers: followerCount,
            following: followingCount,
            reviews: reviewsCount,
            wishlistCount: wishlist.length,
            listedBooks: listedBooks.length,
            createdBooks: createdBooks.length,
            readBooks: readBooksCount
          });

          // Set profile image with detailed logging
          console.log('Setting profile image state to:', profileImageUrl);
          setProfileImage(profileImageUrl);
          console.log('Profile image state set. Current profileImage state should be:', profileImageUrl);
          
          // Force a re-render by logging the computed URL
          setTimeout(() => {
            console.log('After state update - profileImage:', profileImage);
            console.log('After state update - computed URL:', getFullImageUrl(profileImageUrl));
          }, 100);
        } catch (err) {
          console.error('Error fetching counts:', err);
          setError('Failed to load user statistics');
        }

      } catch (err) {
        console.error('Error in fetchUserData:', err);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user?._id, user?.id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleBooksTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setBooksTabValue(newValue);
  };

  const handleLogout = () => {
    handleClose();
    userApi.logout();
    navigate('/login');
  };

  const handleUpdateUsername = async () => {
    try {
      setUpdateError(null);
      if (!newUsername.trim()) {
        setUpdateError('Username cannot be empty');
        return;
      }
      const updatedUser = await userApi.updateProfile({ username: newUsername });
      setUpdateSuccess('Username updated successfully');
      setOpenUsernameDialog(false);
      setNewUsername('');
      
      // Update the user context with the new username
      if (user) {
        const updatedUserContext = {
          ...user,
          username: updatedUser.username
        };
        // Update the user in the auth context
        updateUser(updatedUserContext);
      }
    } catch (err) {
      console.error('Error updating username:', err);
      setUpdateError(err instanceof Error ? err.message : 'Failed to update username');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUpdateError(null);
      if (!currentPassword || !newPassword || !confirmPassword) {
        setUpdateError('All fields are required');
        return;
      }
      if (newPassword !== confirmPassword) {
        setUpdateError('New passwords do not match');
        return;
      }
      if (newPassword.length < 6) {
        setUpdateError('Password must be at least 6 characters long');
        return;
      }
      
      await userApi.changePassword({
        currentPassword,
        newPassword,
      });
      
      setUpdateSuccess('Password updated successfully');
      setOpenPasswordDialog(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setUpdateError(null);
    } catch (err: any) {
      console.error('Password update error:', err);
      setUpdateError(err?.response?.data?.message || 'Failed to update password. Please check your current password.');
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleImageUpload = async () => {
    if (!selectedImage) return;

    try {
      setIsUploading(true);
      setUpdateError(null);

      // Upload the image using the API service
      const imageUrl = await userApi.uploadImage(selectedImage);
      console.log('Upload successful:', imageUrl);

      // Update the user's profile with the new image URL
      const updatedUser = await userApi.updateProfile({ profileImage: imageUrl });
      
      // Update the user context with the new profile image
      if (user) {
        const updatedUserContext = {
          ...user,
          profileImage: imageUrl
        };
        updateUser(updatedUserContext);
        setProfileImage(imageUrl); // Update the local state with the new image URL
      }

      setUpdateSuccess('Profile image updated successfully');
      setSelectedImage(null);
      setImagePreview(null);

      // Refresh the profile image
      const userId = user?._id || user?.id;
      if (userId) {
        const newProfileImage = await userApi.getProfileImage(userId);
        setProfileImage(newProfileImage);
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      setUpdateError(err instanceof Error ? err.message : 'Failed to upload profile image');
      // If upload fails, clear the selected image and preview
      setSelectedImage(null);
      setImagePreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  
  // console.log(user);

  const renderBookGrid = (books: Book[]) => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (books.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', p: 3 }}>
          <Typography variant="body1" color="text.secondary">
            No books found
          </Typography>
        </Box>
      );
    }

    return (
      
      <Grid container spacing={2}>
        {books.map((book) => (
          <Grid item xs={12} sm={6} md={3} key={book._id}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative'
              }}
            >
              <Box 
                sx={{ 
                  position: 'absolute', 
                  top: 8, 
                  right: 8, 
                  bgcolor: 'rgba(0,0,0,0.6)',
                  color: 'white',
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}
              >
                <StarIcon style={{ fontSize: 16 }} />
                <Typography variant="caption">
                  {book.averageRating?.toFixed(1) || '0.0'}
                </Typography>
              </Box>
              <CardMedia
                component="img"
                image={book.coverImage}
                alt={book.title}
                sx={{ 
                  height: 280,
                  objectFit: 'cover'
                }}
              />
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  const handleOpenBioDialog = () => {
    setBio(user?.bio || '');
    setBioDialogOpen(true);
  };

  const handleCloseBioDialog = () => setBioDialogOpen(false);

  const handleUpdateBio = async () => {
    try {
      const updatedUser = await userApi.updateProfile({ bio: bio });
      setUpdateSuccess('Bio updated successfully');
      setBioDialogOpen(false);
      if (user) {
        updateUser({ ...user, bio: updatedUser.bio });
      }
    } catch (err) {
      setUpdateError('Failed to update bio');
    }
  };

  // Add debounced search handler
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

  if (!user) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h5">Please login to view your profile</Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/login')}
            sx={{ mt: 2 }}
          >
            Go to Login
          </Button>
        </Box>
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
      <Box sx={{ flex: 1 }}>
        <Container maxWidth="lg" sx={{ pb: 4 }}>
          {/* Search Results */}
          {searchError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {searchError}
            </Alert>
          )}

          {/* Banner and Profile Section */}
          <Paper 
            elevation={0} 
            sx={{ 
              borderRadius: { xs: '0px', sm: '10px' },
              overflow: 'hidden',
              mb: 4,
              boxShadow: '0 2px 12px rgba(0,0,0,0.1)'
            }}
          >
            {/* Banner */}
            <Box 
              sx={{ 
                height: { xs: '150px', sm: '200px' }, 
                background: 'linear-gradient(45deg, #1e3c72 30%, #2a5298 90%)',
                position: 'relative'
              }}
            />

            {/* Profile Info Section */}
            <Box sx={{ px: { xs: 2, sm: 3 }, pb: 3, position: 'relative' }}>
              {/* Avatar and Upload Button */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'center', sm: 'left' } }}>
                <Avatar
                  sx={{
                    width: { xs: 100, sm: 120 },
                    height: { xs: 100, sm: 120 },
                    border: '4px solid white',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    position: 'relative',
                    top: { xs: '-50px', sm: '-60px' },
                    mb: -4
                  }}
                  src={getFullImageUrl(profileImage)}
                  alt={user?.name || 'Profile Image'}
                >
                  {!profileImage && <AccountCircle sx={{ fontSize: { xs: 50, sm: 60 } }} />}
                </Avatar>

                {/* Image Upload Button */}
                <Box sx={{ mt: 1, position: 'relative', top: '-10px', alignItems: 'right' }}>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="profile-image-upload"
                    type="file"
                    onChange={handleImageChange}
                  />
                  <label htmlFor="profile-image-upload">
                    <Button
                      variant="outlined"
                      size="small"
                      component="span"
                      disabled={isUploading}
                    >
                      {isUploading ? 'Uploading...' : 'Change Profile Image'}
                    </Button>
                  </label>

                  {/* Image Preview and Upload Section */}
                  {selectedImage && imagePreview && (
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                      <Avatar
                        src={imagePreview}
                        sx={{
                          width: 80,
                          height: 80,
                          mx: 'auto',
                          mb: 2,
                          border: '2px solid',
                          borderColor: 'primary.main'
                        }}
                      />
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={handleImageUpload}
                          disabled={isUploading}
                        >
                          {isUploading ? 'Uploading...' : 'Upload'}
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => {
                            setSelectedImage(null);
                            setImagePreview(null);
                          }}
                          disabled={isUploading}
                        >
                          Cancel
                        </Button>
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Profile Info */}
              <Box sx={{ mt: 2 }}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' },
                  justifyContent: 'space-between', 
                  alignItems: { xs: 'center', sm: 'flex-start' },
                  gap: { xs: 2, sm: 0 }
                }}>
                  <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                    <Typography variant="h4" gutterBottom>
                      {user?.name}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                      @{user?.username}
                    </Typography>
                  </Box>
                  
                  {/* Edit Profile Button */}
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 2, 
                    alignItems: 'center',
                    flexDirection: { xs: 'column', sm: 'row' },
                    width: { xs: '100%', sm: 'auto' }
                  }}>
                    <Button
                      variant="outlined"
                      onClick={handleClick}
                      startIcon={<Cog6ToothIcon className="h-5 w-5" />}
                      fullWidth={true}
                      sx={{ width: { xs: '100%', sm: 'auto' } }}
                      aria-controls={open ? 'edit-profile-menu' : undefined}
                      aria-haspopup="true"
                      aria-expanded={open ? 'true' : undefined}
                    >
                      Edit Profile
                    </Button>
                    <Button
                      component={Link}
                      to="/add-book"
                      variant="contained"
                      color="primary"
                      fullWidth={true}
                      sx={{ width: { xs: '100%', sm: 'auto' } }}
                    >
                      Add Book
                    </Button>
                  </Box>
                </Box>

                {/* Edit Profile Menu */}
                <Menu
                  id="edit-profile-menu"
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                  onClick={handleClose}
                  PaperProps={{
                    elevation: 0,
                    sx: {
                      overflow: 'visible',
                      filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                      mt: 1.5,
                      '& .MuiMenuItem-root': {
                        px: 2,
                        py: 1,
                        gap: 2,
                        minWidth: 200,
                      },
                    },
                  }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  slotProps={{
                    paper: {
                      sx: {
                        mt: 1,
                      },
                    },
                  }}
                >
                  <MenuItem onClick={() => setOpenUsernameDialog(true)}>
                    <UserIcon className="h-5 w-5" />
                    Change Username
                  </MenuItem>
                  <MenuItem onClick={() => setOpenPasswordDialog(true)}>
                    <KeyIcon className="h-5 w-5" />
                    Change Password
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                    Logout
                  </MenuItem>
                </Menu>

                {/* Change Username Dialog */}
                <Dialog open={openUsernameDialog} onClose={() => setOpenUsernameDialog(false)}>
                  <DialogTitle>Change Username</DialogTitle>
                  <DialogContent>
                    <DialogContentText>
                      Enter your new username below.
                    </DialogContentText>
                    <TextField
                      autoFocus
                      margin="dense"
                      label="New Username"
                      type="text"
                      fullWidth
                      variant="outlined"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      error={!!updateError}
                      helperText={updateError}
                      sx={{ mt: 2 }}
                    />
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => setOpenUsernameDialog(false)}>Cancel</Button>
                    <Button onClick={handleUpdateUsername} variant="contained">Update</Button>
                  </DialogActions>
                </Dialog>

                {/* Change Password Dialog */}
                <Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)}>
                  <DialogTitle>Change Password</DialogTitle>
                  <DialogContent>
                    <DialogContentText>
                      To change your password, please enter your current password and your new password.
                    </DialogContentText>
                    <TextField
                      margin="dense"
                      label="Current Password"
                      type="password"
                      fullWidth
                      variant="outlined"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      error={!!updateError}
                      sx={{ mt: 2 }}
                    />
                    <TextField
                      margin="dense"
                      label="New Password"
                      type="password"
                      fullWidth
                      variant="outlined"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      error={!!updateError}
                    />
                    <TextField
                      margin="dense"
                      label="Confirm New Password"
                      type="password"
                      fullWidth
                      variant="outlined"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      error={!!updateError}
                      helperText={updateError}
                    />
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => setOpenPasswordDialog(false)}>Cancel</Button>
                    <Button onClick={handleUpdatePassword} variant="contained">Update</Button>
                  </DialogActions>
                </Dialog>

                {/* Success Alert */}
                {updateSuccess && (
                  <Alert 
                    severity="success" 
                    sx={{ mt: 2 }}
                    onClose={() => setUpdateSuccess(null)}
                  >
                    {updateSuccess}
                  </Alert>
                )}

                {/* Bio */}
                <Box 
                  display="flex" 
                  alignItems="center" 
                  gap={2} 
                  sx={{ 
                    mt: 2, 
                    mb: 3,
                    flexDirection: { xs: 'column', sm: 'row' },
                    textAlign: { xs: 'center', sm: 'left' },
                    width: '100%'
                  }}
                >
                  <Typography variant="body1" sx={{ flex: 1 }}>
                    {bio || 'No bio added yet.'}
                  </Typography>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={handleOpenBioDialog}
                    sx={{ width: { xs: '100%', sm: 'auto' } }}
                  >
                    {bio ? 'Edit Bio' : 'Add Bio'}
                  </Button>
                </Box>

                {/* Stats */}
                <Grid container spacing={{ xs: 1, sm: 4 }} sx={{ mt: 1 }}>
                  <Grid item xs={4} sm={2.4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6">{stats.reviews}</Typography>
                      <Typography variant="body2" color="text.secondary">Reviews</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4} sm={2.4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6">{stats.readBooks}</Typography>
                      <Typography variant="body2" color="text.secondary">Books Read</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4} sm={2.4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6">{stats.wishlistCount}</Typography>
                      <Typography variant="body2" color="text.secondary">Wishlist</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={2.4}>
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
                      onClick={() => navigate(`/user/${user?._id || user?.id}/followers`)}
                    >
                      <Typography variant="h6">{stats.following}</Typography>
                      <Typography variant="body2" color="text.secondary">Following</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={2.4}>
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
                      onClick={() => navigate(`/user/${user?._id || user?.id}/followers`)}
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
                mb: 2,
                '& .MuiTabs-flexContainer': {
                  flexWrap: { xs: 'wrap', sm: 'nowrap' }
                }
              }}
            >
              <Tab label="Books" />
              <Tab label="Reviews" />
            </Tabs>

            {/* Books Tab Panel */}
            <TabPanel value={tabValue} index={0}>
              <Box sx={{ mb: 3 }}>
                <Tabs
                  value={booksTabValue}
                  onChange={handleBooksTabChange}
                  sx={{ 
                    mb: 2,
                    '& .MuiTabs-flexContainer': {
                      flexWrap: { xs: 'wrap', sm: 'nowrap' }
                    }
                  }}
                  variant="scrollable"
                  scrollButtons="auto"
                >
                  <Tab label="Wishlist" />
                  <Tab label="Recently Read" />
                  <Tab label="Listed" />
                  <Tab label="Created" />
                </Tabs>

                <TabPanel value={booksTabValue} index={0}>
                  <Grid container spacing={{ xs: 2, sm: 4 }}>
                    {wishlistBooks.length === 0 ? (
                      <Grid item xs={12}>
                        <Box textAlign="center" py={6}>
                          <Typography variant="h6" color="text.secondary" mb={2}>
                            Your wishlist is empty.
                          </Typography>
                          <Button component={Link} to="/browse" variant="contained" color="primary" size="large">
                            Browse Books
                          </Button>
                        </Box>
                      </Grid>
                    ) : (
                      wishlistBooks.map((book) => (
                        <Grid item xs={6} sm={6} md={4} lg={3} key={book._id}>
                          <Card
                            component={Link}
                            to={`/books/${book._id}`}
                            sx={{
                              textDecoration: 'none',
                              borderRadius: 3,
                              boxShadow: 3,
                              transition: 'transform 0.2s, box-shadow 0.2s',
                              '&:hover': {
                                transform: 'translateY(-8px) scale(1.03)',
                                boxShadow: 8,
                              },
                              display: 'flex',
                              flexDirection: 'column',
                              height: '100%',
                            }}
                          >
                            <CardMedia
                              component="img"
                              image={book.coverImage}
                              alt={book.title}
                              sx={{ 
                                height: { xs: 180, sm: 240 }, 
                                objectFit: 'cover', 
                                borderTopLeftRadius: 12, 
                                borderTopRightRadius: 12 
                              }}
                            />
                            <CardContent sx={{ flexGrow: 1, p: { xs: 1, sm: 2 } }}>
                              <Typography variant="h6" fontWeight="bold" gutterBottom noWrap sx={{ fontSize: { xs: '0.9rem', sm: '1.25rem' } }}>
                                {book.title}
                              </Typography>
                              <Typography variant="subtitle2" color="text.secondary" noWrap sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                                by {book.author}
                              </Typography>
                              <Box display="flex" alignItems="center" gap={1} mt={1}>
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                  {book.averageRating ? `${book.averageRating.toFixed(1)} ★` : 'No rating'}
                                </Typography>
                              </Box>
                              <Button
                                variant="outlined"
                                color="primary"
                                size="small"
                                sx={{ 
                                  mt: 2,
                                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                  padding: { xs: '4px 8px', sm: '6px 16px' }
                                }}
                              >
                                View Details
                              </Button>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))
                    )}
                  </Grid>
                </TabPanel>

                <TabPanel value={booksTabValue} index={1}>
                  <Grid container spacing={{ xs: 2, sm: 4 }}>
                    {recentlyreadBooks.length === 0 ? (
                      <Grid item xs={12}>
                        <Box textAlign="center" py={6}>
                          <Typography variant="h6" color="text.secondary" mb={2}>
                            Your Recently Read List is empty.
                          </Typography>
                          <Button component={Link} to="/browse" variant="contained" color="primary" size="large">
                            Browse Books
                          </Button>
                        </Box>
                      </Grid>
                    ) : (
                      recentlyreadBooks.map((book) => (
                        <Grid item xs={6} sm={6} md={4} lg={3} key={book._id}>
                          <Card
                            component={Link}
                            to={`/books/${book._id}`}
                            sx={{
                              textDecoration: 'none',
                              borderRadius: 3,
                              boxShadow: 3,
                              transition: 'transform 0.2s, box-shadow 0.2s',
                              '&:hover': {
                                transform: 'translateY(-8px) scale(1.03)',
                                boxShadow: 8,
                              },
                              display: 'flex',
                              flexDirection: 'column',
                              height: '100%',
                            }}
                          >
                            <CardMedia
                              component="img"
                              image={book.coverImage}
                              alt={book.title}
                              sx={{ 
                                height: { xs: 180, sm: 240 }, 
                                objectFit: 'cover', 
                                borderTopLeftRadius: 12, 
                                borderTopRightRadius: 12 
                              }}
                            />
                            <CardContent sx={{ flexGrow: 1, p: { xs: 1, sm: 2 } }}>
                              <Typography variant="h6" fontWeight="bold" gutterBottom noWrap sx={{ fontSize: { xs: '0.9rem', sm: '1.25rem' } }}>
                                {book.title}
                              </Typography>
                              <Typography variant="subtitle2" color="text.secondary" noWrap sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                                by {book.author}
                              </Typography>
                              <Box display="flex" alignItems="center" gap={1} mt={1}>
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                  {book.averageRating ? `${book.averageRating.toFixed(1)} ★` : 'No rating'}
                                </Typography>
                              </Box>
                              <Button
                                variant="outlined"
                                color="primary"
                                size="small"
                                sx={{ 
                                  mt: 2,
                                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                  padding: { xs: '4px 8px', sm: '6px 16px' }
                                }}
                              >
                                View Details
                              </Button>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))
                    )}
                  </Grid>
                </TabPanel>

                <TabPanel value={booksTabValue} index={2}>
                  <Grid container spacing={{ xs: 2, sm: 4 }}>
                    {listedBooks.length === 0 ? (
                      <Grid item xs={12}>
                        <Box textAlign="center" py={6}>
                          <Typography variant="h6" color="text.secondary" mb={2}>
                            Your Listed Book List is empty.
                          </Typography>
                          <Button component={Link} to="/browse" variant="contained" color="primary" size="large">
                            Browse Books
                          </Button>
                        </Box>
                      </Grid>
                    ) : (
                      listedBooks.map((book) => (
                        <Grid item xs={6} sm={6} md={4} lg={3} key={book._id}>
                          <Card
                            component={Link}
                            to={`/books/${book._id}`}
                            sx={{
                              textDecoration: 'none',
                              borderRadius: 3,
                              boxShadow: 3,
                              transition: 'transform 0.2s, box-shadow 0.2s',
                              '&:hover': {
                                transform: 'translateY(-8px) scale(1.03)',
                                boxShadow: 8,
                              },
                              display: 'flex',
                              flexDirection: 'column',
                              height: '100%',
                            }}
                          >
                            <CardMedia
                              component="img"
                              image={book.coverImage}
                              alt={book.title}
                              sx={{ 
                                height: { xs: 180, sm: 240 }, 
                                objectFit: 'cover', 
                                borderTopLeftRadius: 12, 
                                borderTopRightRadius: 12 
                              }}
                            />
                            <CardContent sx={{ flexGrow: 1, p: { xs: 1, sm: 2 } }}>
                              <Typography variant="h6" fontWeight="bold" gutterBottom noWrap sx={{ fontSize: { xs: '0.9rem', sm: '1.25rem' } }}>
                                {book.title}
                              </Typography>
                              <Typography variant="subtitle2" color="text.secondary" noWrap sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                                by {book.author}
                              </Typography>
                              <Box display="flex" alignItems="center" gap={1} mt={1}>
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                  {book.averageRating ? `${book.averageRating.toFixed(1)} ★` : 'No rating'}
                                </Typography>
                              </Box>
                              <Button
                                variant="outlined"
                                color="primary"
                                size="small"
                                sx={{ 
                                  mt: 2,
                                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                  padding: { xs: '4px 8px', sm: '6px 16px' }
                                }}
                              >
                                View Details
                              </Button>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))
                    )}
                  </Grid>
                </TabPanel>

                <TabPanel value={booksTabValue} index={3}>
                  <Grid container spacing={{ xs: 2, sm: 4 }}>
                    {createdBooks.length === 0 ? (
                      <Grid item xs={12}>
                        <Box textAlign="center" py={6}>
                          <Typography variant="h6" color="text.secondary" mb={2}>
                            Your Created Book List is empty.
                          </Typography>
                          <Button component={Link} to="/browse" variant="contained" color="primary" size="large">
                            Browse Books
                          </Button>
                        </Box>
                      </Grid>
                    ) : (
                      createdBooks.map((book) => (
                        <Grid item xs={6} sm={6} md={4} lg={3} key={book._id}>
                          <Card
                            component={Link}
                            to={`/books/${book._id}`}
                            sx={{
                              textDecoration: 'none',
                              borderRadius: 3,
                              boxShadow: 3,
                              transition: 'transform 0.2s, box-shadow 0.2s',
                              '&:hover': {
                                transform: 'translateY(-8px) scale(1.03)',
                                boxShadow: 8,
                              },
                              display: 'flex',
                              flexDirection: 'column',
                              height: '100%',
                            }}
                          >
                            <CardMedia
                              component="img"
                              image={book.coverImage}
                              alt={book.title}
                              sx={{ 
                                height: { xs: 180, sm: 240 }, 
                                objectFit: 'cover', 
                                borderTopLeftRadius: 12, 
                                borderTopRightRadius: 12 
                              }}
                            />
                            <CardContent sx={{ flexGrow: 1, p: { xs: 1, sm: 2 } }}>
                              <Typography variant="h6" fontWeight="bold" gutterBottom noWrap sx={{ fontSize: { xs: '0.9rem', sm: '1.25rem' } }}>
                                {book.title}
                              </Typography>
                              <Typography variant="subtitle2" color="text.secondary" noWrap sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                                by {book.author}
                              </Typography>
                              <Box display="flex" alignItems="center" gap={1} mt={1}>
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                  {book.averageRating ? `${book.averageRating.toFixed(1)} ★` : 'No rating'}
                                </Typography>
                              </Box>
                              <Button
                                variant="outlined"
                                color="primary"
                                size="small"
                                sx={{ 
                                  mt: 2,
                                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                  padding: { xs: '4px 8px', sm: '6px 16px' }
                                }}
                              >
                                View Details
                              </Button>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))
                    )}
                  </Grid>
                </TabPanel>
              </Box>
            </TabPanel>

            {/* Reviews Tab Panel */}
            <TabPanel value={tabValue} index={1}>
              <Grid container spacing={2}>
                {reviews.map((review) => (
                  <Grid item xs={12} key={review._id}>
                    <Card>
                      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                        <Box sx={{ 
                          display: 'flex', 
                          gap: 2,
                          flexDirection: { xs: 'column', sm: 'row' },
                          alignItems: { xs: 'center', sm: 'flex-start' }
                        }}>
                          <img
                            src={review.bookDetails.coverImage}
                            alt={review.bookDetails.title}
                            style={{
                              width: '100px',
                              height: '150px',
                              objectFit: 'cover',
                              borderRadius: '4px'
                            }}
                          />
                          <Box sx={{ 
                            flex: 1,
                            textAlign: { xs: 'center', sm: 'left' }
                          }}>
                            <Typography variant="h6" gutterBottom>
                              {review.bookDetails.title}
                            </Typography>
                            <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                              by {review.bookDetails.author}
                            </Typography>
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 1, 
                              mb: 1,
                              justifyContent: { xs: 'center', sm: 'flex-start' }
                            }}>
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
                ))}
              </Grid>
            </TabPanel>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Profile; 