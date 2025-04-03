
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Users, MessageCircle, Calendar, Leaf, ThumbsUp, MessageSquare, Share2 } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/components/auth/AuthModal';

// Mock data for community posts
const communityPosts = [
  {
    id: 1,
    author: "Jane Smith",
    role: "farmer",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=250&h=250&auto=format&fit=crop",
    time: "2 hours ago",
    content: "Just harvested my first batch of organic carrots this season! The yield was much better than expected given the recent weather conditions. Has anyone else had success with root vegetables this month?",
    likes: 24,
    comments: 8,
    topic: "Crop Management"
  },
  {
    id: 2,
    author: "Michael Johnson",
    role: "buyer",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=250&h=250&auto=format&fit=crop",
    time: "Yesterday",
    content: "Looking for suppliers of pesticide-free apples in the northwestern region. Willing to establish a long-term contract for our organic juice production facility. Please share contacts if you know anyone!",
    likes: 17,
    comments: 12,
    topic: "Market Opportunities"
  },
  {
    id: 3,
    author: "Sarah Williams",
    role: "farmer",
    avatar: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=250&h=250&auto=format&fit=crop",
    time: "3 days ago",
    content: "Anyone dealing with the new agricultural subsidy application process? I'm finding the documentation requirements confusing. Would love to chat with someone who's successfully navigated it.",
    likes: 32,
    comments: 21,
    topic: "Policy & Regulations"
  }
];

// Mock data for upcoming events
const upcomingEvents = [
  {
    id: 1,
    title: "Sustainable Farming Workshop",
    date: "June 15, 2025",
    time: "10:00 AM - 2:00 PM",
    location: "Green Valley Agricultural Center",
    description: "Learn innovative techniques for sustainable farming practices that can increase yields while preserving soil health.",
    attendees: 45
  },
  {
    id: 2,
    title: "Farmers Market Networking Event",
    date: "June 20, 2025",
    time: "9:00 AM - 12:00 PM",
    location: "Downtown Market Square",
    description: "Connect with local buyers and explore opportunities to sell your produce at farmers markets around the region.",
    attendees: 78
  },
  {
    id: 3,
    title: "Agricultural Technology Showcase",
    date: "July 5, 2025",
    time: "1:00 PM - 5:00 PM",
    location: "Tech Innovation Hub",
    description: "Discover the latest technological advancements in agriculture including IoT devices, drones, and AI-based farming solutions.",
    attendees: 120
  }
];

// Mock data for forum topics
const forumTopics = [
  {
    id: 1,
    title: "Best practices for crop rotation",
    category: "Farming Techniques",
    posts: 34,
    latestActivity: "1 hour ago"
  },
  {
    id: 2,
    title: "Dealing with unpredictable weather patterns",
    category: "Climate Adaptation",
    posts: 56,
    latestActivity: "3 hours ago"
  },
  {
    id: 3,
    title: "Negotiating fair prices with distributors",
    category: "Business",
    posts: 22,
    latestActivity: "Yesterday"
  },
  {
    id: 4,
    title: "Organic certification process guide",
    category: "Certification",
    posts: 48,
    latestActivity: "2 days ago"
  },
  {
    id: 5,
    title: "Water conservation techniques",
    category: "Sustainability",
    posts: 37,
    latestActivity: "3 days ago"
  }
];

const Community = () => {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    if (newPostContent.trim()) {
      // Here you would normally save the post to your database
      console.log("Posting:", newPostContent);
      setNewPostContent("");
    }
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-secondary to-background py-12">
        <div className="agri-container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="heading-2 mb-4">AgriConnect Community</h1>
            <p className="text-lg text-muted-foreground mb-6">
              Connect with farmers, buyers, and agricultural experts. Share knowledge, 
              find opportunities, and build relationships in our growing community.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button size="lg" className="gap-2">
                <Users size={16} />
                <span>Join Discussions</span>
              </Button>
              <Button size="lg" variant="outline" className="gap-2">
                <Calendar size={16} />
                <span>Upcoming Events</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="agri-container">
          <Tabs defaultValue="feed" className="w-full">
            <TabsList className="mb-8 mx-auto flex justify-center">
              <TabsTrigger value="feed" className="gap-2">
                <MessageCircle size={16} />
                <span>Community Feed</span>
              </TabsTrigger>
              <TabsTrigger value="forums" className="gap-2">
                <MessageSquare size={16} />
                <span>Discussion Forums</span>
              </TabsTrigger>
              <TabsTrigger value="events" className="gap-2">
                <Calendar size={16} />
                <span>Events</span>
              </TabsTrigger>
            </TabsList>

            {/* Community Feed Tab */}
            <TabsContent value="feed" className="space-y-8">
              {/* Post creation card */}
              <Card>
                <CardHeader>
                  <CardTitle>Share with the community</CardTitle>
                  <CardDescription>
                    Ask questions, share insights, or post updates about your agricultural journey
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePostSubmit}>
                    <Textarea 
                      placeholder="What's on your mind?" 
                      className="mb-4"
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                    />
                    <div className="flex justify-end">
                      <Button type="submit">
                        Post
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Community posts */}
              <div className="space-y-6">
                {communityPosts.map(post => (
                  <Card key={post.id}>
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={post.avatar} alt={post.author} />
                            <AvatarFallback>{post.author.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{post.author}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <span>{post.time}</span>
                              <span className="text-xs">•</span>
                              <Badge variant="outline" className="text-xs py-0 h-5">
                                {post.role}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Badge variant="secondary">{post.topic}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <p>{post.content}</p>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t pt-4">
                      <div className="flex gap-4">
                        <Button variant="ghost" size="sm" className="gap-1">
                          <ThumbsUp size={16} />
                          <span>{post.likes}</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-1">
                          <MessageSquare size={16} />
                          <span>{post.comments}</span>
                        </Button>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Share2 size={16} className="mr-1" />
                        Share
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Forums Tab */}
            <TabsContent value="forums" className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Discussion Forums</h2>
                <Button>Start New Topic</Button>
              </div>
              
              <div className="grid gap-4">
                {forumTopics.map(topic => (
                  <Card key={topic.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center p-6">
                      <div className="mr-4 bg-secondary rounded-full p-3">
                        <Leaf className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-medium">{topic.title}</h3>
                        <div className="text-sm text-muted-foreground">{topic.category}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{topic.posts} posts</div>
                        <div className="text-sm text-muted-foreground">Latest: {topic.latestActivity}</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Events Tab */}
            <TabsContent value="events" className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Upcoming Events</h2>
                <Button>Submit Event</Button>
              </div>
              
              <div className="grid gap-6 lg:grid-cols-2">
                {upcomingEvents.map(event => (
                  <Card key={event.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle>{event.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="space-y-3">
                        <div className="flex items-center text-sm">
                          <Calendar className="mr-2 h-4 w-4 text-primary" />
                          <span>{event.date} • {event.time}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <strong>Location:</strong> {event.location}
                        </div>
                        <p className="text-sm">{event.description}</p>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t pt-4">
                      <div className="text-sm text-muted-foreground">{event.attendees} attending</div>
                      <Button size="sm">RSVP</Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
      
      {showAuthModal && <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />}
    </div>
  );
};

export default Community;
