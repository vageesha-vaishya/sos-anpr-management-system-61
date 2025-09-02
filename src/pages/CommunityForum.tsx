import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MessageSquare, 
  Heart, 
  Share2, 
  Reply, 
  Pin, 
  Flag, 
  Plus,
  Search,
  Filter,
  TrendingUp,
  Users,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  BarChart3
} from 'lucide-react';

const CommunityForum = () => {
  const [activeTab, setActiveTab] = useState('discussions');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Posts', count: 45 },
    { id: 'general', name: 'General Discussion', count: 12 },
    { id: 'maintenance', name: 'Maintenance', count: 8 },
    { id: 'events', name: 'Events & Social', count: 15 },
    { id: 'complaints', name: 'Complaints', count: 5 },
    { id: 'buy_sell', name: 'Buy/Sell/Rent', count: 10 },
    { id: 'notices', name: 'Official Notices', count: 3 }
  ];

  const discussions = [
    {
      id: 1,
      title: 'Proposal: New Gym Equipment Purchase',
      author: 'John Doe',
      authorUnit: 'A-301',
      avatar: '/placeholder-avatar.jpg',
      category: 'general',
      content: 'I propose we invest in new gym equipment for our fitness center. The current equipment is outdated and some machines are not working properly...',
      likes: 12,
      replies: 8,
      views: 45,
      isPinned: true,
      isHot: true,
      createdAt: '2 hours ago',
      tags: ['proposal', 'gym', 'equipment']
    },
    {
      id: 2,
      title: 'Water Supply Issue in Tower B',
      author: 'Jane Smith',
      authorUnit: 'B-205',
      avatar: '/placeholder-avatar.jpg',
      category: 'maintenance',
      content: 'Residents of Tower B are facing low water pressure issues for the past 3 days. Has anyone else noticed this? What can be done?',
      likes: 8,
      replies: 15,
      views: 78,
      isPinned: false,
      isHot: true,
      createdAt: '5 hours ago',
      tags: ['water', 'maintenance', 'tower-b']
    },
    {
      id: 3,
      title: 'Diwali Celebration Planning',
      author: 'Mike Wilson',
      authorUnit: 'C-104',
      avatar: '/placeholder-avatar.jpg',
      category: 'events',
      content: 'Its that time of the year again! Lets plan an amazing Diwali celebration for our community. Looking for volunteers and suggestions.',
      likes: 25,
      replies: 22,
      views: 120,
      isPinned: false,
      isHot: false,
      createdAt: '1 day ago',
      tags: ['diwali', 'celebration', 'volunteers']
    },
    {
      id: 4,
      title: 'Selling Second-hand Furniture',
      author: 'Sarah Davis',
      authorUnit: 'A-150',
      avatar: '/placeholder-avatar.jpg',
      category: 'buy_sell',
      content: 'Moving out next month. Selling dining table, sofa set, and wardrobe. All in excellent condition. DM for details and photos.',
      likes: 3,
      replies: 7,
      views: 34,
      isPinned: false,
      isHot: false,
      createdAt: '2 days ago',
      tags: ['furniture', 'selling', 'moving']
    }
  ];

  const polls = [
    {
      id: 1,
      title: 'Should we install CCTV cameras in the garden area?',
      description: 'For enhanced security and monitoring',
      options: [
        { id: 1, text: 'Yes, definitely needed', votes: 45, percentage: 65 },
        { id: 2, text: 'No, privacy concerns', votes: 12, percentage: 17 },
        { id: 3, text: 'Only during night hours', votes: 13, percentage: 18 }
      ],
      totalVotes: 70,
      endDate: '2024-12-10',
      status: 'active'
    },
    {
      id: 2,
      title: 'Preferred timing for society meetings',
      description: 'Help us schedule meetings at convenient times',
      options: [
        { id: 1, text: 'Weekday evening (6-8 PM)', votes: 28, percentage: 40 },
        { id: 2, text: 'Weekend morning (10 AM-12 PM)', votes: 35, percentage: 50 },
        { id: 3, text: 'Weekend evening (4-6 PM)', votes: 7, percentage: 10 }
      ],
      totalVotes: 70,
      endDate: '2024-12-15',
      status: 'active'
    }
  ];

  const getCategoryBadge = (category) => {
    const colors = {
      'general': 'default',
      'maintenance': 'destructive',
      'events': 'secondary',
      'complaints': 'destructive',
      'buy_sell': 'outline',
      'notices': 'default'
    };
    return <Badge variant={colors[category]}>{category.replace('_', '/')}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Community Forum</h1>
            <p className="text-muted-foreground">Connect and engage with your neighbors</p>
          </div>
          <div className="flex space-x-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Create Poll
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Poll</DialogTitle>
                  <DialogDescription>Get community opinion on important matters</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="poll-title">Poll Title</Label>
                    <Input id="poll-title" placeholder="Ask a question..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="poll-description">Description (Optional)</Label>
                    <Textarea id="poll-description" placeholder="Provide context for your poll" />
                  </div>
                  <div className="space-y-2">
                    <Label>Poll Options</Label>
                    <Input placeholder="Option 1" />
                    <Input placeholder="Option 2" />
                    <Button variant="outline" size="sm">Add Option</Button>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="poll-end">End Date</Label>
                    <Input id="poll-end" type="date" />
                  </div>
                  <Button className="w-full">Create Poll</Button>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Discussion
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Start New Discussion</DialogTitle>
                  <DialogDescription>Share your thoughts with the community</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" placeholder="What's on your mind?" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Discussion</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="events">Events & Social</SelectItem>
                        <SelectItem value="complaints">Complaints</SelectItem>
                        <SelectItem value="buy_sell">Buy/Sell/Rent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    <Textarea id="content" placeholder="Share your thoughts..." rows={4} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (comma separated)</Label>
                    <Input id="tags" placeholder="e.g., maintenance, urgent, proposal" />
                  </div>
                  <Button className="w-full">Post Discussion</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">245</div>
              <p className="text-xs text-muted-foreground">+12 this week</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89</div>
              <p className="text-xs text-muted-foreground">+5 this month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hot Topics</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">Trending now</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Polls</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Vote now</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "ghost"}
                    className="w-full justify-between"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <span>{category.name}</span>
                    <Badge variant="secondary" className="ml-2">{category.count}</Badge>
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Search className="h-4 w-4 mr-2" />
                  Search Posts
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter by Date
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList>
                <TabsTrigger value="discussions">Discussions</TabsTrigger>
                <TabsTrigger value="polls">Polls & Surveys</TabsTrigger>
                <TabsTrigger value="announcements">Announcements</TabsTrigger>
              </TabsList>

              <TabsContent value="discussions">
                <div className="space-y-4">
                  {discussions.map((post) => (
                    <Card key={post.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex space-x-4">
                          <Avatar>
                            <AvatarImage src={post.avatar} />
                            <AvatarFallback>{post.author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <h3 className="font-semibold text-lg">{post.title}</h3>
                                {post.isPinned && <Pin className="h-4 w-4 text-blue-500" />}
                                {post.isHot && <TrendingUp className="h-4 w-4 text-red-500" />}
                              </div>
                              <div className="flex items-center space-x-2">
                                {getCategoryBadge(post.category)}
                                <Button variant="ghost" size="sm">
                                  <Flag className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span>by {post.author} ({post.authorUnit})</span>
                              <span>•</span>
                              <span>{post.createdAt}</span>
                              <span>•</span>
                              <span>{post.views} views</span>
                            </div>
                            
                            <p className="text-muted-foreground">{post.content}</p>
                            
                            <div className="flex items-center space-x-2">
                              {post.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">#{tag}</Badge>
                              ))}
                            </div>
                            
                            <div className="flex items-center justify-between pt-4 border-t">
                              <div className="flex items-center space-x-4">
                                <Button variant="ghost" size="sm">
                                  <Heart className="h-4 w-4 mr-1" />
                                  {post.likes}
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Reply className="h-4 w-4 mr-1" />
                                  {post.replies}
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Share2 className="h-4 w-4 mr-1" />
                                  Share
                                </Button>
                              </div>
                              <Button variant="outline" size="sm">View Discussion</Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="polls">
                <div className="space-y-6">
                  {polls.map((poll) => (
                    <Card key={poll.id}>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">{poll.title}</h3>
                            <Badge>{poll.status}</Badge>
                          </div>
                          
                          <p className="text-muted-foreground">{poll.description}</p>
                          
                          <div className="space-y-3">
                            {poll.options.map((option) => (
                              <div key={option.id} className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <label className="flex items-center space-x-2 cursor-pointer">
                                    <input type="radio" name={`poll-${poll.id}`} className="radio" />
                                    <span>{option.text}</span>
                                  </label>
                                  <span className="text-sm text-muted-foreground">{option.votes} votes</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-primary h-2 rounded-full" 
                                    style={{ width: `${option.percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <div className="flex items-center justify-between pt-4 border-t">
                            <div className="text-sm text-muted-foreground">
                              {poll.totalVotes} total votes • Ends {poll.endDate}
                            </div>
                            <Button>Vote</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="announcements">
                <Card>
                  <CardHeader>
                    <CardTitle>Official Announcements</CardTitle>
                    <CardDescription>Important notices from management</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <p className="text-lg font-medium mb-2">No New Announcements</p>
                      <p className="text-muted-foreground">Official announcements will appear here</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityForum;