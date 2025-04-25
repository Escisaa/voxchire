"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { deleteUserInterviews } from "@/lib/actions/general.action";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { useState } from "react";

const SettingsPage = () => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteHistory = async () => {
    try {
      setIsDeleting(true);
      const user = await getCurrentUser();

      if (!user?.id) {
        toast.error("User not found");
        return;
      }

      const success = await deleteUserInterviews(user.id);

      if (success) {
        toast.success("Interview history cleared successfully");
        router.push("/dashboard");
      } else {
        toast.error("Failed to clear interview history");
      }
    } catch (error) {
      toast.error("Failed to clear interview history");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-primary-100">Settings</h2>

      {/* Interview History */}
      <div className="card-border w-full">
        <div className="card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-primary-100">Interview History</h3>
            <Button
              onClick={handleDeleteHistory}
              disabled={isDeleting}
              className="btn-secondary flex items-center gap-2"
            >
              <Trash2 size={16} />
              {isDeleting ? "Clearing..." : "Clear History"}
            </Button>
          </div>
          <div className="space-y-4">
            <p className="text-light-100">
              Clear your interview history to remove all past interview sessions
              and feedback.
            </p>
            <div className="flex items-start gap-3 bg-dark-300 p-4 rounded-lg">
              <AlertTriangle size={20} className="text-destructive-100 mt-1" />
              <div>
                <p className="text-destructive-100 font-semibold">Warning</p>
                <p className="text-light-100 text-sm">
                  This action cannot be undone. All your interview records and
                  feedback will be permanently deleted.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
