import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, Vote, Trophy, Users, Timer, Search, Filter, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface VotingEntry {
  id: string;
  title: string;
  author: string;
  excerpt: string;
  fullContent: string;
  votes: number;
  category: string;
}

const VotingPage: React.FC = () => {
  const { toast } = useToast();
  
  const [votedEntries, setVotedEntries] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  const [entries] = useState<VotingEntry[]>([
    {
      id: '1',
      title: 'সন্ধ্যার আলো',
      author: 'রাহুল দাস',
      excerpt: 'সন্ধ্যার আলোয় মিশে যায় যে স্বপ্ন...',
      fullContent: 'সন্ধ্যার আলোয় মিশে যায় যে স্বপ্ন, তার রঙে রাঙানো এই মুহূর্তগুলো। প্রতিদিন সূর্যাস্তের সাথে হারিয়ে যাওয়া সেই আশাগুলো, আবার নতুন করে জন্ম নেয় পরের দিনের প্রভাতে।',
      votes: 142,
      category: 'কবিতা'
    },
    {
      id: '2',
      title: 'অসীম ভালোবাসা',
      author: 'প্রিয়া চক্রবর্তী',
      excerpt: 'অসীম এই ভালোবাসায় হারিয়ে যাই...',
      fullContent: 'অসীম এই ভালোবাসায় হারিয়ে যাই আমি, খুঁজে পাই না ফেরার পথ। মনের গহীনে লুকিয়ে রাখা সেই অনুভূতিগুলো যেন অন্ধকারে জ্বলে ওঠা মোমবাতির মতো।',
      votes: 98,
      category: 'গদ্য'
    },
    {
      id: '3',
      title: 'মনের কোণে',
      author: 'অর্জুন সেন',
      excerpt: 'মনের কোণে লুকিয়ে থাকা সেই কথা...',
      fullContent: 'মনের কোণে লুকিয়ে থাকা সেই কথাগুলো, যা কখনো বলা হয়নি। নীরবতার আড়ালে চাপা পড়ে থাকা আবেগের স্রোত, যা একদিন বের হয়ে আসবে প্রবল বেগে।',
      votes: 176,
      category: 'কবিতা'
    },
    {
      id: '4',
      title: 'নীরব সন্ধ্যা',
      author: 'সুমিতা রায়',
      excerpt: 'নীরব সন্ধ্যার বুকে জমে থাকা আবেগ...',
      fullContent: 'নীরব সন্ধ্যার বুকে জমে থাকা আবেগের ঝড়, যা কখনো প্রকাশ পায় না। চুপচাপ বসে থাকা জানালার পাশে, দেখি দূরের আকাশে উড়ে যাওয়া পাখিদের।',
      votes: 203,
      category: 'গল্প'
    },
    {
      id: '5',
      title: 'স্বপ্নের পাখি',
      author: 'কৌশিক মুখার্জী',
      excerpt: 'স্বপ্নের পাখি উড়ে যায় দূর আকাশে...',
      fullContent: 'স্বপ্নের পাখি উড়ে যায় দূর আকাশে, রেখে যায় শুধু স্মৃতির ছাপ। রাতের নীরবতায় শোনা যায় তার ডানার শব্দ, যা হৃদয়ে তোলে অব্যক্ত বেদনা।',
      votes: 89,
      category: 'কবিতা'
    },
    {
      id: '6',
      title: 'বৃষ্টির গান',
      author: 'অনন্যা ঘোষ',
      excerpt: 'বৃষ্টির গানে মিশে যাওয়া সুরের মায়া...',
      fullContent: 'বৃষ্টির গানে মিশে যাওয়া সুরের মায়া, যা মনকে করে তোলে উদাস। প্রতিটি ফোঁটায় লুকিয়ে আছে অসংখ্য গল্প, যা শুধু হৃদয়ের কান পারে শুনতে।',
      votes: 134,
      category: 'গদ্য'
    },
    {
      id: '7',
      title: 'অন্ধকারের আলো',
      author: 'তানভীর হাসান',
      excerpt: 'অন্ধকারের মাঝেও খোঁজ করি আলোর...',
      fullContent: 'অন্ধকারের মাঝেও খোঁজ করি আলোর, যা হয়তো লুকিয়ে আছে কোথাও। জীবনের প্রতিটি বাঁকে আশার রশ্মি খুঁজে নিতে হয়, যা দেখায় সামনের পথ।',
      votes: 156,
      category: 'কবিতা'
    },
    {
      id: '8',
      title: 'সময়ের গল্প',
      author: 'রিমা বেগম',
      excerpt: 'সময় বয়ে চলে নিরন্তর...',
      fullContent: 'সময় বয়ে চলে নিরন্তর, থেমে থাকে না কারো জন্য। প্রতিটি মুহূর্ত নিয়ে আসে নতুন সম্ভাবনা, নতুন আশা আর নতুন স্বপ্নের বীজ।',
      votes: 78,
      category: 'গদ্য'
    }
  ]);

  const handleVote = (entryId: string) => {
    if (votedEntries.has(entryId)) {
      toast({
        title: "ইতিমধ্যে ভোট দেওয়া হয়েছে",
        description: "আপনি এই রচনায় ইতিমধ্যে ভোট দিয়েছেন।",
        variant: "destructive"
      });
      return;
    }

    setVotedEntries(prev => new Set(prev).add(entryId));
    
    toast({
      title: "ভোট সফল!",
      description: "আপনার ভোট সফলভাবে জমা দেওয়া হয়েছে।",
    });
  };

  const categories = ['কবিতা', 'গদ্য', 'গল্প'];
  
  const filteredEntries = entries
    .filter(entry => 
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(entry => !selectedCategory || entry.category === selectedCategory)
    .sort((a, b) => b.votes - a.votes);

  const totalVotes = entries.reduce((sum, entry) => sum + entry.votes, 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-20">
        {/* Header */}
        <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <Link 
                to="/" 
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
              >
                <ArrowLeft className="h-4 w-4" />
                হোমে ফিরে যান
              </Link>
              
              <div className="flex items-center justify-center gap-3 mb-6">
                <Trophy className="h-8 w-8 text-primary" />
                <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                  অণুতে অনন্ত - সম্পূর্ণ তালিকা
                </h1>
                <Trophy className="h-8 w-8 text-primary" />
              </div>
              
              <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                আমাদের সাহিত্য প্রতিযোগিতায় অংশগ্রহণকারী সকল রচনা দেখুন এবং আপনার পছন্দের রচনায় ভোট দিন
              </p>

              {/* Competition Stats */}
              <div className="flex justify-center gap-8 mb-8">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-5 w-5" />
                  <span>{entries.length} টি রচনা</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Vote className="h-5 w-5" />
                  <span>{totalVotes} টি ভোট</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Timer className="h-5 w-5" />
                  <span>৫ দিন বাকি</span>
                </div>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="max-w-2xl mx-auto grid gap-4 md:grid-cols-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="রচনা, লেখক অথবা বিষয়বস্তু খুঁজুন..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="বিভাগ নির্বাচন করুন" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">সকল বিভাগ</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Voting Cards */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid gap-6">
              {filteredEntries.map((entry, index) => (
                <Card 
                  key={entry.id}
                  className="group hover:shadow-elegant transition-all duration-500 border-border/50 hover:border-primary/20"
                  style={{ 
                    background: index === 0 ? 'linear-gradient(135deg, hsl(var(--primary))/5%, transparent)' : undefined
                  }}
                >
                  <CardContent className="p-6 md:p-8">
                    <div className="flex flex-col lg:flex-row gap-6 items-start">
                      {/* Rank Badge */}
                      <div className="flex-shrink-0">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                          index === 0 ? 'bg-primary text-primary-foreground' :
                          index === 1 ? 'bg-secondary text-secondary-foreground' :
                          index === 2 ? 'bg-accent text-accent-foreground' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {index + 1}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                          <div>
                            <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                              {entry.title}
                            </h3>
                            <p className="text-muted-foreground mb-2">লেখক: {entry.author}</p>
                            <Badge variant="secondary" className="text-xs">
                              {entry.category}
                            </Badge>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-2xl font-bold text-foreground mb-1">
                              {entry.votes}
                            </div>
                            <div className="text-sm text-muted-foreground">ভোট</div>
                          </div>
                        </div>

                        <div className="prose prose-sm max-w-none mb-6">
                          <p className="text-muted-foreground leading-relaxed">
                            {entry.fullContent}
                          </p>
                        </div>

                        {/* Vote Button */}
                        <Button
                          onClick={() => handleVote(entry.id)}
                          disabled={votedEntries.has(entry.id)}
                          className={`group/btn transition-all duration-300 ${
                            votedEntries.has(entry.id) 
                              ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                              : 'hover:scale-105 hover:shadow-lg'
                          }`}
                          size="sm"
                        >
                          <Heart className={`h-4 w-4 mr-2 transition-all duration-300 ${
                            votedEntries.has(entry.id) 
                              ? 'fill-current text-red-500' 
                              : 'group-hover/btn:fill-current group-hover/btn:text-red-500'
                          }`} />
                          {votedEntries.has(entry.id) ? 'ভোট দেওয়া হয়েছে' : 'ভোট দিন'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredEntries.length === 0 && (
              <div className="text-center py-16">
                <p className="text-xl text-muted-foreground">কোনো রচনা পাওয়া যায়নি।</p>
                <p className="text-muted-foreground mt-2">অন্য কিছু খুঁজে দেখুন।</p>
              </div>
            )}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default VotingPage;