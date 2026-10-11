import React, { useState } from 'react';
import Card3DTilt from '../components/Card3DTilt';
import ProofOfWorkBadge from '../components/ProofOfWorkBadge';
import BorderBeam from '../components/BorderBeam';
import {
  Sparkles,
  Send,
  Code,
  Image as ImageIcon,
  Award,
  Share2,
  Bookmark,
  MessageSquare,
  ThumbsUp,
  Heart,
  Lightbulb,
  Rocket,
  Flame,
  CheckCircle,
  TrendingUp,
  Link,
  ShieldCheck,
  BarChart2,
  X,
  FileText,
  Smile,
  MoreHorizontal,
  Briefcase,
  ArrowRight
} from 'lucide-react';

export default function FeedView({
  posts,
  onNewPost,
  onPostsChange,
  onToggleSavePost,
  savedPostIds = [],
  currentUser
}) {
  const [postList, setPostList] = useState(posts);
  const [activeFilter, setActiveFilter] = useState('Top');

  // Keep postList synchronized with prop
  React.useEffect(() => {
    setPostList(posts);
  }, [posts]);

  const updatePostsAndSync = (updated) => {
    setPostList(updated);
    if (onPostsChange) {
      onPostsChange(updated);
    }
  };

  // Create Post Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [postType, setPostType] = useState('text'); // 'text' | 'image' | 'code' | 'poll'
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('rust');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['Option 1', 'Option 2']);
  const [selectedTag, setSelectedTag] = useState('');

  // Active Reaction Bar Hover
  const [hoveredPostId, setHoveredPostId] = useState(null);

  // Expanded Comments State
  const [expandedComments, setExpandedComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});

  // Repost Modal State
  const [repostModalPost, setRepostModalPost] = useState(null);
  const [repostThought, setRepostThought] = useState('');

  const REACTIONS = [
    { type: 'like', label: 'Like', icon: ThumbsUp, color: 'text-[#0A66C2]' },
    { type: 'celebrate', label: 'Celebrate', icon: Rocket, color: 'text-amber-500' },
    { type: 'support', label: 'Support', icon: Heart, color: 'text-rose-500' },
    { type: 'love', label: 'Love', icon: Flame, color: 'text-orange-500' },
    { type: 'insightful', label: 'Insightful', icon: Lightbulb, color: 'text-emerald-500' },
    { type: 'vouch', label: 'Vouch', icon: Award, color: 'text-indigo-500' }
  ];

  const handleOpenCreateModal = (type = 'text') => {
    setPostType(type);
    setIsCreateModalOpen(true);
  };

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!content.trim() && !imageUrl.trim() && !codeSnippet.trim() && !pollQuestion.trim()) return;

    const newPost = {
      id: `post_${Date.now()}`,
      author: {
        name: currentUser.name,
        handle: currentUser.handle || `@${currentUser.name.toLowerCase().replace(/\s+/g, '_')}`,
        role: currentUser.role,
        avatar: currentUser.avatar,
        workmarkScore: currentUser.workmarkScore || 950,
        verified: true
      },
      timestamp: 'Just now',
      content: content,
      imageUrl: imageUrl.trim() || undefined,
      codeBlock: codeSnippet.trim()
        ? { language: codeLanguage, code: codeSnippet }
        : undefined,
      poll: pollQuestion.trim()
        ? {
            question: pollQuestion,
            options: pollOptions.map((opt) => ({ text: opt, votes: 0 })),
            totalVotes: 0,
            userVotedIndex: null
          }
        : undefined,
      tags: selectedTag ? [selectedTag, 'ProofOfWork'] : ['Engineering', 'Architecture'],
      stats: {
        likes: 1,
        comments: 0,
        shares: 0,
        reactionCounts: { like: 1, celebrate: 0, support: 0, love: 0, insightful: 0, vouch: 0 }
      },
      userReaction: 'like',
      commentsList: []
    };

    const updated = [newPost, ...postList];
    updatePostsAndSync(updated);
    if (onNewPost) onNewPost(newPost);

    // Reset Form
    setContent('');
    setImageUrl('');
    setCodeSnippet('');
    setPollQuestion('');
    setPollOptions(['Option 1', 'Option 2']);
    setIsCreateModalOpen(false);
  };

  const handleReact = (postId, reactionType) => {
    const updated = postList.map((p) => {
      if (p.id === postId) {
        const currentReaction = p.userReaction;
        const isSameReaction = currentReaction === reactionType;
        const newReaction = isSameReaction ? null : reactionType;
        const counts = { ...(p.stats.reactionCounts || {}) };

        if (currentReaction && counts[currentReaction] > 0) {
          counts[currentReaction] -= 1;
        }
        if (newReaction) {
          counts[newReaction] = (counts[newReaction] || 0) + 1;
        }

        const totalLikes = Object.values(counts).reduce((a, b) => a + b, 0);

        return {
          ...p,
          userReaction: newReaction,
          stats: {
            ...p.stats,
            likes: totalLikes,
            reactionCounts: counts
          }
        };
      }
      return p;
    });

    updatePostsAndSync(updated);
  };

  const handleVotePoll = (postId, optIndex) => {
    const updated = postList.map((p) => {
      if (p.id === postId && p.poll) {
        if (p.poll.userVotedIndex !== null) return p;

        const updatedOptions = p.poll.options.map((opt, i) => {
          if (i === optIndex) return { ...opt, votes: opt.votes + 1 };
          return opt;
        });

        return {
          ...p,
          poll: {
            ...p.poll,
            options: updatedOptions,
            totalVotes: p.poll.totalVotes + 1,
            userVotedIndex: optIndex
          }
        };
      }
      return p;
    });

    updatePostsAndSync(updated);
  };

  const handleAddComment = (postId) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    const updated = postList.map((p) => {
      if (p.id === postId) {
        const newComment = {
          id: `c_${Date.now()}`,
          author: currentUser.name,
          avatar: currentUser.avatar,
          role: currentUser.role,
          text: text,
          timestamp: 'Just now'
        };
        return {
          ...p,
          stats: { ...p.stats, comments: p.stats.comments + 1 },
          commentsList: [...(p.commentsList || []), newComment]
        };
      }
      return p;
    });

    updatePostsAndSync(updated);
    setCommentInputs({ ...commentInputs, [postId]: '' });
  };

  const handleConfirmRepost = () => {
    if (!repostModalPost) return;

    const repostItem = {
      id: `post_${Date.now()}`,
      author: {
        name: currentUser.name,
        handle: currentUser.handle || `@${currentUser.name.toLowerCase().replace(/\s+/g, '_')}`,
        role: currentUser.role,
        avatar: currentUser.avatar,
        workmarkScore: currentUser.workmarkScore || 950,
        verified: true
      },
      timestamp: 'Just now',
      content: repostThought
        ? `${repostThought}\n\n[Reposted from ${repostModalPost.author.name}]:\n"${repostModalPost.content}"`
        : `Reposted from ${repostModalPost.author.name}:\n"${repostModalPost.content}"`,
      tags: ['Repost', 'Insight'],
      stats: {
        likes: 1,
        comments: 0,
        shares: 0,
        reactionCounts: { like: 1 }
      },
      userReaction: 'like',
      commentsList: []
    };

    const updated = [repostItem, ...postList];
    updatePostsAndSync(updated);
    if (onNewPost) onNewPost(repostItem);
    setRepostModalPost(null);
    setRepostThought('');
  };

  const displayedPosts = postList.filter((p) => {
    if (activeFilter === 'Saved') return savedPostIds.includes(p.id);
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Profile Card & Quick Navigation */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm overflow-hidden">
            <div className="relative -mx-5 -mt-5 h-20 overflow-hidden">
              <img src={currentUser.banner} alt="Cover" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
            </div>

            <div className="relative -mt-10 flex flex-col items-center text-center">
              <div className="relative">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-white dark:border-slate-900 shadow-lg"
                />
                {currentUser.isOpenToWork && (
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 absolute -bottom-0.5 -right-0.5" />
                )}
              </div>
              <h3 className="mt-2 text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                {currentUser.name}
                <ShieldCheck className="w-3.5 h-3.5 text-[#0A66C2]" />
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{currentUser.role}</p>

              <div className="w-full mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <ProofOfWorkBadge
                  score={currentUser.workmarkScore}
                  hash={currentUser.verifiedHash}
                  compact
                />
              </div>

              <div className="w-full divide-y divide-slate-100 dark:divide-slate-800 mt-4 text-xs text-left">
                <div className="py-2 flex items-center justify-between text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors">
                  <span>Profile viewers</span>
                  <span className="font-mono font-bold text-[#0A66C2]">1,420</span>
                </div>
                <div className="py-2 flex items-center justify-between text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors">
                  <span>Post impressions</span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">84.2k</span>
                </div>
              </div>
            </div>
          </div>

          {/* Feed Filter Shortcuts */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block px-2">
              Feed Filters
            </span>
            {[
              { id: 'Top', label: 'Top Signals & Proofs' },
              { id: 'Recent', label: 'Recent Discussions' },
              { id: 'Saved', label: `Saved Items (${savedPostIds.length})` }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeFilter === f.id
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-[#0A66C2] font-bold border border-blue-200 dark:border-blue-900'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Center Column: Start Post & Main Feed Stream */}
        <main className="lg:col-span-6 space-y-6">
          {/* Start a Post Card */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-10 h-10 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
              />
              <button
                onClick={() => handleOpenCreateModal('text')}
                className="flex-1 text-left px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 transition-all focus:outline-none"
              >
                Start a post, upload proof, or run a poll...
              </button>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => handleOpenCreateModal('image')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-[#0A66C2] text-xs font-medium transition-colors"
              >
                <ImageIcon className="w-4 h-4 text-[#0A66C2]" />
                <span className="hidden sm:inline">Photo</span>
              </button>

              <button
                onClick={() => handleOpenCreateModal('code')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600 text-xs font-medium transition-colors"
              >
                <Code className="w-4 h-4 text-indigo-500" />
                <span className="hidden sm:inline">Code / Artifact</span>
              </button>

              <button
                onClick={() => handleOpenCreateModal('poll')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-amber-600 text-xs font-medium transition-colors"
              >
                <BarChart2 className="w-4 h-4 text-amber-500" />
                <span className="hidden sm:inline">Create Poll</span>
              </button>
            </div>
          </div>

          {/* Posts Feed Stream */}
          <div className="space-y-6">
            {displayedPosts.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 font-mono text-xs">
                No posts found in this view.
              </div>
            ) : (
              displayedPosts.map((post) => {
                const isSaved = savedPostIds.includes(post.id);
                const isHovered = hoveredPostId === post.id;
                const commentsOpen = expandedComments[post.id];

                return (
                  <div
                    key={post.id}
                    className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm transition-all relative"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={post.author.avatar}
                          alt={post.author.name}
                          className="w-11 h-11 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white hover:text-[#0A66C2] transition-colors cursor-pointer">
                              {post.author.name}
                            </h4>
                            {post.author.verified && (
                              <ShieldCheck className="w-3.5 h-3.5 text-[#0A66C2]" />
                            )}
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-blue-50 dark:bg-blue-950/60 text-[#0A66C2] font-bold">
                              {post.author.workmarkScore} WM
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{post.author.role}</p>
                          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                            {post.timestamp}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onToggleSavePost(post.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isSaved ? 'text-[#0A66C2]' : 'text-slate-400 hover:text-slate-600'
                          }`}
                          title={isSaved ? 'Unsave post' : 'Save post'}
                        >
                          <Bookmark className="w-4 h-4 fill-current" />
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="mt-4 text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                      {post.content}
                    </div>

                    {/* Image Attachment (If Any) */}
                    {post.imageUrl && (
                      <div className="mt-4 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                        <img src={post.imageUrl} alt="Attached" className="w-full h-auto object-cover max-h-96" />
                      </div>
                    )}

                    {/* Code Snippet Block (If Any) */}
                    {post.codeBlock && (
                      <div className="mt-4 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 font-mono text-xs">
                        <div className="px-4 py-2 bg-slate-950 flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800">
                          <span className="uppercase text-cyan-400 font-bold">{post.codeBlock.language}</span>
                          <span>Verified Code Proof</span>
                        </div>
                        <pre className="p-4 text-slate-200 overflow-x-auto leading-relaxed">
                          <code>{post.codeBlock.code}</code>
                        </pre>
                      </div>
                    )}

                    {/* Poll Widget (If Any) */}
                    {post.poll && (
                      <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-750 space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <BarChart2 className="w-4 h-4 text-amber-500" />
                            {post.poll.question}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            {post.poll.totalVotes} votes
                          </span>
                        </div>

                        <div className="space-y-2">
                          {post.poll.options.map((opt, oIdx) => {
                            const isVoted = post.poll.userVotedIndex === oIdx;
                            const pct = post.poll.totalVotes > 0
                              ? Math.round((opt.votes / post.poll.totalVotes) * 100)
                              : 0;

                            return (
                              <button
                                key={oIdx}
                                onClick={() => handleVotePoll(post.id, oIdx)}
                                className={`w-full text-left p-3 rounded-xl text-xs relative overflow-hidden border transition-all ${
                                  isVoted
                                    ? 'border-[#0A66C2] bg-blue-50/60 dark:bg-blue-950/40 text-[#0A66C2] font-bold'
                                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-400 text-slate-800 dark:text-slate-200'
                                }`}
                              >
                                {post.poll.userVotedIndex !== null && (
                                  <div
                                    className="absolute inset-y-0 left-0 bg-blue-500/15 dark:bg-blue-400/20 transition-all duration-500"
                                    style={{ width: `${pct}%` }}
                                  />
                                )}
                                <div className="relative z-10 flex items-center justify-between">
                                  <span>{opt.text}</span>
                                  {post.poll.userVotedIndex !== null && (
                                    <span className="font-mono font-bold text-[11px]">{pct}%</span>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    {post.tags && (
                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {post.tags.map((t) => (
                          <span
                            key={t}
                            className="px-2.5 py-0.5 rounded-lg text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Stats summary */}
                    <div className="flex items-center justify-between mt-4 text-[11px] text-slate-500 font-mono pb-2 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-1">
                        <span className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-950 text-[#0A66C2] flex items-center justify-center text-[9px] font-bold">
                          👍
                        </span>
                        <span className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center text-[9px] font-bold">
                          🚀
                        </span>
                        <span>{post.stats.likes} reactions</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span>{post.stats.comments} comments</span>
                        <span>{post.stats.shares} reposts</span>
                      </div>
                    </div>

                    {/* Action Bar with Floating Reactions Popup */}
                    <div className="relative mt-2 pt-1 flex items-center justify-between">
                      {/* Floating Reaction Bar */}
                      {isHovered && (
                        <div
                          onMouseEnter={() => setHoveredPostId(post.id)}
                          onMouseLeave={() => setHoveredPostId(null)}
                          className="absolute -top-11 left-0 z-30 flex items-center gap-1.5 p-1.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl animate-fade-in"
                        >
                          {REACTIONS.map((r) => {
                            const RIcon = r.icon;
                            return (
                              <button
                                key={r.type}
                                onClick={() => handleReact(post.id, r.type)}
                                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 hover:scale-125 transition-all text-slate-600 dark:text-slate-300"
                                title={r.label}
                              >
                                <RIcon className={`w-4 h-4 ${r.color}`} />
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Main React Button */}
                      <button
                        onMouseEnter={() => setHoveredPostId(post.id)}
                        onClick={() => handleReact(post.id, 'like')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors ${
                          post.userReaction ? 'text-[#0A66C2]' : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span>{post.userReaction ? post.userReaction.toUpperCase() : 'Like'}</span>
                      </button>

                      {/* Comment Toggle Button */}
                      <button
                        onClick={() =>
                          setExpandedComments({
                            ...expandedComments,
                            [post.id]: !commentsOpen
                          })
                        }
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 text-xs font-semibold transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Comment</span>
                      </button>

                      {/* Repost Button */}
                      <button
                        onClick={() => setRepostModalPost(post)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 text-xs font-semibold transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>Repost</span>
                      </button>
                    </div>

                    {/* Comments Section */}
                    {commentsOpen && (
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={currentUser.avatar}
                            alt={currentUser.name}
                            className="w-7 h-7 rounded-lg object-cover"
                          />
                          <input
                            type="text"
                            placeholder="Add a comment with your technical insight..."
                            value={commentInputs[post.id] || ''}
                            onChange={(e) =>
                              setCommentInputs({ ...commentInputs, [post.id]: e.target.value })
                            }
                            onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                            className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-[#0A66C2]"
                          />
                          <button
                            onClick={() => handleAddComment(post.id)}
                            className="p-1.5 rounded-xl bg-[#0A66C2] text-white hover:bg-blue-700 transition-colors"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* List of comments */}
                        {post.commentsList && post.commentsList.length > 0 && (
                          <div className="space-y-2 pt-2">
                            {post.commentsList.map((comm) => (
                              <div key={comm.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-2.5 text-xs">
                                <img
                                  src={comm.avatar}
                                  alt={comm.author}
                                  className="w-7 h-7 rounded-lg object-cover shrink-0"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <h5 className="font-bold text-slate-900 dark:text-white">{comm.author}</h5>
                                    <span className="text-[10px] text-slate-400 font-mono">{comm.timestamp}</span>
                                  </div>
                                  <p className="text-slate-700 dark:text-slate-300 mt-1 leading-snug">{comm.text}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </main>

        {/* Right Column: Clean Executive Industry News & Career Opportunities */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-[#0A66C2]" />
              Workmark Daily Intelligence
            </h4>

            <div className="space-y-3.5">
              {[
                { title: 'Three.js 0.170 WebGPU Shaders Land', time: '1h ago', readers: '14,290 readers' },
                { title: 'Series B Funding for Spatial Computing', time: '3h ago', readers: '8,420 readers' },
                { title: 'Rust Distributed DB Cuts Latency 60%', time: '5h ago', readers: '21,800 readers' },
                { title: 'The End of Leetcode: Proof-of-Work Takes Over', time: '8h ago', readers: '43,100 readers' }
              ].map((news, idx) => (
                <div key={idx} className="cursor-pointer group">
                  <h5 className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-[#0A66C2] transition-colors leading-snug">
                    {news.title}
                  </h5>
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                    {news.time} · {news.readers}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Executive Roles Card */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Roles Recommended For You
            </h4>

            <div className="space-y-3 pt-1">
              {[
                { role: 'Staff Systems Architect', company: 'Nova Dynamics', salary: '$280k - $360k' },
                { role: 'Principal Neural Engineer', company: 'BrainLink Labs', salary: '$310k - $420k' }
              ].map((job, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">{job.role}</h5>
                  <div className="text-[11px] text-slate-500 font-medium">{job.company}</div>
                  <div className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    {job.salary}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* ===================== MODALS ===================== */}

      {/* Start Post Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-9 h-9 rounded-xl object-cover"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{currentUser.name}</h4>
                  <span className="text-[10px] text-[#0A66C2] font-mono">Post to Constellation (Public)</span>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-3 text-xs">
              <textarea
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What technical milestone or architectural insight are you broadcasting?"
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-[#0A66C2] leading-relaxed resize-none"
              />

              {/* Photo Input */}
              {postType === 'image' && (
                <div className="space-y-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Upload Photo / Diagram</label>
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 hover:border-[#0A66C2] text-[#0A66C2] font-bold text-xs flex items-center gap-2 shadow-sm">
                      <ImageIcon className="w-4 h-4" />
                      <span>Browse From Device</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => setImageUrl(event.target.result);
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    <span className="text-slate-400 text-[11px]">or paste direct image URL</span>
                  </div>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-[#0A66C2]"
                  />
                  {imageUrl && (
                    <div className="relative mt-2 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-48">
                      <img src={imageUrl} alt="Upload preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-900/80 text-white hover:bg-rose-600 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Code Snippet Input */}
              {postType === 'code' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-700 dark:text-slate-300 font-bold">Language</label>
                    <select
                      value={codeLanguage}
                      onChange={(e) => setCodeLanguage(e.target.value)}
                      className="px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-[11px]"
                    >
                      <option value="rust">Rust</option>
                      <option value="typescript">TypeScript</option>
                      <option value="glsl">GLSL / WebGPU</option>
                      <option value="python">Python</option>
                    </select>
                  </div>
                  <textarea
                    rows={4}
                    value={codeSnippet}
                    onChange={(e) => setCodeSnippet(e.target.value)}
                    placeholder="// Paste code deliverable..."
                    className="w-full p-3 font-mono rounded-xl bg-slate-900 text-cyan-300 text-xs outline-none"
                  />
                </div>
              )}

              {/* Poll Input */}
              {postType === 'poll' && (
                <div className="space-y-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-amber-200 dark:border-amber-900">
                  <label className="block text-slate-700 dark:text-slate-300 font-bold">Poll Question</label>
                  <input
                    type="text"
                    placeholder="e.g. Which rendering engine is best for WebXR?"
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                    className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-amber-500"
                  />

                  {pollOptions.map((opt, i) => (
                    <input
                      key={i}
                      type="text"
                      placeholder={`Option ${i + 1}`}
                      value={opt}
                      onChange={(e) => {
                        const copy = [...pollOptions];
                        copy[i] = e.target.value;
                        setPollOptions(copy);
                      }}
                      className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none text-xs"
                    />
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPostType('text')}
                    className={`p-2 rounded-xl ${postType === 'text' ? 'bg-blue-100 text-[#0A66C2]' : 'text-slate-500'}`}
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPostType('image')}
                    className={`p-2 rounded-xl ${postType === 'image' ? 'bg-blue-100 text-[#0A66C2]' : 'text-slate-500'}`}
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPostType('code')}
                    className={`p-2 rounded-xl ${postType === 'code' ? 'bg-blue-100 text-[#0A66C2]' : 'text-slate-500'}`}
                  >
                    <Code className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPostType('poll')}
                    className={`p-2 rounded-xl ${postType === 'poll' ? 'bg-amber-100 text-amber-600' : 'text-slate-500'}`}
                  >
                    <BarChart2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#0A66C2] hover:bg-blue-700 text-white font-bold transition-all shadow-md shadow-blue-500/20"
                  >
                    Post to Network
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Repost Modal */}
      {repostModalPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Repost to Your Network</h3>
              <button onClick={() => setRepostModalPost(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <textarea
              rows={3}
              value={repostThought}
              onChange={(e) => setRepostThought(e.target.value)}
              placeholder="Add your technical perspectives to this repost (optional)..."
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs outline-none focus:border-[#0A66C2]"
            />

            <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
              <span className="font-bold text-slate-900 dark:text-white">{repostModalPost.author.name}</span>
              <p className="text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">{repostModalPost.content}</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRepostModalPost(null)}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRepost}
                className="px-5 py-2 rounded-xl bg-[#0A66C2] text-white text-xs font-bold hover:bg-blue-700"
              >
                Repost Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
