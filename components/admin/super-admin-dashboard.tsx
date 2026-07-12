"use client";

import { useState } from "react";
import {
  Search,
  ShieldAlert,
  CheckCircle,
  XCircle,
  RefreshCw,
  Key,
  ShieldCheck,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import {
  toggleClubStatusAction,
  updateUserRoleAction,
  resetUserPasswordAction,
} from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type UserDetail = {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    displayName: string;
    email: string;
    phone?: string | null;
    createdAt: Date | string;
  };
  role: {
    slug: string;
    label: string;
  };
  studentProfile?: {
    studentId: string;
    department: string;
  } | null;
  clubAdminProfile?: {
    designation: string;
  } | null;
  club?: {
    id: string;
    name: string;
  } | null;
};

type ClubDetail = {
  club: {
    id: string;
    slug: string;
    name: string;
    focus: string;
    icon: string;
    isActive: boolean;
  };
  adminCount: number;
};

type SuperAdminDashboardProps = {
  usersList: UserDetail[];
  clubsList: ClubDetail[];
  analytics: {
    totalClubs: number;
    activeClubs: number;
    totalStudents: number;
    totalAdmins: number;
    totalSuperAdmins: number;
    totalEvents: number;
    publishedEvents: number;
    upcomingEvents: number;
    totalRegistrations: number;
  };
};

export function SuperAdminDashboard({ usersList, clubsList, analytics }: SuperAdminDashboardProps) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("clubs");

  // User Actions States
  const [selectedUser, setSelectedUser] = useState<UserDetail["user"] | null>(null);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter lists
  const filteredClubs = clubsList.filter(
    ({ club }) =>
      club.name.toLowerCase().includes(search.toLowerCase()) ||
      club.focus.toLowerCase().includes(search.toLowerCase()),
  );

  const filteredUsers = usersList.filter(
    ({ user, role }) =>
      user.displayName.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      role.label.toLowerCase().includes(search.toLowerCase()),
  );

  const handleToggleClubStatus = async (clubId: string, currentStatus: boolean, name: string) => {
    const actionText = currentStatus ? "deactivate" : "activate";
    if (confirm(`Are you sure you want to ${actionText} the club "${name}"?`)) {
      try {
        const res = await toggleClubStatusAction(clubId, !currentStatus);
        if (res.success) {
          toast.success(
            `Club "${name}" ${currentStatus ? "deactivated" : "activated"} successfully.`,
          );
        } else {
          toast.error(res.error || "Failed to update club status.");
        }
      } catch {
        toast.error("Failed to perform action.");
      }
    }
  };

  const handleRoleChange = async (userId: string, targetRole: string, name: string) => {
    try {
      const res = await updateUserRoleAction(userId, targetRole);
      if (res.success) {
        toast.success(`Role for ${name} updated to "${targetRole}".`);
      } else {
        toast.error(res.error || "Failed to update role.");
      }
    } catch {
      toast.error("Failed to update user role.");
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    if (newPassword.length < 12) {
      toast.error("Password must be at least 12 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await resetUserPasswordAction(selectedUser.id, newPassword);
      if (res.success) {
        toast.success(`Password for ${selectedUser.displayName} has been reset.`);
        setIsResetOpen(false);
        setNewPassword("");
      } else {
        toast.error(res.error || "Failed to reset password.");
      }
    } catch {
      toast.error("Failed to reset password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-black">System Governance</h1>
        <p className="text-sm text-black/60 mt-0.5">
          Manage users, adjust role privileges, toggle club operations, and monitor system metrics.
        </p>
      </div>

      {/* Analytics widgets */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Clubs",
            value: `${analytics.activeClubs} / ${analytics.totalClubs} Active`,
            icon: ShieldCheck,
            desc: "Onboarded student clubs",
          },
          {
            label: "Students",
            value: analytics.totalStudents,
            icon: Users,
            desc: "Registered portal accounts",
          },
          {
            label: "Club Administrators",
            value: analytics.totalAdmins,
            icon: ShieldAlert,
            desc: "Club moderators",
          },
          {
            label: "Registrations",
            value: analytics.totalRegistrations,
            icon: RefreshCw,
            desc: "Event application logs",
          },
        ].map((stat) => (
          <Card
            key={stat.label}
            className="rounded-3xl border-black/10 bg-white/80 shadow-sm p-5 space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-black/45 uppercase tracking-wider font-semibold">
                {stat.label}
              </span>
              <stat.icon className="size-4 text-black/35" />
            </div>
            <p className="text-2xl font-semibold text-black tracking-tight mt-1">{stat.value}</p>
            <p className="text-[10px] text-black/40 mt-0.5">{stat.desc}</p>
          </Card>
        ))}
      </div>

      {/* Administration controls */}
      <Tabs
        defaultValue="clubs"
        value={activeTab}
        onValueChange={(v) => {
          setActiveTab(v);
          setSearch("");
        }}
        className="space-y-4"
      >
        <TabsList className="bg-black/5 border border-black/5 rounded-full p-1 h-auto inline-flex">
          <TabsTrigger
            value="clubs"
            className="rounded-full px-5 py-2 text-sm data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm"
          >
            Clubs Directory ({filteredClubs.length})
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className="rounded-full px-5 py-2 text-sm data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm"
          >
            User Accounts ({filteredUsers.length})
          </TabsTrigger>
        </TabsList>

        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-black/40" />
          <Input
            type="text"
            placeholder={
              activeTab === "clubs"
                ? "Search clubs by name or focus..."
                : "Search user name, email, or role..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 rounded-2xl border-black/10 bg-white"
          />
        </div>

        {/* Tab 1: Clubs Dashboard */}
        <TabsContent value="clubs">
          <Card className="paper-card border-black/10 bg-white/80 overflow-hidden shadow-none p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-black/[0.02]">
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Club Name</TableHead>
                    <TableHead>Focus area & category</TableHead>
                    <TableHead>Admins linked</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClubs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-black/40">
                        No clubs found matching search.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredClubs.map(({ club, adminCount }) => (
                      <TableRow key={club.id} className="hover:bg-black/[0.01]">
                        <TableCell className="text-center text-lg select-none">
                          {club.icon}
                        </TableCell>
                        <TableCell className="font-semibold text-black">{club.name}</TableCell>
                        <TableCell className="text-xs text-black/60 leading-relaxed">
                          <p className="font-medium text-black">{club.focus}</p>
                          <p className="text-[10px] text-black/40 mt-0.5">{club.slug}</p>
                        </TableCell>
                        <TableCell className="text-xs text-black/60 font-mono">
                          {adminCount} accounts
                        </TableCell>
                        <TableCell>
                          {club.isActive ? (
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 rounded-full text-xs font-normal">
                              <CheckCircle className="size-3 mr-1" /> Active
                            </Badge>
                          ) : (
                            <Badge
                              variant="destructive"
                              className="bg-rose-50 text-rose-700 border-rose-200 rounded-full text-xs font-normal"
                            >
                              <XCircle className="size-3 mr-1" /> Deactivated
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleToggleClubStatus(club.id, club.isActive, club.name)
                            }
                            className={`rounded-full text-xs h-8 ${
                              club.isActive
                                ? "text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-100"
                                : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-100"
                            }`}
                          >
                            {club.isActive ? "Deactivate" : "Activate"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* Tab 2: Users Dashboard */}
        <TabsContent value="users">
          <Card className="paper-card border-black/10 bg-white/80 overflow-hidden shadow-none p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-black/[0.02]">
                  <TableRow>
                    <TableHead>User Details</TableHead>
                    <TableHead>Role Assignment</TableHead>
                    <TableHead>Linked Workspace</TableHead>
                    <TableHead>Profile Info</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-black/40">
                        No users found matching search.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((item) => {
                      const { user, role, studentProfile, clubAdminProfile, club } = item;

                      return (
                        <TableRow key={user.id} className="hover:bg-black/[0.01]">
                          <TableCell className="py-3">
                            <p className="font-semibold text-black">{user.displayName}</p>
                            <p className="text-xs text-black/50 mt-0.5">{user.email}</p>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1.5 max-w-[140px]">
                              <select
                                className="h-8 rounded-lg border border-black/10 bg-white px-2 text-xs outline-none"
                                value={role.slug}
                                onChange={(e) =>
                                  handleRoleChange(user.id, e.target.value, user.displayName)
                                }
                              >
                                <option value="student">Student</option>
                                <option value="club_admin">Club Admin</option>
                                <option value="super_admin">Super Admin</option>
                              </select>
                              <Badge
                                variant="secondary"
                                className="rounded-full text-[9px] uppercase font-semibold self-start tracking-wider"
                              >
                                {role.label}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-black/60">
                            {club ? (
                              <span className="font-medium text-black">{club.name}</span>
                            ) : (
                              <span className="text-black/40">None (System-wide)</span>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-black/60 leading-relaxed">
                            {studentProfile && (
                              <div>
                                <p>
                                  <span className="font-semibold">ID:</span>{" "}
                                  {studentProfile.studentId}
                                </p>
                                <p className="text-[10px] text-black/45 mt-0.5">
                                  {studentProfile.department}
                                </p>
                              </div>
                            )}
                            {clubAdminProfile && (
                              <p>
                                <span className="font-semibold">Designation:</span>{" "}
                                {clubAdminProfile.designation}
                              </p>
                            )}
                            {!studentProfile && !clubAdminProfile && (
                              <span className="text-black/40">No Profile Data</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right pr-6 py-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedUser(user);
                                setIsResetOpen(true);
                              }}
                              className="rounded-full text-xs h-8 border-black/10 hover:bg-black/5"
                              title="Reset Password"
                            >
                              <Key className="size-3.5 mr-1" />
                              Reset Password
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Password Reset Dialog */}
      <Dialog open={isResetOpen} onOpenChange={(open) => !open && setIsResetOpen(false)}>
        <DialogContent className="max-w-md rounded-3xl border border-black/10 bg-white p-6 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold tracking-tight text-black flex items-center gap-2">
              <Key className="size-5 text-black/50" />
              Reset User Credentials
            </DialogTitle>
            <DialogDescription className="text-xs text-black/50">
              Reset password credentials for{" "}
              <span className="font-semibold text-black">{selectedUser?.displayName}</span>.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleResetPasswordSubmit} className="space-y-4 mt-3">
            <div className="grid gap-1.5">
              <label
                htmlFor="newPassword"
                className="text-xs font-semibold uppercase tracking-wider text-black/50"
              >
                New Secure Password
              </label>
              <Input
                id="newPassword"
                type="password"
                required
                placeholder="At least 12 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-10 rounded-2xl border-black/10 bg-white"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsResetOpen(false)}
                disabled={isSubmitting}
                className="rounded-full px-4 h-9"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || newPassword.length < 12}
                className="rounded-full px-5 h-9 bg-black text-white hover:bg-black/90 font-medium"
              >
                {isSubmitting ? "Resetting..." : "Reset Password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
