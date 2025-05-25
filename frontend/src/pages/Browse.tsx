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
} from '@mui/material';
import { 
  MagnifyingGlassIcon, 
  ChevronDownIcon, 
  ChevronUpIcon, 
  BookOpenIcon,
  UserIcon,
  BookmarkIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import { bookApi, reviewApi } from '../services/api';
import { Book } from '../types/book';

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
      bgcolor: '#f7f6f2'
    }}>
      <Box sx={{ flex: 1 }}>
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              {/* Logo and Desktop Navigation */}
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <Link to="/" className="text-2xl font-bold text-gray-900">
                    Book Review
                  </Link>
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

        <Box className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
          <Box className="flex flex-col md:flex-row gap-8">
            {/* Sidebar Filters */}
            <Box className="bg-white rounded-xl shadow p-6 w-full md:w-80 mb-6 md:mb-0" sx={{ minWidth: 240 }}>
              <Typography variant="h6" className="font-bold mb-4">Filters</Typography>
              
              {/* Genre Filter */}
              <Box className="mb-4">
                <Box 
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => setExpandedFilters({...expandedFilters, genre: !expandedFilters.genre})}
                >
                  <Typography variant="subtitle2" className="font-semibold">Genre</Typography>
                  {expandedFilters.genre ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
                </Box>
                <Collapse in={expandedFilters.genre}>
                  <Box className="mt-2">
                {genres.map((genre) => (
                  <FormControlLabel
                    key={genre}
                    control={
                      <Checkbox
                        checked={selectedGenres.includes(genre)}
                        onChange={() => setSelectedGenres(selectedGenres.includes(genre)
                          ? selectedGenres.filter(g => g !== genre)
                          : [...selectedGenres, genre])}
                      />
                    }
                    label={genre}
                  />
                ))}
                  </Box>
                </Collapse>
              </Box>
              <Divider className="my-2" />

              {/* Category Filter */}
              <Box className="mb-4">
                <Box 
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => setExpandedFilters({...expandedFilters, category: !expandedFilters.category})}
                >
                  <Typography variant="subtitle2" className="font-semibold">Category</Typography>
                  {expandedFilters.category ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
                </Box>
                <Collapse in={expandedFilters.category}>
                  <Box className="mt-2">
                    {categories.map((category) => (
                      <FormControlLabel
                        key={category}
                        control={
                          <Checkbox
                            checked={selectedCategories.includes(category)}
                            onChange={() => setSelectedCategories(selectedCategories.includes(category)
                              ? selectedCategories.filter(c => c !== category)
                              : [...selectedCategories, category])}
                          />
                        }
                        label={category}
                      />
                    ))}
                  </Box>
                </Collapse>
              </Box>
              <Divider className="my-2" />

              {/* Language Filter */}
              <Box className="mb-4">
                <Box 
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => setExpandedFilters({...expandedFilters, language: !expandedFilters.language})}
                >
                  <Typography variant="subtitle2" className="font-semibold">Language</Typography>
                  {expandedFilters.language ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
                </Box>
                <Collapse in={expandedFilters.language}>
                  <Box className="mt-2">
                    {languages.map((language) => (
                      <FormControlLabel
                        key={language}
                        control={
                          <Checkbox
                            checked={selectedLanguages.includes(language)}
                            onChange={() => setSelectedLanguages(selectedLanguages.includes(language)
                              ? selectedLanguages.filter(l => l !== language)
                              : [...selectedLanguages, language])}
                          />
                        }
                        label={language}
                      />
                    ))}
                  </Box>
                </Collapse>
              </Box>
              <Divider className="my-2" />

              {/* Page Count Filter */}
              <Box className="mb-4">
                <Box 
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => setExpandedFilters({...expandedFilters, pageCount: !expandedFilters.pageCount})}
                >
                  <Typography variant="subtitle2" className="font-semibold">Page Count</Typography>
                  {expandedFilters.pageCount ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
                </Box>
                <Collapse in={expandedFilters.pageCount}>
                  <Box className="mt-2">
                    {pageCountRanges.map((range) => (
                      <FormControlLabel
                        key={range.label}
                        control={
                          <Checkbox
                            checked={selectedPageRange?.min === range.min && selectedPageRange?.max === range.max}
                            onChange={() => setSelectedPageRange(
                              selectedPageRange?.min === range.min && selectedPageRange?.max === range.max
                                ? null
                                : { min: range.min, max: range.max }
                            )}
                          />
                        }
                        label={range.label}
                      />
                    ))}
                  </Box>
                </Collapse>
              </Box>
              <Divider className="my-2" />

              {/* Rating Filter */}
              <Box className="mb-4">
                <Box 
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => setExpandedFilters({...expandedFilters, rating: !expandedFilters.rating})}
                >
                  <Typography variant="subtitle2" className="font-semibold">Rating</Typography>
                  {expandedFilters.rating ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
                </Box>
                <Collapse in={expandedFilters.rating}>
                  <Box className="mt-2">
                {ratings.map((r) => (
                  <FormControlLabel
                    key={r}
                    control={
                      <Checkbox
                        checked={selectedRating === r}
                        onChange={() => setSelectedRating(selectedRating === r ? null : r)}
                      />
                    }
                    label={`${r}+ Stars`}
                  />
                ))}
                  </Box>
                </Collapse>
              </Box>
              <Divider className="my-2" />

              {/* Year Range Filter */}
              <Box className="mb-4">
                <Box 
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => setExpandedFilters({...expandedFilters, year: !expandedFilters.year})}
                >
                  <Typography variant="subtitle2" className="font-semibold">Publication Year</Typography>
                  {expandedFilters.year ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
                </Box>
                <Collapse in={expandedFilters.year}>
                  <Box className="mt-2 flex gap-2">
                <TextField
                  size="small"
                  type="number"
                  value={yearRange[0]}
                  onChange={e => setYearRange([+e.target.value, yearRange[1]])}
                  sx={{ width: 80 }}
                />
                <Typography variant="body2" className="self-center">to</Typography>
                <TextField
                  size="small"
                  type="number"
                  value={yearRange[1]}
                  onChange={e => setYearRange([yearRange[0], +e.target.value])}
                  sx={{ width: 80 }}
                />
              </Box>
                </Collapse>
              </Box>

              <Button 
                variant="contained" 
                color="primary" 
                fullWidth 
                sx={{ mt: 2, borderRadius: 2 }}
                onClick={handleApplyFilters}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Apply Filters'}
              </Button>
            </Box>

            {/* Main Content */}
            <Box className="flex-1">
              <Typography variant="h4" className="font-bold mb-4">Browse Books</Typography>
              <Box className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                <TextField
                  fullWidth
                  placeholder="Find your next favorite book..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ background: 'white', borderRadius: 2 }}
                />
                <Select
                  value={searchType}
                  onChange={e => setSearchType(e.target.value as any)}
                  size="small"
                  sx={{ minWidth: 140, background: 'white', borderRadius: 2 }}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="title">Title</MenuItem>
                  <MenuItem value="author">Author</MenuItem>
                  {/* <MenuItem value="genre">Genre</MenuItem> */}
                </Select>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ borderRadius: 2 }}
                  onClick={handleSearch}
                  disabled={loading}
                >
                  Search
                </Button>
              </Box>
              <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                sx={{ mb: 2 }}
                textColor="primary"
                indicatorColor="primary"
              >
                <Tab label="All Books" />
                <Tab label="Popular" />
                <Tab label="New Releases" />
                <Tab label="Top Rated" />
              </Tabs>
              {/* Tab Content */}
              {tab === 1 ? (
                popularLoading ? (
                  <Box className="flex justify-center items-center h-64">
                    <CircularProgress />
                  </Box>
                ) : popularError ? (
                  <Alert severity="error" sx={{ mb: 2 }}>{popularError}</Alert>
                ) : (
                  <Grid container spacing={3}>
                    {popularBooks.map(({ book, reviewCount }) => (
                      <Grid item xs={12} sm={6} md={4} lg={3} key={book._id}>
                        <Card className="relative flex flex-col h-full" sx={{ borderRadius: 3 }}>
                          <Box className="relative">
                            <CardMedia
                              component="img"
                              image={book.coverImage}
                              alt={book.title}
                              sx={{ height: 220, objectFit: 'cover', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
                            />
                            <Box className="absolute top-2 right-2 bg-black bg-opacity-80 text-white rounded px-2 py-1 flex items-center gap-1">
                              <span className="text-yellow-400">★</span>
                              <Typography variant="caption">
                                {typeof book.averageRating === 'number'
                                  ? book.averageRating.toFixed(1)
                                  : '-'}
                              </Typography>
                            </Box>
                          </Box>
                          <CardContent className="flex-1 flex flex-col justify-between">
                            <Box>
                              <Typography variant="subtitle1" className="font-semibold" noWrap>{book.title}</Typography>
                              <Typography variant="body2" color="text.secondary" noWrap>{book.author}</Typography>
                              <Typography variant="body2" color="text.secondary">{reviewCount} reviews this week</Typography>
                            </Box>
                            <Box className="flex gap-2 mt-3">
                              <Button
                                variant="contained"
                                size="small"
                                sx={{ borderRadius: 2 }}
                                component={Link}
                                to={`/books/${book._id}`}
                              >
                                View Details
                              </Button>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )
              ) : tab === 2 ? (
                newReleasesLoading ? (
                  <Box className="flex justify-center items-center h-64">
                    <CircularProgress />
                  </Box>
                ) : newReleasesError ? (
                  <Alert severity="error" sx={{ mb: 2 }}>{newReleasesError}</Alert>
                ) : (
                  <Grid container spacing={3}>
                    {newReleases.map((book) => (
                      <Grid item xs={12} sm={6} md={4} lg={3} key={book._id}>
                        <Card className="relative flex flex-col h-full" sx={{ borderRadius: 3 }}>
                          <Box className="relative">
                            <CardMedia
                              component="img"
                              image={book.coverImage}
                              alt={book.title}
                              sx={{ height: 220, objectFit: 'cover', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
                            />
                            <Box className="absolute top-2 right-2 bg-black bg-opacity-80 text-white rounded px-2 py-1 flex items-center gap-1">
                              <span className="text-yellow-400">★</span>
                              <Typography variant="caption">{book.averageRating?.toFixed(1) || 'N/A'}</Typography>
                            </Box>
                          </Box>
                          <CardContent className="flex-1 flex flex-col justify-between">
                            <Box>
                              <Typography variant="subtitle1" className="font-semibold" noWrap>{book.title}</Typography>
                              <Typography variant="body2" color="text.secondary" noWrap>{book.author}</Typography>
                            </Box>
                            <Box className="flex gap-2 mt-3">
                              <Button
                                variant="contained"
                                size="small"
                                sx={{ borderRadius: 2 }}
                                component={Link}
                                to={`/books/${book._id}`}
                              >
                                View Details
                              </Button>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )
              ) : tab === 3 ? (
                topRatedLoading ? (
                  <Box className="flex justify-center items-center h-64">
                    <CircularProgress />
                  </Box>
                ) : topRatedError ? (
                  <Alert severity="error" sx={{ mb: 2 }}>{topRatedError}</Alert>
                ) : (
                  <Grid container spacing={3}>
                    {topRated.map((book) => (
                      <Grid item xs={12} sm={6} md={4} lg={3} key={book._id}>
                        <Card className="relative flex flex-col h-full" sx={{ borderRadius: 3 }}>
                          <Box className="relative">
                            <CardMedia
                              component="img"
                              image={book.coverImage}
                              alt={book.title}
                              sx={{ height: 220, objectFit: 'cover', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
                            />
                            <Box className="absolute top-2 right-2 bg-black bg-opacity-80 text-white rounded px-2 py-1 flex items-center gap-1">
                              <span className="text-yellow-400">★</span>
                              <Typography variant="caption">{book.averageRating?.toFixed(1) || 'N/A'}</Typography>
                            </Box>
                          </Box>
                          <CardContent className="flex-1 flex flex-col justify-between">
                            <Box>
                              <Typography variant="subtitle1" className="font-semibold" noWrap>{book.title}</Typography>
                              <Typography variant="body2" color="text.secondary" noWrap>{book.author}</Typography>
                            </Box>
                            <Box className="flex gap-2 mt-3">
                              <Button
                                variant="contained"
                                size="small"
                                sx={{ borderRadius: 2 }}
                                component={Link}
                                to={`/books/${book._id}`}
                              >
                                View Details
                              </Button>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )
              ) : (
                // All Books tab
                <>
              <Typography variant="body2" className="mb-2 text-gray-600">{filteredBooks.length} books found</Typography>
                  {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                  )}
                  {loading ? (
                    <Box className="flex justify-center items-center h-64">
                      <CircularProgress />
                    </Box>
                  ) : (
              <Grid container spacing={3}>
                {filteredBooks.map((book) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={book._id}>
                    <Card className="relative flex flex-col h-full" sx={{ borderRadius: 3 }}>
                      <Box className="relative">
                        <CardMedia
                          component="img"
                          image={book.coverImage}
                          alt={book.title}
                          sx={{ height: 220, objectFit: 'cover', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
                        />
                        <Box className="absolute top-2 right-2 bg-black bg-opacity-80 text-white rounded px-2 py-1 flex items-center gap-1">
                          <span className="text-yellow-400">★</span>
                                <Typography variant="caption">{book.averageRating?.toFixed(1) || 'N/A'}</Typography>
                        </Box>
                      </Box>
                      <CardContent className="flex-1 flex flex-col justify-between">
                        <Box>
                          <Typography variant="subtitle1" className="font-semibold" noWrap>{book.title}</Typography>
                          <Typography variant="body2" color="text.secondary" noWrap>{book.author}</Typography>
                        </Box>
                        <Box className="flex gap-2 mt-3">
                          <Button
                            variant="contained"
                            size="small"
                            sx={{ borderRadius: 2 }}
                            component={Link}
                            to={`/books/${book._id}`}
                          >
                            View Details
                          </Button>
                        </Box>
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
    </Box>
  );
};

export default Browse; 