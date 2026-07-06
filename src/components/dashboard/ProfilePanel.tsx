import { useState } from 'react';
import {
  Mail,
  Phone,
  User,
  Building2,
  Shield,
  Save,
  LogOut,
  AlertTriangle,
  Check,
  Loader2,
  ShieldAlert,
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

const businessTypes = [
  { value: 'none', label: 'Select type' },
  { value: 'saas', label: 'SaaS' },
  { value: 'ecommerce', label: 'E-Commerce' },
  { value: 'fintech', label: 'FinTech' },
  { value: 'agency', label: 'Agency' },
  { value: 'other', label: 'Other' },
];

export function ProfilePanel() {
  const { user, session, setAuth } = useAuthStore();
  const [name, setName] = useState(user?.name ?? '');
  const [username, setUsername] = useState(user?.username ?? '');
  const email = user?.email ?? '';
  const [phone, setPhone] = useState(user?.phoneNumber ?? '');
  const [businessType, setBusinessType] = useState(
    user?.businessType ?? 'none'
  );

  // --- Phone verification state ------------------------------------------
  // A phone is considered verified if it matches the number that was on the
  // account when the panel loaded. Editing the field invalidates that until
  // the new number is re-verified.
  const [verifiedPhone, setVerifiedPhone] = useState(user?.phoneNumber ?? '');
  const isPhoneVerified =
    phone.trim() === verifiedPhone.trim() && phone.trim().length > 0;

  const [phoneStep, setPhoneStep] = useState<'idle' | 'code_sent'>('idle');
  const [code, setCode] = useState('');
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const isNameMissing = !user?.name?.trim();

  const initials =
    user?.name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase() ?? '?';

  function handlePhoneChange(value: string) {
    setPhone(value);
    setPhoneStep('idle');
    setCode('');
    setPhoneError(null);
  }

  function startCooldown() {
    setResendCooldown(30);
    const interval = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  async function handleSendCode() {
    if (phone.trim().replace(/\D/g, '').length < 10) {
      setPhoneError('Enter a valid phone number first.');
      return;
    }
    setPhoneError(null);
    setIsSendingCode(true);
    try {
      // TODO: replace with your real send-code call, e.g.
      // await authClient.phoneNumber.sendOtp({ phoneNumber: phone });
      await new Promise(resolve => setTimeout(resolve, 600));
      setPhoneStep('code_sent');
      startCooldown();
    } catch {
      setPhoneError("Couldn't send a verification code. Please try again.");
    } finally {
      setIsSendingCode(false);
    }
  }

  async function handleVerifyCode() {
    if (code.trim().length !== 6) return;
    setPhoneError(null);
    setIsVerifyingCode(true);
    try {
      // TODO: replace with your real verify call, e.g.
      // await authClient.phoneNumber.verify({ phoneNumber: phone, code });
      await new Promise(resolve => setTimeout(resolve, 600));
      setVerifiedPhone(phone);
      setPhoneStep('idle');
      setCode('');
    } catch {
      setPhoneError("That code didn't match. Please try again.");
    } finally {
      setIsVerifyingCode(false);
    }
  }

  async function handleSaveChanges() {
    if (user && session) {
      setAuth(
        {
          ...user,
          name: name.trim(),
          username: username.trim(),
          phoneNumber: verifiedPhone || undefined,
          businessType,
          profileSetupComplete: Boolean(name.trim()) && Boolean(verifiedPhone),
        },
        session
      );
    }
    // TODO: persist to your backend, e.g. await authClient.updateUser({ ... });
  }

  async function handleSignOut() {
    await authClient.signOut();
    window.location.href = '/';
  }

  return (
    <div className="flex-col h-full min-h-0 overflow-y-auto gap-6 p-6 bg-background [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Profile</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your personal information and account settings.
        </p>
      </div>

      {!user?.profileSetupComplete && (
        <Card className="shadow-none border-amber-500/30 bg-amber-500/4">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Finish setting up your profile
              </p>
              <p className="text-xs text-muted-foreground">
                {isNameMissing
                  ? 'Add your name and verify your phone number below.'
                  : 'Verify your phone number below to finish setup.'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Avatar + basic info */}
      <Card className="shadow-none border-border/60">
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
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant="outline"
                  className="text-[10px] font-medium capitalize bg-primary/10 text-primary"
                >
                  <Shield className="mr-1 h-3 w-3" />
                  {user?.role ?? 'buyer'}
                </Badge>
                {user?.profileSetupComplete && (
                  <Badge
                    variant="outline"
                    className="text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  >
                    Profile Complete
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal information */}
      <Card className="shadow-none border-border/60">
        <CardHeader className="p-4 border-b border-border/50">
          <CardTitle className="text-sm font-semibold">
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
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
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Username
              </label>
              <Input
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="e.g. samuel"
                className="h-8 text-sm"
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
                  value={email}
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
                {isPhoneVerified && (
                  <span className="ml-1.5 inline-flex items-center gap-0.5 text-[10px] font-normal text-emerald-600 dark:text-emerald-400">
                    <Check className="h-2.5 w-2.5" />
                    Verified
                  </span>
                )}
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Phone className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={phone}
                    onChange={e => handlePhoneChange(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="h-8 pl-8 text-sm font-mono"
                  />
                </div>
                {!isPhoneVerified && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 shrink-0 cursor-pointer"
                    disabled={isSendingCode || phoneStep === 'code_sent'}
                    onClick={handleSendCode}
                  >
                    {isSendingCode && (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    )}
                    Verify
                  </Button>
                )}
              </div>

              {phoneStep === 'code_sent' && (
                <div className="mt-2 space-y-2 rounded-lg border border-border/60 bg-muted/30 p-3">
                  <label className="text-[11px] font-medium text-foreground">
                    Enter the 6-digit code sent to {phone}
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={code}
                      onChange={e =>
                        setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                      }
                      placeholder="000000"
                      inputMode="numeric"
                      className="h-8 text-center text-sm font-mono tracking-[0.4em]"
                    />
                    <Button
                      type="button"
                      size="sm"
                      className="h-8 shrink-0 gap-1 cursor-pointer"
                      disabled={code.length !== 6 || isVerifyingCode}
                      onClick={handleVerifyCode}
                    >
                      {isVerifyingCode && (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      )}
                      Confirm
                    </Button>
                  </div>
                  <button
                    type="button"
                    disabled={resendCooldown > 0}
                    onClick={handleSendCode}
                    className="text-[11px] text-primary hover:underline disabled:text-muted-foreground disabled:no-underline cursor-pointer disabled:cursor-not-allowed"
                  >
                    {resendCooldown > 0
                      ? `Resend code in ${resendCooldown}s`
                      : 'Resend code'}
                  </button>
                </div>
              )}

              {phoneError && (
                <p className="text-[11px] text-destructive">{phoneError}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Business Type
            </label>
            <div className="relative">
              <Building2 className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <select
                value={businessType}
                onChange={e => setBusinessType(e.target.value)}
                className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent pl-8 pr-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {businessTypes.map(bt => (
                  <option key={bt.value} value={bt.value}>
                    {bt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 border-t border-border/50 flex justify-end gap-2">
          <Button
            size="sm"
            className="gap-1.5 cursor-pointer"
            onClick={handleSaveChanges}
          >
            <Save className="h-3.5 w-3.5" />
            Save Changes
          </Button>
        </CardFooter>
      </Card>

      {/* Account */}
      <Card className="shadow-none border-border/60">
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
      <DeleteAccountCard email={email} />
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
    <Card className="shadow-none border-destructive/30 bg-destructive/3">
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
