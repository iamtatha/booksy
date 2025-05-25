import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Divider
} from '@mui/material';
import { 
  BookOpenIcon,
  UserIcon,
  BookmarkIcon,
  InformationCircleIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import { userApi } from '../services/api';
import { User } from '../types/user';
import Logo from '../components/Logo';

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
      id={`follow-tabpanel-${index}`}
      aria-labelledby={`follow-tab-${index}`}
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

const FollowList: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [tabValue, setTabValue] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [followStates, setFollowStates] = useState<{ [key: string]: boolean }>({});
  const [followLoading, setFollowLoading] = useState<{ [key: string]: boolean }>({});

  const navigation = [
    { name: 'Home', href: '/', icon: BookOpenIcon },
    { name: 'Browse', href: '/browse', icon: BookmarkIcon },
    { name: 'About', href: '/about', icon: BookOpenIcon },
  ];

  useEffect(() => {
    const fetchFollowData = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        setError(null);
        const userData = await userApi.getProfile(userId);
        
        if (!userData) {
          setError('User not found');
          return;
        }

        // Fetch detailed user information for followers and following
        const followersData = await Promise.all(
          (userData.followers || []).map((id: string) => userApi.getProfile(id))
        );
        const followingData = await Promise.all(
          (userData.following || []).map((id: string) => userApi.getProfile(id))
        );

        // Filter out null values and cast to User[]
        const validFollowers = followersData.filter((user): user is User => user !== null);
        const validFollowing = followingData.filter((user): user is User => user !== null);

        setFollowers(validFollowers);
        setFollowing(validFollowing);

        // Initialize follow states
        const states: { [key: string]: boolean } = {};
        [...validFollowers, ...validFollowing].forEach(user => {
          if (user && user._id) {
            states[user._id] = user.isFollowing || false;
          }
        });
        setFollowStates(states);
      } catch (err) {
        setError('Failed to load follow data');
        console.error('Error fetching follow data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowData();
  }, [userId]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleToggleFollow = async (targetUserId: string) => {
    try {
      setFollowLoading(prev => ({ ...prev, [targetUserId]: true }));
      const response = await userApi.toggleFollow(targetUserId);
      setFollowStates(prev => ({ ...prev, [targetUserId]: response.isFollowing }));
    } catch (err) {
      console.error('Error toggling follow:', err);
    } finally {
      setFollowLoading(prev => ({ ...prev, [targetUserId]: false }));
    }
  };

  const renderUserList = (users: User[]) => (
    <List>
      {users.map((user) => (
        <React.Fragment key={user._id}>
          <ListItem
            secondaryAction={
              user._id !== userId && (
                <Button
                  variant={followStates[user._id] ? "outlined" : "contained"}
                  color="primary"
                  onClick={() => handleToggleFollow(user._id)}
                  disabled={followLoading[user._id]}
                >
                  {followLoading[user._id] ? (
                    <CircularProgress size={24} />
                  ) : (
                    followStates[user._id] ? "Unfollow" : "Follow"
                  )}
                </Button>
              )
            }
          >
            <ListItemAvatar>
              <Link to={`/user/${user._id}`} style={{ textDecoration: 'none' }}>
                <Avatar src={user.profileImage}>
                  {user.username[0].toUpperCase()}
                </Avatar>
              </Link>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Link to={`/user/${user._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  {user.username}
                </Link>
              }
              secondary={`Joined ${new Date(user.createdAt).toLocaleDateString()}`}
            />
          </ListItem>
          <Divider component="li" />
        </React.Fragment>
      ))}
    </List>
  );

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

  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        minHeight: '100vh' 
      }}>
        <Box sx={{ flex: 1 }}>
          <Container maxWidth="md" sx={{ mt: 4 }}>
            <Alert severity="error">{error}</Alert>
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
      <Box sx={{ flex: 1 }}>
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Paper elevation={3}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="follow tabs"
                centered
              >
                <Tab label={`Followers (${followers.length})`} />
                <Tab label={`Following (${following.length})`} />
              </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
              {followers.length === 0 ? (
                <Typography variant="body1" color="text.secondary" textAlign="center">
                  No followers yet
                </Typography>
              ) : (
                renderUserList(followers)
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              {following.length === 0 ? (
                <Typography variant="body1" color="text.secondary" textAlign="center">
                  Not following anyone yet
                </Typography>
              ) : (
                renderUserList(following)
              )}
            </TabPanel>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default FollowList; 