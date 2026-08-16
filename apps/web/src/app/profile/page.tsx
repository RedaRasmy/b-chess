'use client';
import GameHistory from '@/features/profile/components/game-history';
import ProfileHeader from '@/features/profile/components/profile-header';
import { useUser } from '@/features/profile/hooks/use-user';

export default function Page() {
    const { user, stats } = useUser();

    return (
        <div className="flex flex-col items-center overflow-auto gap-3 lg:gap-5 py-2 lg:py-4">
            <ProfileHeader username={user.username} stats={stats} avatar={user.image} />
            <GameHistory />
        </div>
    );
}
