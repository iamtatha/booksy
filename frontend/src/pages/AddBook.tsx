import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  Paper,
  Grid,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  CircularProgress,
} from '@mui/material';
import { BookOpenIcon, BookmarkIcon, UserIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { AccountCircle } from '@mui/icons-material';
import { bookApi, userApi, API_URL } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../types/user';
import Logo from '../components/Logo';
import Footer from '../components/Footer';

const navigation = [
  { name: 'Home', href: '/', icon: BookOpenIcon },
  { name: 'Browse', href: '/browse', icon: BookmarkIcon },
  { name: 'About', href: '/about', icon: BookOpenIcon },
  { name: 'Profile', href: '/profile', icon: UserIcon },
];

const AddBook: React.FC = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: '',
    author: '',
    description: '',
    coverImage: '',
    publisher: '',
    publishedDate: '',
    language: '',
    edition: '',
    pageCount: '',
    amazonLink: '',
    isbn: '',
    genre: '',
    category: '',
    role: '',
  });

  // Add states for user search
  const [authorSearchQuery, setAuthorSearchQuery] = useState('');
  const [publisherSearchQuery, setPublisherSearchQuery] = useState('');
  const [authorSearchResults, setAuthorSearchResults] = useState<User[]>([]);
  const [publisherSearchResults, setPublisherSearchResults] = useState<User[]>([]);
  const [showAuthorDropdown, setShowAuthorDropdown] = useState(false);
  const [showPublisherDropdown, setShowPublisherDropdown] = useState(false);
  const [isSearchingAuthor, setIsSearchingAuthor] = useState(false);
  const [isSearchingPublisher, setIsSearchingPublisher] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState<User | null>(null);
  const [selectedPublisher, setSelectedPublisher] = useState<User | null>(null);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle author search
  const handleAuthorSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAuthorSearchQuery(value);
    setForm(prev => ({ ...prev, author: value }));

    if (!value.trim()) {
      setAuthorSearchResults([]);
      setShowAuthorDropdown(false);
      return;
    }

    try {
      setIsSearchingAuthor(true);
      const results = await userApi.searchUsers(value);
      setAuthorSearchResults(results);
      setShowAuthorDropdown(true);
    } catch (error) {
      console.error('Author search error:', error);
    } finally {
      setIsSearchingAuthor(false);
    }
  };

  // Handle publisher search
  const handlePublisherSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPublisherSearchQuery(value);
    setForm(prev => ({ ...prev, publisher: value }));

    if (!value.trim()) {
      setPublisherSearchResults([]);
      setShowPublisherDropdown(false);
      return;
    }

    try {
      setIsSearchingPublisher(true);
      const results = await userApi.searchUsers(value);
      setPublisherSearchResults(results);
      setShowPublisherDropdown(true);
    } catch (error) {
      console.error('Publisher search error:', error);
    } finally {
      setIsSearchingPublisher(false);
    }
  };

  // Handle author selection
  const handleAuthorSelect = (user: User) => {
    setSelectedAuthor(user);
    setAuthorSearchQuery(user.name);
    setShowAuthorDropdown(false);
  };

  // Handle publisher selection
  const handlePublisherSelect = (user: User) => {
    setSelectedPublisher(user);
    setPublisherSearchQuery(user.name);
    setShowPublisherDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.role) {
      setError('Please specify whether you are the author or publisher.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const newBook = {
        title: form.title,
        author: form.author,
        author_username: selectedAuthor?.username || (form.role === 'author' ? user?.username || '' : ''),
        description: form.description,
        coverImage: form.coverImage,
        averageRating: 0,
        totalReviews: 0,
        publisher: form.publisher,
        publisher_username: selectedPublisher?.username || (form.role === 'publisher' ? user?.username || '' : ''),
        publishedDate: form.publishedDate,
        language: form.language,
        edition: form.edition,
        pageCount: Number(form.pageCount),
        amazonLink: form.amazonLink,
        isbn: form.isbn,
        genre: form.genre.split(',').map(g => g.trim()).filter(Boolean),
        category: form.category,
        listed_by_username: form.role === 'none' ? user?.username || '' : '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await bookApi.createBook(newBook);
      setSuccess('Book added successfully!');
      setTimeout(() => navigate('/profile'), 1500);
    } catch (err) {
      setError('Failed to add book.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      minHeight: '100vh', 
      bgcolor: '#f6f8fa' 
    }}>
      {/* Navbar */}
      <nav className="bg-white shadow-sm" style={{ marginBottom: 32 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 64 }}>
          <div className="flex-shrink-0 flex items-center">
                <Logo />
              </div>
            <Box sx={{ display: 'flex', gap: 3 }}>
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    color: '#64748b',
                    textDecoration: 'none',
                    fontWeight: 500,
                    fontSize: 16,
                    padding: '6px 16px',
                    borderRadius: 8,
                    transition: 'background 0.2s, color 0.2s',
                  }}
                  className="hover:bg-gray-100 hover:text-gray-900"
                >
                  <item.icon className="h-5 w-5 mr-1.5" />
                  {item.name}
                </Link>
              ))}
            </Box>
          </Box>
        </Container>
      </nav>

      {/* Main Content */}
      <Box sx={{ flex: 1 }}>
        <Container maxWidth="sm" sx={{ py: 6 }}>
          <Paper elevation={4} sx={{ p: 5, borderRadius: 4, boxShadow: '0 4px 24px rgba(30,41,59,0.08)' }}>
            <Typography variant="h4" fontWeight={700} gutterBottom align="center" sx={{ mb: 3 }}>
              Add a New Book
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" align="center" sx={{ mb: 4 }}>
              Fill in the details below to add a new book to the collection.
            </Typography>
            <FormControl component="fieldset" required sx={{ mb: 3 }}>
              <FormLabel component="legend">Are you the author or the publisher of this book?</FormLabel>
              <RadioGroup
                row
                name="role"
                value={form.role}
                onChange={handleChange}
              >
                <FormControlLabel value="author" control={<Radio />} label="Author" />
                <FormControlLabel value="publisher" control={<Radio />} label="Publisher" />
                <FormControlLabel value="none" control={<Radio />} label="None" />
              </RadioGroup>
            </FormControl>
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Title"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    required
                    fullWidth
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ position: 'relative' }}>
                    <TextField
                      label="Author"
                      name="author"
                      value={authorSearchQuery}
                      onChange={handleAuthorSearchChange}
                      required
                      fullWidth
                      variant="outlined"
                      InputProps={{
                        endAdornment: isSearchingAuthor && <CircularProgress size={20} />,
                      }}
                    />
                    {showAuthorDropdown && authorSearchResults.length > 0 && (
                      <Paper
                        sx={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          mt: 1,
                          maxHeight: 200,
                          overflow: 'auto',
                          zIndex: 1000,
                          boxShadow: 3,
                        }}
                      >
                        <List>
                          {authorSearchResults.map((user) => (
                            <ListItem
                              key={user._id || user.id}
                              button
                              onClick={() => handleAuthorSelect(user)}
                            >
                              <ListItemAvatar>
                                <Avatar src={user.profileImage}>
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
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    required
                    fullWidth
                    multiline
                    minRows={3}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Cover Image URL"
                    name="coverImage"
                    value={form.coverImage}
                    onChange={handleChange}
                    required
                    fullWidth
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ position: 'relative' }}>
                    <TextField
                      label="Publisher"
                      name="publisher"
                      value={publisherSearchQuery}
                      onChange={handlePublisherSearchChange}
                      required
                      fullWidth
                      variant="outlined"
                      InputProps={{
                        endAdornment: isSearchingPublisher && <CircularProgress size={20} />,
                      }}
                    />
                    {showPublisherDropdown && publisherSearchResults.length > 0 && (
                      <Paper
                        sx={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          mt: 1,
                          maxHeight: 200,
                          overflow: 'auto',
                          zIndex: 1000,
                          boxShadow: 3,
                        }}
                      >
                        <List>
                          {publisherSearchResults.map((user) => (
                            <ListItem
                              key={user._id || user.id}
                              button
                              onClick={() => handlePublisherSelect(user)}
                            >
                              <ListItemAvatar>
                                <Avatar src={user.profileImage}>
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
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Published Date"
                    name="publishedDate"
                    type="date"
                    value={form.publishedDate}
                    onChange={handleChange}
                    required
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Language"
                    name="language"
                    value={form.language}
                    onChange={handleChange}
                    required
                    fullWidth
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Edition"
                    name="edition"
                    value={form.edition}
                    onChange={handleChange}
                    required
                    fullWidth
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Page Count"
                    name="pageCount"
                    type="number"
                    value={form.pageCount}
                    onChange={handleChange}
                    required
                    fullWidth
                    inputProps={{ min: 1 }}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Amazon Link"
                    name="amazonLink"
                    value={form.amazonLink}
                    onChange={handleChange}
                    required
                    fullWidth
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="ISBN"
                    name="isbn"
                    value={form.isbn}
                    onChange={handleChange}
                    required
                    fullWidth
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Genre (comma separated)"
                    name="genre"
                    value={form.genre}
                    onChange={handleChange}
                    required
                    fullWidth
                    variant="outlined"
                    helperText="e.g. Fantasy, Adventure, Romance"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    select
                    label="Category"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    required
                    fullWidth
                    variant="outlined"
                    SelectProps={{ native: true }}
                  >
                    <option value="">Select Category</option>
                    <option value="Fiction">Fiction</option>
                    <option value="Non-Fiction">Non-Fiction</option>
                    <option value="Educational">Educational</option>
                    <option value="Biography">Biography</option>
                    <option value="Science">Science</option>
                    <option value="Technology">Technology</option>
                    <option value="Other">Other</option>
                  </TextField>
                </Grid>
              </Grid>
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <Button type="submit" variant="contained" color="primary" size="large" disabled={loading} sx={{ px: 5, py: 1.5, fontWeight: 600, borderRadius: 2, fontSize: 18 }}>
                  {loading ? 'Adding...' : 'Add Book'}
                </Button>
              </Box>
              {success && <Alert severity="success" sx={{ mt: 3 }}>{success}</Alert>}
              {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}
            </Box>
          </Paper>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};

export default AddBook; 