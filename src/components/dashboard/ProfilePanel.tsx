import { useState } from 'react';
import {
  Mail,
  Phone,
  User,
  Save,
  LogOut,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { useAuthStore } from '@/store';
import { authClient } from '@/lib/auth-client';

export function ProfilePanel() {
  const { user, session, setAuth } = useAuthStore();
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phoneNumber ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const isNameMissing = !user?.name?.trim();
  const initials =
    user?.name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase() ?? '?';

  async function handleSaveChanges() {
    if (!user || !session) return;

    setIsSaving(true);
    setSaveMessage(null);
    try {
      await authClient.updateUser({
        name: name.trim(),
        phoneNumber: phone.trim() || undefined,
      });

      setAuth(
        {
          ...user,
          name: name.trim(),
          phoneNumber: phone.trim() || undefined,
          profileSetupComplete: true,
        },
        session
      );
      setSaveMessage('Profile updated.');
    } catch {
      setSaveMessage('Failed to save. Try again.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSignOut() {
    await authClient.signOut();
    window.location.href = '/';
  }

  return (
    <div className="flex flex-col h-full min-h-0 overflow-y-auto gap-6 p-6 bg-background [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none">
      <div className="shrink-0">
        <h2 className="text-lg font-semibold text-foreground">Profile</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your personal information and account settings.
        </p>
      </div>

      {/* Avatar + basic info */}
      <Card className="shrink-0 shadow-none border-border/60">
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#B15CE8] text-2xl font-bold text-white">
              {initials}
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-foreground">
                {user?.name ?? 'User'}
              </h3>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              {user?.profileSetupComplete && (
                <Badge
                  variant="outline"
                  className="text-[10px] font-medium mt-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                >
                  Profile Complete
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal information */}
      <Card className="shrink-0 shadow-none border-border/60">
        <CardHeader className="p-4 border-b border-border/50">
          <CardTitle className="text-sm font-semibold">
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Full Name
              {isNameMissing && (
                <span className="ml-1.5 text-[10px] font-normal text-amber-600 dark:text-amber-400">
                  required
                </span>
              )}
            </label>
            <div className="relative">
              <User className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ada Lovelace"
                className={`h-8 pl-8 text-sm ${
                  isNameMissing
                    ? 'border-amber-500/50 focus-visible:ring-amber-500/30'
                    : ''
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={user?.email ?? ''}
                  disabled
                  className="h-8 pl-8 text-sm bg-muted/50"
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                Email cannot be changed. Contact support to update.
              </p>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={phone}
                  onChange={e => {
                    const val = e.target.value.replace(/[^0-9+]/g, '');
                    setPhone(val);
                  }}
                  placeholder="+234 800 000 0000"
                  className="h-8 pl-8 text-sm font-mono"
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 border-t border-border/50 flex justify-end gap-2">
          {saveMessage && (
            <span className="text-xs text-muted-foreground mr-auto">
              {saveMessage}
            </span>
          )}
          <Button
            size="sm"
            className="gap-1.5 cursor-pointer"
            onClick={handleSaveChanges}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Save Changes
          </Button>
        </CardFooter>
      </Card>

      {/* Account */}
      <Card className="shrink-0 shadow-none border-border/60">
        <CardHeader className="p-4 border-b border-border/50">
          <CardTitle className="text-sm font-semibold">Account</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Sign Out</p>
              <p className="text-xs text-muted-foreground">
                Sign out of your account on this device.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 cursor-pointer"
              onClick={handleSignOut}
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <DeleteAccountCard email={user?.email ?? ''} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Delete account (danger zone)                                              */
/* -------------------------------------------------------------------------- */

function DeleteAccountCard({ email }: { email: string }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const canConfirm =
    confirmText.trim().toLowerCase() === email.trim().toLowerCase();

  async function handleDelete() {
    setIsDeleting(true);
    try {
      // TODO: replace with your real delete-account call, e.g.
      // await authClient.deleteUser();
      await new Promise(resolve => setTimeout(resolve, 600));
      window.location.href = '/';
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Card className="shrink-0 shadow-none border-destructive/30 bg-destructive/3">
      <CardHeader className="p-4 border-b border-destructive/20">
        <CardTitle className="text-sm font-semibold text-destructive flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5" />
          Danger Zone
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-foreground">
              Delete Account
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Permanently delete your account and all associated data. This
              cannot be undone.
            </p>
          </div>
          {!confirmOpen ? (
            <Button
              variant="destructive"
              size="sm"
              className="cursor-pointer shrink-0"
              onClick={() => setConfirmOpen(true)}
            >
              Delete Account
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer shrink-0"
              onClick={() => {
                setConfirmOpen(false);
                setConfirmText('');
              }}
            >
              Cancel
            </Button>
          )}
        </div>
        {confirmOpen && (
          <div className="mt-4 pt-4 border-t border-destructive/20 space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Type your email{' '}
                <span className="font-mono text-destructive">{email}</span> to
                confirm
              </label>
              <Input
                value={confirmText}
                onChange={e => setConfirmText(e.target.value)}
                className="h-8 text-sm"
                placeholder={email}
              />
            </div>
            <Button
              variant="destructive"
              size="sm"
              disabled={!canConfirm || isDeleting}
              className="gap-1.5 cursor-pointer"
              onClick={handleDelete}
            >
              {isDeleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Permanently Delete Account
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
