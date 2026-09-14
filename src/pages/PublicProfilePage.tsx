import { motion } from "motion/react";
import { 
  Mail, 
  Phone, 
  User as UserIcon, 
  Calendar, 
  MapPin, 
  MessageSquare,
  Image as ImageIcon,
  EyeOff
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { Avatar } from "@/components/Avatar";
import { MessageCard } from "@/components/MessageCard";
import { Spinner } from "@/components/ui";
import { EmptyState, ErrorState } from "@/components/States";
import { getMessages } from "@/api/messages.api"; 
// import { useAuth } from "@/hooks/useAuth"; // Adjust to how you get the logged-in user!
import { cn } from "@/utils";

export function PublicProfilePage() {
  // Replace this mock with your actual auth hook or user fetch query
  // const { user } = useAuth(); 
  const user = {
    _id: "u_123",
    displayName: "Sara Al-Mansoor",
    userName: "sara.design",
    email: "sara.design@example.com",
    phone: "+20 100 123 4567",
    gender: "Female",
    age: 26,
    bio: "Product Designer & Frontend Engineer. Obsessed with micro-interactions, neo-brutalist layouts, and making the web feel alive. 🎨✨",
    image: null,
    coverImages: [], // Add an image URL here to see the cover image
  };

  // Fetch the user's published messages (adjust query params based on your backend)
  const {
    data: messagesData,
    isLoading: messagesLoading,
    error: messagesError,
    refetch,
  } = useQuery({
    queryKey: ["my-published-messages"],
    queryFn: () => getMessages({ filter: "published", limit: 20 }), 
  });

  const publishedMessages = messagesData?.messages || [];
  const coverImage = user?.coverImages?.[0];

  return (
    <div className="min-h-screen bg-paper-50 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* --- 1. COVER IMAGE --- */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative w-full h-48 sm:h-72 lg:h-80 mt-4 sm:mt-8 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-sm bg-ink-900 border border-ink-100"
        >
          {coverImage ? (
            <img 
              src={coverImage} 
              alt="Cover" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-[linear-gradient(135deg,#1f1a13,#4b3f2f)] opacity-90 flex items-center justify-center">
              <ImageIcon className="h-12 w-12 text-ink-700/50" />
            </div>
          )}
          {/* Subtle gradient overlay to make header pop */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900/40 to-transparent" />
        </motion.div>

        {/* --- 2. CENTERED AVATAR --- */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 25 }}
          className="flex justify-center -mt-16 sm:-mt-20 relative z-10"
        >
          <div className="p-1.5 bg-paper-50 rounded-full shadow-sm">
            {/* Using your custom Avatar component */}
            <Avatar 
              name={user.displayName} 
              seed={user.userName} 
              size="2xl" 
              className="h-28 w-28 sm:h-36 sm:w-36 text-4xl shadow-inner border border-ink-100"
            />
          </div>
        </motion.div>

        {/* --- 3. PROFILE DETAILS (Bio & Names) --- */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mt-4 sm:mt-6 px-4"
        >
          <h1 className="font-display text-2xl sm:text-4xl font-bold text-ink-900 tracking-tight">
            {user.displayName}
          </h1>
          <p className="text-ink-400 font-mono text-sm sm:text-base mt-1">
            @{user.userName}
          </p>

          <p className="max-w-2xl mx-auto mt-5 text-ink-800 text-sm sm:text-[15px] leading-relaxed text-pretty">
            {user.bio || "This user hasn't written a bio yet, but they seem pretty cool."}
          </p>
        </motion.div>

        {/* --- 4. INFO PILLS (Email, Phone, Gender, Age) --- */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-3 mt-8 max-w-3xl mx-auto"
        >
          {user.email && (
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-ink-200 rounded-full shadow-sm text-sm font-medium text-ink-700">
              <Mail className="h-4 w-4 text-ink-400" />
              {user.email}
            </div>
          )}
          {user.phone && (
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-ink-200 rounded-full shadow-sm text-sm font-medium text-ink-700">
              <Phone className="h-4 w-4 text-ink-400" />
              {user.phone}
            </div>
          )}
          {user.gender && (
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-ink-200 rounded-full shadow-sm text-sm font-medium text-ink-700">
              <UserIcon className="h-4 w-4 text-ink-400" />
              {user.gender}
            </div>
          )}
          {user.age && (
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-ink-200 rounded-full shadow-sm text-sm font-medium text-ink-700">
              <Calendar className="h-4 w-4 text-ink-400" />
              {user.age} years old
            </div>
          )}
        </motion.div>

        {/* --- 5. PUBLISHED MESSAGES SECTION --- */}
        <div className="mt-16 sm:mt-20">
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="h-10 w-10 rounded-xl bg-ember-100 flex items-center justify-center text-ember-600 border border-ember-200">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-ink-900">
                Published Messages
              </h2>
              <p className="text-sm text-ink-400 font-mono mt-0.5">
                {publishedMessages.length} {publishedMessages.length === 1 ? 'entry' : 'entries'} available publicly
              </p>
            </div>
          </div>

          {messagesLoading ? (
            <div className="flex justify-center py-20">
              <Spinner size="lg" className="text-ember-500" />
            </div>
          ) : messagesError ? (
            <ErrorState
              message="Failed to load your published messages."
              onRetry={refetch}
            />
          ) : publishedMessages.length === 0 ? (
            <EmptyState
              icon={<EyeOff className="h-8 w-8" />}
              title="No Public Messages"
              description="You haven't published any messages to your profile yet."
              action={
                <Link to="/messages" className="btn bg-ink-900 text-white hover:bg-ink-800 rounded-xl px-6 py-2.5 shadow-sm text-sm font-medium transition-colors">
                  Go to Inbox
                </Link>
              }
              className="py-16 bg-white border border-ink-100 rounded-3xl shadow-sm"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {publishedMessages.map((msg: any, idx: number) => (
                <motion.div
                  key={msg._id || msg.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * (idx % 10) }}
                >
                  <MessageCard
                    message={msg}
                    onReact={() => {}} // Hook up your react logic here
                    onTogglePublish={() => {}} // Hook up your toggle publish logic here
                    linkable={true}
                    showActions={true}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}