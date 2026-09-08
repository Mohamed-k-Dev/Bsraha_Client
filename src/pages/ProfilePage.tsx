import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Mail, ShieldCheck } from "lucide-react";

import { Avatar } from "@/components/Avatar";
import { MessageCard } from "@/components/MessageCard";
import { EmptyState } from "@/components/States";
import type { Message } from "@/types";
import { getUserProfileByDisplayName } from "@/api/user.api";
import { LoadingScreen } from "@/Ui/LoadingScreen";


export function ProfilePage() {
  const { displayName } = useParams<{ displayName: string }>();
  const { data, isLoading } = useQuery({
    queryKey: ["public-profile", displayName],
    queryFn: () => getUserProfileByDisplayName(displayName || ""),
    enabled: !!displayName,
  });
  const profile = data?.profile;
  const messages = data?.messages || [];

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!profile) {
    return (
      <EmptyState
        icon={<ShieldCheck className="h-8 w-8" />}
        title="User not found"
        description="This profile does not exist."
      />
    );
  }

  return (
    <div className="w-full lg:w-3/4 mx-auto px-5 sm:px-8 py-8 sm:py-12">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-12 text-center sm:text-left">
        <Avatar name={profile.displayName} seed={profile.userName} size="xl" />
        <div>
          <h1 className="font-display text-3xl font-bold text-ink-900">
            {profile.displayName.split("@")[0]}
          </h1>
          <p className="text-ink-500 font-mono mt-1">@{profile.userName}</p>

          <div className="mt-4">
            <button className="bg-ember-500 hover:bg-ember-600 text-white font-medium py-2 px-6 rounded-xl transition-colors shadow-sm">
              Send Anonymous Message
            </button>
          </div>
        </div>
      </div>

      <div className="mb-6 border-b border-ink-100 pb-2">
        <h2 className="font-display text-xl font-semibold text-ink-800">
          Public Responses
        </h2>
      </div>

      {messages.length === 0 ? (
        <EmptyState
          icon={<Mail className="h-8 w-8" />}
          title="No public messages"
          description={`${
            profile.displayName.split("@")[0]
          } hasn't published any messages yet.`}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {messages.map((m: Message) => (
            <MessageCard key={m._id} message={m} showActions={false} />
          ))}
        </div>
      )}
    </div>
  );
}
