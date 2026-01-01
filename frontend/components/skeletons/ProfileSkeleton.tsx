import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ProfileSkeleton = () => {
  return (
    <div className="flex justify-center min-h-screen items-center">
      <Card className="w-full max-w-md p-6 space-y-6">

        {/* Avatar */}
        <Skeleton className="w-28 h-28 rounded-full mx-auto" />

        {/* Name */}
        <Skeleton className="h-5 w-1/2 mx-auto" />

        {/* Bio */}
        <Skeleton className="h-4 w-3/4 mx-auto" />

        {/* Social Icons */}
        <div className="flex justify-center gap-4">
          <Skeleton className="w-6 h-6 rounded-full" />
          <Skeleton className="w-6 h-6 rounded-full" />
          <Skeleton className="w-6 h-6 rounded-full" />
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <Skeleton className="h-9 w-full rounded-md" />
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
      </Card>
    </div>
  );
};

export default ProfileSkeleton;
