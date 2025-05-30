import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  Divider,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Collapse,
  Paper,
  Chip,
  Badge,
} from '@mui/material';
import { 
  MagnifyingGlassIcon, 
  ChevronDownIcon, 
  ChevronUpIcon, 
  BookOpenIcon,
  UserIcon,
  BookmarkIcon,
  Bars3Icon,
  FunnelIcon,
  StarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { bookApi, reviewApi } from '../services/api';
import { Book } from '../types/book';
import Logo from '../components/Logo';

const genres = [
  'Fiction', 'Non-Fiction', 'Fantasy', 'Science Fiction', 'Mystery', 'Romance', 'Biography', 'History',
  'Thriller', 'Horror', 'Self-Help', 'Business', 'Poetry', 'Drama', 'Adventure', 'Crime'
];

const categories = [
  'Bestseller', 'New Release', 'Award Winner', 'Classic', 'Contemporary', 'Indie', 'Local Author'
];

const languages = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Russian', 'Japanese', 'Chinese', 'Hindi'
];

const pageCountRanges = [
  { label: '0-100 pages', min: 0, max: 100 },
  { label: '101-300 pages', min: 101, max: 300 },
  { label: '301-500 pages', min: 301, max: 500 },
  { label: '501+ pages', min: 501, max: 1000 }
];

const ratings = [5, 4, 3, 2, 1];

const Browse: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = React.useState(false);
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedPageRange, setSelectedPageRange] = useState<{ min: number; max: number } | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [yearRange, setYearRange] = useState<number[]>([2000, 2023]);
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedFilters, setExpandedFilters] = useState({
    genre: true,
    category: false,
    language: false,
    pageCount: false,
    rating: false,
    year: false
  });
  const [searchType, setSearchType] = useState<'all' | 'title' | 'author' | 'genre'>('all');
  const [popularBooks, setPopularBooks] = useState<{ book: Book; reviewCount: number }[]>([]);
  const [popularLoading, setPopularLoading] = useState(false);
  const [popularError, setPopularError] = useState<string | null>(null);
  const [newReleases, setNewReleases] = useState<Book[]>([]);
  const [newReleasesLoading, setNewReleasesLoading] = useState(false);
  const [newReleasesError, setNewReleasesError] = useState<string | null>(null);
  const [topRated, setTopRated] = useState<Book[]>([]);
  const [topRatedLoading, setTopRatedLoading] = useState(false);
  const [topRatedError, setTopRatedError] = useState<string | null>(null);

  const navigation = [
    { name: 'Home', href: '/', icon: BookOpenIcon },
    { name: 'Browse', href: '/browse', icon: BookmarkIcon },
    { name: 'About', href: '/about', icon: BookOpenIcon },
    // { name: 'My Books', href: '/my-books', icon: HeartIcon },
  ];

  // Fetch all books on component mount
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const data = await bookApi.getBooks();
        setBooks(data);
        setFilteredBooks(data);
      } catch (err) {
        setError('Failed to fetch books');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  // Fetch books for tabs
  useEffect(() => {
    if (tab === 1) { // Popular
      const fetchPopularBooks = async () => {
        try {
          setPopularLoading(true);
          setPopularError(null);
          const data = await reviewApi.getPopularBooksThisWeek();
          setPopularBooks(data);
        } catch (err) {
          setPopularError('Failed to fetch popular books this week');
        } finally {
          setPopularLoading(false);
        }
      };
      fetchPopularBooks();
    }
    if (tab === 2) { // New Releases
      const fetchNewReleases = async () => {
        try {
          setNewReleasesLoading(true);
          setNewReleasesError(null);
          // Sort all books by publishedDate descending
          const data = [...books].sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());
          setNewReleases(data.slice(0, 20)); // Show top 20 new releases
        } catch (err) {
          setNewReleasesError('Failed to fetch new releases');
        } finally {
          setNewReleasesLoading(false);
        }
      };
      fetchNewReleases();
    }
    if (tab === 3) { // Top Rated
      const fetchTopRated = async () => {
        try {
          setTopRatedLoading(true);
          setTopRatedError(null);
          // Sort all books by averageRating descending
          const data = [...books].sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
          setTopRated(data.slice(0, 20)); // Show top 20 top rated
        } catch (err) {
          setTopRatedError('Failed to fetch top rated books');
        } finally {
          setTopRatedLoading(false);
        }
      };
      fetchTopRated();
    }
  }, [tab, books]);

  // Apply filters when button is clicked
  const handleApplyFilters = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const queryParams = new URLSearchParams();
      
      if (selectedGenres.length > 0) {
        queryParams.append('genres', selectedGenres.join(','));
      }
      
      if (selectedCategories.length > 0) {
        queryParams.append('categories', selectedCategories.join(','));
      }
      
      if (selectedLanguages.length > 0) {
        queryParams.append('languages', selectedLanguages.join(','));
      }
      
      if (selectedPageRange) {
        queryParams.append('minPages', selectedPageRange.min.toString());
        queryParams.append('maxPages', selectedPageRange.max.toString());
      }
      
      if (selectedRating) {
        queryParams.append('minRating', selectedRating.toString());
      }
      
      if (yearRange[0] !== 2000 || yearRange[1] !== 2023) {
        queryParams.append('minYear', yearRange[0].toString());
        queryParams.append('maxYear', yearRange[1].toString());
      }

      // If no filters are selected, show all books
      if (queryParams.toString() === '') {
        setFilteredBooks(books);
        return;
      }

      console.log(queryParams.toString());

      // Fetch filtered books from API
      const response = await bookApi.searchBooks(queryParams.toString());
      setFilteredBooks(response);
    } catch (err) {
      setError('Failed to apply filters');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();

      if (search.trim() !== '') {
        queryParams.append('query', search.trim());
        queryParams.append('type', searchType);
      }
      console.log('Query params:', queryParams.toString());

      // Add other filters if needed (genres, categories, etc.)
      if (selectedGenres.length > 0) {
        queryParams.append('genres', selectedGenres.join(','));
      }
      if (selectedCategories.length > 0) {
        queryParams.append('categories', selectedCategories.join(','));
      }
      if (selectedLanguages.length > 0) {
        queryParams.append('languages', selectedLanguages.join(','));
      }
      if (selectedPageRange) {
        queryParams.append('minPages', selectedPageRange.min.toString());
        queryParams.append('maxPages', selectedPageRange.max.toString());
      }
      if (selectedRating) {
        queryParams.append('minRating', selectedRating.toString());
      }
      if (yearRange[0] !== 2000 || yearRange[1] !== 2023) {
        queryParams.append('minYear', yearRange[0].toString());
        queryParams.append('maxYear', yearRange[1].toString());
      }

      // If no filters and no search, show all books
      if (queryParams.toString() === '') {
        setFilteredBooks(books);
        setTab(0); // Switch to All Books tab
        return;
      }

      const response = await bookApi.searchBooks(queryParams.toString());
      setFilteredBooks(response);
      setTab(0); // Switch to All Books tab
    } catch (err) {
      setError('Failed to search books');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      minHeight: '100vh',
      bgcolor: '#fafafa'
    }}>
      {/* Enhanced Navigation */}
      <Paper elevation={0} sx={{ 
        borderBottom: '1px solid', 
        borderColor: 'divider',
        backgroundColor: 'white'
      }}>
        <nav>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <div className="flex-shrink-0 flex items-center">
                  <Logo />
                </div>
                <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200"
                    >
                      <item.icon className="h-5 w-5 mr-2" />
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="flex items-center">
                <Button 
                  sx={{ 
                    minWidth: 40,
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    bgcolor: 'grey.100',
                    '&:hover': { bgcolor: 'grey.200' }
                  }} 
                  component={Link} 
                  to="/profile"
                >
                  <UserIcon className="h-5 w-5 text-gray-600" />
                </Button>
              </div>

              <div className="flex items-center sm:hidden">
                <Button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  sx={{ minWidth: 40, width: 40, height: 40 }}
                >
                  <Bars3Icon className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          <Collapse in={isMenuOpen} className="sm:hidden">
            <Paper elevation={1} sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
              <div className="py-2 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="flex items-center px-4 py-3 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Link>
                ))}
                <Link
                  to="/profile"
                  className="flex items-center px-4 py-3 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <UserIcon className="h-5 w-5 mr-3" />
                  Profile
                </Link>
              </div>
            </Paper>
          </Collapse>
        </nav>
      </Paper>

      {/* Enhanced Hero Section */}


      <Box className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Box className="flex flex-col lg:flex-row gap-8">
          {/* Enhanced Sidebar Filters */}
          <Paper 
            elevation={0} 
            sx={{ 
              width: { xs: '100%', lg: 320 },
              p: 3,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              height: 'fit-content',
              position: { lg: 'sticky' },
              top: 24,
              display: { xs: isMobileFiltersOpen ? 'block' : 'none', lg: 'block' }
            }}
          >
            <Box className="flex items-center justify-between mb-4">
              <Box className="flex items-center">
                <FunnelIcon className="h-5 w-5 mr-2 text-gray-600" />
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Filters
                </Typography>
              </Box>
              <Button
                sx={{ 
                  display: { xs: 'block', lg: 'none' },
                  minWidth: 'auto',
                  p: 1
                }}
                onClick={() => setIsMobileFiltersOpen(false)}
              >
                <ChevronUpIcon className="h-5 w-5" />
              </Button>
            </Box>
            
            {/* Genre Filter */}
            <Box className="mb-4">
              <Box 
                className="flex justify-between items-center cursor-pointer py-2"
                onClick={() => setExpandedFilters({...expandedFilters, genre: !expandedFilters.genre})}
                sx={{ 
                  '&:hover': { bgcolor: 'grey.50' },
                  borderRadius: 1,
                  px: 1
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 500, color: 'text.primary' }}>
                  Genre
                </Typography>
                <Badge badgeContent={selectedGenres.length || 0} color="primary">
                  {expandedFilters.genre ? 
                    <ChevronUpIcon className="h-4 w-4 text-gray-500" /> : 
                    <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                  }
                </Badge>
              </Box>
              <Collapse in={expandedFilters.genre}>
                <Box className="mt-2 max-h-48 overflow-y-auto">
                  {genres.map((genre) => (
                    <FormControlLabel
                      key={genre}
                      control={
                        <Checkbox
                          size="small"
                          checked={selectedGenres.includes(genre)}
                          onChange={() => setSelectedGenres(selectedGenres.includes(genre)
                            ? selectedGenres.filter(g => g !== genre)
                            : [...selectedGenres, genre])}
                          sx={{ py: 0.25 }}
                        />
                      }
                      label={<Typography variant="body2" sx={{ fontSize: '0.875rem' }}>{genre}</Typography>}
                      sx={{ 
                        display: 'flex', 
                        width: '100%',
                        ml: 0, 
                        mr: 0,
                        my: 0.25,
                        '& .MuiFormControlLabel-label': {
                          fontSize: '0.875rem'
                        }
                      }}
                    />
                  ))}
                </Box>
              </Collapse>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Category Filter */}
            <Box className="mb-4">
              <Box 
                className="flex justify-between items-center cursor-pointer py-2"
                onClick={() => setExpandedFilters({...expandedFilters, category: !expandedFilters.category})}
                sx={{ 
                  '&:hover': { bgcolor: 'grey.50' },
                  borderRadius: 1,
                  px: 1
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 500, color: 'text.primary' }}>
                  Category
                </Typography>
                <Badge badgeContent={selectedCategories.length || 0} color="primary">
                  {expandedFilters.category ? 
                    <ChevronUpIcon className="h-4 w-4 text-gray-500" /> : 
                    <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                  }
                </Badge>
              </Box>
              <Collapse in={expandedFilters.category}>
                <Box className="mt-2 max-h-48 overflow-y-auto">
                  {categories.map((category) => (
                    <FormControlLabel
                      key={category}
                      control={
                        <Checkbox
                          size="small"
                          checked={selectedCategories.includes(category)}
                          onChange={() => setSelectedCategories(selectedCategories.includes(category)
                            ? selectedCategories.filter(c => c !== category)
                            : [...selectedCategories, category])}
                          sx={{ py: 0.25 }}
                        />
                      }
                      label={<Typography variant="body2" sx={{ fontSize: '0.875rem' }}>{category}</Typography>}
                      sx={{ 
                        display: 'flex', 
                        width: '100%',
                        ml: 0, 
                        mr: 0,
                        my: 0.25,
                        '& .MuiFormControlLabel-label': {
                          fontSize: '0.875rem'
                        }
                      }}
                    />
                  ))}
                </Box>
              </Collapse>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Language Filter */}
            <Box className="mb-4">
              <Box 
                className="flex justify-between items-center cursor-pointer py-2"
                onClick={() => setExpandedFilters({...expandedFilters, language: !expandedFilters.language})}
                sx={{ 
                  '&:hover': { bgcolor: 'grey.50' },
                  borderRadius: 1,
                  px: 1
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 500, color: 'text.primary' }}>
                  Language
                </Typography>
                <Badge badgeContent={selectedLanguages.length || 0} color="primary">
                  {expandedFilters.language ? 
                    <ChevronUpIcon className="h-4 w-4 text-gray-500" /> : 
                    <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                  }
                </Badge>
              </Box>
              <Collapse in={expandedFilters.language}>
                <Box className="mt-2 max-h-48 overflow-y-auto">
                  {languages.map((language) => (
                    <FormControlLabel
                      key={language}
                      control={
                        <Checkbox
                          size="small"
                          checked={selectedLanguages.includes(language)}
                          onChange={() => setSelectedLanguages(selectedLanguages.includes(language)
                            ? selectedLanguages.filter(l => l !== language)
                            : [...selectedLanguages, language])}
                          sx={{ py: 0.25 }}
                        />
                      }
                      label={<Typography variant="body2" sx={{ fontSize: '0.875rem' }}>{language}</Typography>}
                      sx={{ 
                        display: 'flex', 
                        width: '100%',
                        ml: 0, 
                        mr: 0,
                        my: 0.25,
                        '& .MuiFormControlLabel-label': {
                          fontSize: '0.875rem'
                        }
                      }}
                    />
                  ))}
                </Box>
              </Collapse>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Rating Filter */}
            <Box className="mb-4">
              <Box 
                className="flex justify-between items-center cursor-pointer py-2"
                onClick={() => setExpandedFilters({...expandedFilters, rating: !expandedFilters.rating})}
                sx={{ 
                  '&:hover': { bgcolor: 'grey.50' },
                  borderRadius: 1,
                  px: 1
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 500, color: 'text.primary' }}>
                  Rating
                </Typography>
                <Badge badgeContent={selectedRating ? 1 : 0} color="primary">
                  {expandedFilters.rating ? 
                    <ChevronUpIcon className="h-4 w-4 text-gray-500" /> : 
                    <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                  }
                </Badge>
              </Box>
              <Collapse in={expandedFilters.rating}>
                <Box className="mt-2">
                  {ratings.map((r) => (
                    <FormControlLabel
                      key={r}
                      control={
                        <Checkbox
                          size="small"
                          checked={selectedRating === r}
                          onChange={() => setSelectedRating(selectedRating === r ? null : r)}
                          sx={{ py: 0.25 }}
                        />
                      }
                      label={
                        <Box className="flex items-center">
                          <Typography variant="body2" sx={{ mr: 1, fontSize: '0.875rem' }}>{r}+</Typography>
                          {[...Array(r)].map((_, i) => (
                            <StarIcon key={i} className="h-3 w-3 text-yellow-400" />
                          ))}
                        </Box>
                      }
                      sx={{ 
                        display: 'flex', 
                        width: '100%',
                        ml: 0, 
                        mr: 0,
                        my: 0.25,
                        '& .MuiFormControlLabel-label': {
                          fontSize: '0.875rem'
                        }
                      }}
                    />
                  ))}
                </Box>
              </Collapse>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Page Count Filter */}
            <Box className="mb-4">
              <Box 
                className="flex justify-between items-center cursor-pointer py-2"
                onClick={() => setExpandedFilters({...expandedFilters, pageCount: !expandedFilters.pageCount})}
                sx={{ 
                  '&:hover': { bgcolor: 'grey.50' },
                  borderRadius: 1,
                  px: 1
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 500, color: 'text.primary' }}>
                  Page Count
                </Typography>
                <Badge badgeContent={selectedPageRange ? 1 : 0} color="primary">
                  {expandedFilters.pageCount ? 
                    <ChevronUpIcon className="h-4 w-4 text-gray-500" /> : 
                    <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                  }
                </Badge>
              </Box>
              <Collapse in={expandedFilters.pageCount}>
                <Box className="mt-2">
                  {pageCountRanges.map((range) => (
                    <FormControlLabel
                      key={range.label}
                      control={
                        <Checkbox
                          size="small"
                          checked={selectedPageRange?.min === range.min && selectedPageRange?.max === range.max}
                          onChange={() => setSelectedPageRange(
                            selectedPageRange?.min === range.min && selectedPageRange?.max === range.max
                              ? null
                              : { min: range.min, max: range.max }
                          )}
                          sx={{ py: 0.25 }}
                        />
                      }
                      label={<Typography variant="body2" sx={{ fontSize: '0.875rem' }}>{range.label}</Typography>}
                      sx={{ 
                        display: 'flex', 
                        width: '100%',
                        ml: 0, 
                        mr: 0,
                        my: 0.25,
                        '& .MuiFormControlLabel-label': {
                          fontSize: '0.875rem'
                        }
                      }}
                    />
                  ))}
                </Box>
              </Collapse>
            </Box>

            <Button 
              variant="contained" 
              fullWidth 
              sx={{ 
                mt: 3,
                py: 1.5,
                borderRadius: 2,
                fontWeight: 600,
                textTransform: 'none',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                }
              }}
              onClick={handleApplyFilters}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Apply Filters'}
            </Button>

            {/* Clear filters button */}
            <Button 
              variant="text" 
              fullWidth 
              sx={{ 
                mt: 1,
                py: 1,
                textTransform: 'none',
                color: 'text.secondary'
              }}
              onClick={() => {
                setSelectedGenres([]);
                setSelectedCategories([]);
                setSelectedLanguages([]);
                setSelectedPageRange(null);
                setSelectedRating(null);
                setYearRange([2000, 2023]);
                setFilteredBooks(books);
              }}
            >
              Clear All Filters
            </Button>
          </Paper>

          {/* Enhanced Main Content */}
          <Box className="flex-1">
            {/* Mobile Filter Toggle Button */}
            <Button
              variant="outlined"
              startIcon={<FunnelIcon className="h-5 w-5" />}
              onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
              sx={{
                display: { xs: 'flex', lg: 'none' },
                mb: 3,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              {isMobileFiltersOpen ? 'Hide Filters' : 'Show Filters'}
              {(selectedGenres.length > 0 || selectedCategories.length > 0 || selectedLanguages.length > 0 || selectedRating || selectedPageRange) && (
                <Badge 
                  badgeContent={
                    selectedGenres.length + 
                    selectedCategories.length + 
                    selectedLanguages.length + 
                    (selectedRating ? 1 : 0) + 
                    (selectedPageRange ? 1 : 0)
                  } 
                  color="primary" 
                  sx={{ ml: 1 }}
                />
              )}
            </Button>

            {/* Enhanced Search Section */}
            <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, mb: 4, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: 'text.primary', fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                Search Books
              </Typography>
              <Box className="flex flex-col gap-3">
                <TextField
                  fullWidth
                  placeholder="Search by title, author, or keyword..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'white'
                    }
                  }}
                />
                <Box className="flex flex-col sm:flex-row gap-3">
                  <Select
                    value={searchType}
                    onChange={e => setSearchType(e.target.value as any)}
                    sx={{ 
                      minWidth: { xs: '100%', sm: 140 },
                      borderRadius: 2,
                      backgroundColor: 'white'
                    }}
                  >
                    <MenuItem value="all">All Fields</MenuItem>
                    <MenuItem value="title">Title Only</MenuItem>
                    <MenuItem value="author">Author Only</MenuItem>
                  </Select>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{ 
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 600,
                      textTransform: 'none',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                      }
                    }}
                    onClick={handleSearch}
                    disabled={loading}
                  >
                    Search
                  </Button>
                </Box>
              </Box>
            </Paper>

            {/* Enhanced Tabs */}
            <Box sx={{ mb: 3 }}>
              <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ 
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    minHeight: { xs: 44, sm: 48 },
                    minWidth: { xs: 80, sm: 160 }
                  },
                  '& .MuiTabs-indicator': {
                    height: 3,
                    borderRadius: 1.5
                  }
                }}
              >
                <Tab label="All Books" />
                <Tab label="Popular This Week" />
                <Tab label="New Releases" />
                <Tab label="Top Rated" />
              </Tabs>
            </Box>

            {/* Results count and filters */}
            {tab === 0 && (
              <Box className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
                <Typography variant="body1" color="text.secondary">
                  {filteredBooks.length} books found
                </Typography>
                {(selectedGenres.length > 0 || selectedCategories.length > 0 || selectedLanguages.length > 0 || selectedRating || selectedPageRange) && (
                  <Box className="flex gap-1 flex-wrap">
                    {selectedGenres.map(genre => (
                      <Chip 
                        key={genre} 
                        label={genre} 
                        size="small" 
                        onDelete={() => setSelectedGenres(selectedGenres.filter(g => g !== genre))}
                        color="primary"
                        variant="outlined"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      />
                    ))}
                    {selectedCategories.map(category => (
                      <Chip 
                        key={category} 
                        label={category} 
                        size="small" 
                        onDelete={() => setSelectedCategories(selectedCategories.filter(c => c !== category))}
                        color="secondary"
                        variant="outlined"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      />
                    ))}
                    {selectedLanguages.map(language => (
                      <Chip 
                        key={language} 
                        label={language} 
                        size="small" 
                        onDelete={() => setSelectedLanguages(selectedLanguages.filter(l => l !== language))}
                        color="success"
                        variant="outlined"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      />
                    ))}
                    {selectedRating && (
                      <Chip 
                        label={`${selectedRating}+ Stars`} 
                        size="small" 
                        onDelete={() => setSelectedRating(null)}
                        color="warning"
                        variant="outlined"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      />
                    )}
                    {selectedPageRange && (
                      <Chip 
                        label={`${selectedPageRange.min}-${selectedPageRange.max} pages`} 
                        size="small" 
                        onDelete={() => setSelectedPageRange(null)}
                        color="info"
                        variant="outlined"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      />
                    )}
                  </Box>
                )}
              </Box>
            )}

            {/* Enhanced Tab Content */}
            {tab === 1 ? (
              // Popular Books Tab
              popularLoading ? (
                <Box className="flex justify-center items-center h-64">
                  <CircularProgress size={48} />
                </Box>
              ) : popularError ? (
                <Alert severity="error" sx={{ mb: 2 }}>{popularError}</Alert>
              ) : (
                <Grid container spacing={3}>
                  {popularBooks.map(({ book, reviewCount }) => (
                    <Grid item xs={6} sm={6} md={4} lg={3} key={book._id}>
                      <Card 
                        sx={{ 
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          borderRadius: 3,
                          border: '1px solid',
                          borderColor: 'divider',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                            borderColor: 'primary.main'
                          }
                        }}
                      >
                        <Box sx={{ position: 'relative' }}>
                          <CardMedia
                            component="img"
                            image={book.coverImage}
                            alt={book.title}
                            sx={{ 
                              height: { xs: 180, sm: 200, md: 240 }, 
                              objectFit: 'cover'
                            }}
                          />
                          <Box 
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              background: 'rgba(0,0,0,0.8)',
                              color: 'white',
                              borderRadius: 2,
                              px: { xs: 1, sm: 1.5 },
                              py: 0.5,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5
                            }}
                          >
                            <StarIcon className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400" />
                            <Typography variant="caption" sx={{ fontWeight: 500, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                              {typeof book.averageRating === 'number'
                                ? book.averageRating.toFixed(1)
                                : 'N/A'}
                            </Typography>
                          </Box>
                          <Chip
                            label="Popular"
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: 8,
                              left: 8,
                              backgroundColor: 'error.main',
                              color: 'white',
                              fontWeight: 600,
                              fontSize: { xs: '0.7rem', sm: '0.75rem' },
                              height: { xs: 20, sm: 24 }
                            }}
                          />
                        </Box>
                        <CardContent sx={{ flex: 1, p: { xs: 1.5, sm: 2.5 } }}>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: 600, 
                              mb: 0.5,
                              lineHeight: 1.3,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' }
                            }}
                          >
                            {book.title}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ mb: 1.5, fontWeight: 500, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                          >
                            by {book.author}
                          </Typography>
                          <Box className="flex items-center gap-1 mb-2">
                            <ClockIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                              {reviewCount} reviews this week
                            </Typography>
                          </Box>
                          <Button
                            variant="contained"
                            fullWidth
                            component={Link}
                            to={`/books/${book._id}`}
                            sx={{
                              mt: 'auto',
                              borderRadius: 2,
                              textTransform: 'none',
                              fontWeight: 600,
                              fontSize: { xs: '0.75rem', sm: '0.875rem' },
                              py: { xs: 0.75, sm: 1 },
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                              }
                            }}
                          >
                            View Details
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )
            ) : tab === 2 ? (
              // New Releases Tab (similar enhanced styling)
              newReleasesLoading ? (
                <Box className="flex justify-center items-center h-64">
                  <CircularProgress size={48} />
                </Box>
              ) : newReleasesError ? (
                <Alert severity="error" sx={{ mb: 2 }}>{newReleasesError}</Alert>
              ) : (
                <Grid container spacing={3}>
                  {newReleases.map((book) => (
                    <Grid item xs={6} sm={6} md={4} lg={3} key={book._id}>
                      <Card 
                        sx={{ 
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          borderRadius: 3,
                          border: '1px solid',
                          borderColor: 'divider',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                            borderColor: 'primary.main'
                          }
                        }}
                      >
                        <Box sx={{ position: 'relative' }}>
                          <CardMedia
                            component="img"
                            image={book.coverImage}
                            alt={book.title}
                            sx={{ 
                              height: { xs: 180, sm: 200, md: 240 }, 
                              objectFit: 'cover'
                            }}
                          />
                          <Box 
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              background: 'rgba(0,0,0,0.8)',
                              color: 'white',
                              borderRadius: 2,
                              px: { xs: 1, sm: 1.5 },
                              py: 0.5,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5
                            }}
                          >
                            <StarIcon className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400" />
                            <Typography variant="caption" sx={{ fontWeight: 500, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                              {book.averageRating?.toFixed(1) || 'N/A'}
                            </Typography>
                          </Box>
                          <Chip
                            label="New"
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: 8,
                              left: 8,
                              backgroundColor: 'success.main',
                              color: 'white',
                              fontWeight: 600,
                              fontSize: { xs: '0.7rem', sm: '0.75rem' },
                              height: { xs: 20, sm: 24 }
                            }}
                          />
                        </Box>
                        <CardContent sx={{ flex: 1, p: { xs: 1.5, sm: 2.5 } }}>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: 600, 
                              mb: 0.5,
                              lineHeight: 1.3,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' }
                            }}
                          >
                            {book.title}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ mb: 2, fontWeight: 500, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                          >
                            by {book.author}
                          </Typography>
                          <Button
                            variant="contained"
                            fullWidth
                            component={Link}
                            to={`/books/${book._id}`}
                            sx={{
                              mt: 'auto',
                              borderRadius: 2,
                              textTransform: 'none',
                              fontWeight: 600,
                              fontSize: { xs: '0.75rem', sm: '0.875rem' },
                              py: { xs: 0.75, sm: 1 },
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                              }
                            }}
                          >
                            View Details
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )
            ) : tab === 3 ? (
              // Top Rated Tab (similar enhanced styling)
              topRatedLoading ? (
                <Box className="flex justify-center items-center h-64">
                  <CircularProgress size={48} />
                </Box>
              ) : topRatedError ? (
                <Alert severity="error" sx={{ mb: 2 }}>{topRatedError}</Alert>
              ) : (
                <Grid container spacing={3}>
                  {topRated.map((book) => (
                    <Grid item xs={6} sm={6} md={4} lg={3} key={book._id}>
                      <Card 
                        sx={{ 
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          borderRadius: 3,
                          border: '1px solid',
                          borderColor: 'divider',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                            borderColor: 'primary.main'
                          }
                        }}
                      >
                        <Box sx={{ position: 'relative' }}>
                          <CardMedia
                            component="img"
                            image={book.coverImage}
                            alt={book.title}
                            sx={{ 
                              height: { xs: 180, sm: 200, md: 240 }, 
                              objectFit: 'cover'
                            }}
                          />
                          <Box 
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              background: 'rgba(0,0,0,0.8)',
                              color: 'white',
                              borderRadius: 2,
                              px: { xs: 1, sm: 1.5 },
                              py: 0.5,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5
                            }}
                          >
                            <StarIcon className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400" />
                            <Typography variant="caption" sx={{ fontWeight: 500, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                              {book.averageRating?.toFixed(1) || 'N/A'}
                            </Typography>
                          </Box>
                          <Chip
                            label="Top Rated"
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: 8,
                              left: 8,
                              backgroundColor: 'warning.main',
                              color: 'white',
                              fontWeight: 600,
                              fontSize: { xs: '0.7rem', sm: '0.75rem' },
                              height: { xs: 20, sm: 24 }
                            }}
                          />
                        </Box>
                        <CardContent sx={{ flex: 1, p: { xs: 1.5, sm: 2.5 } }}>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: 600, 
                              mb: 0.5,
                              lineHeight: 1.3,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' }
                            }}
                          >
                            {book.title}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ mb: 2, fontWeight: 500, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                          >
                            by {book.author}
                          </Typography>
                          <Button
                            variant="contained"
                            fullWidth
                            component={Link}
                            to={`/books/${book._id}`}
                            sx={{
                              mt: 'auto',
                              borderRadius: 2,
                              textTransform: 'none',
                              fontWeight: 600,
                              fontSize: { xs: '0.75rem', sm: '0.875rem' },
                              py: { xs: 0.75, sm: 1 },
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                              }
                            }}
                          >
                            View Details
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )
            ) : (
              // All Books Tab
              <>
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                )}
                {loading ? (
                  <Box className="flex justify-center items-center h-64">
                    <CircularProgress size={48} />
                  </Box>
                ) : (
                  <Grid container spacing={3}>
                    {filteredBooks.map((book) => (
                      <Grid item xs={6} sm={6} md={4} lg={3} key={book._id}>
                        <Card 
                          sx={{ 
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: 'divider',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                              borderColor: 'primary.main'
                            }
                          }}
                        >
                          <Box sx={{ position: 'relative' }}>
                            <CardMedia
                              component="img"
                              image={book.coverImage}
                              alt={book.title}
                              sx={{ 
                                height: { xs: 180, sm: 200, md: 240 }, 
                                objectFit: 'cover'
                              }}
                            />
                            <Box 
                              sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                background: 'rgba(0,0,0,0.8)',
                                color: 'white',
                                borderRadius: 2,
                                px: { xs: 1, sm: 1.5 },
                                py: 0.5,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5
                              }}
                            >
                              <StarIcon className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400" />
                              <Typography variant="caption" sx={{ fontWeight: 500, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                                {book.averageRating?.toFixed(1) || 'N/A'}
                              </Typography>
                            </Box>
                          </Box>
                          <CardContent sx={{ flex: 1, p: { xs: 1.5, sm: 2.5 } }}>
                            <Typography 
                              variant="h6" 
                              sx={{ 
                                fontWeight: 600, 
                                mb: 0.5,
                                lineHeight: 1.3,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' }
                              }}
                            >
                              {book.title}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              color="text.secondary" 
                              sx={{ mb: 2, fontWeight: 500, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                            >
                              by {book.author}
                            </Typography>
                            <Button
                              variant="contained"
                              fullWidth
                              component={Link}
                              to={`/books/${book._id}`}
                              sx={{
                                mt: 'auto',
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                py: { xs: 0.75, sm: 1 },
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                '&:hover': {
                                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                                }
                              }}
                            >
                              View Details
                            </Button>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Browse; 