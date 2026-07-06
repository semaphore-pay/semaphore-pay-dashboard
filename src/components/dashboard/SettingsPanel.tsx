import { useState } from 'react';
import {
  Building2,
  Key,
  CreditCard,
  Users,
  Copy,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Check,
  AlertTriangle,
  Phone,
  ShieldCheck,
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
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { useCollectionsStore } from '@/store';
import { useAuthStore } from '@/store'; // adjust path to match your project

type SettingsTab = 'general' | 'api-keys' | 'billing' | 'team';

const tabs: { id: SettingsTab; label: string; icon: typeof Building2 }[] = [
  { id: 'general', label: 'General', icon: Building2 },
  { id: 'api-keys', label: 'API Keys', icon: Key },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'team', label: 'Team', icon: Users },
];

const mockApiKeys = [
  {
    id: 'key_1',
    name: 'Production Key',
    type: 'secret',
    prefix: 'sk_live_****',
    createdAt: '2026-04-01',
    lastUsed: '2026-07-05',
  },
  {
    id: 'key_2',
    name: 'Development Key',
    type: 'public',
    prefix: 'pk_test_****',
    createdAt: '2026-03-15',
    lastUsed: '2026-07-06',
  },
];

const mockTeamMembers = [
  {
    id: 'u1',
    name: 'Samuel Ayibatarri',
    email: 'sam@semaphorepay.tech',
    role: 'owner',
    status: 'active',
  },
  {
    id: 'u2',
    name: 'Sarah Jenkins',
    email: 'sarah@semaphorepay.tech',
    role: 'admin',
    status: 'active',
  },
];

/* -------------------------------------------------------------------------- */
/*  Reusable danger-zone card                                                 */
/* -------------------------------------------------------------------------- */

function DangerZoneCard({
  title,
  description,
  actionLabel,
  onConfirm,
  requireTyping,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onConfirm?: () => void;
  requireTyping?: string; // if set, user must type this word to enable the button
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const canConfirm = !requireTyping || confirmText === requireTyping;

  return (
    <Card className="shadow-none border-destructive/30 bg-destructive/[0.03]">
      <CardHeader className="p-4 border-b border-destructive/20">
        <CardTitle className="text-sm font-semibold text-destructive flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5" />
          Danger Zone
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-foreground">{title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {description}
            </p>
          </div>
          {!confirmOpen ? (
            <Button
              variant="destructive"
              size="sm"
              className="cursor-pointer shrink-0"
              onClick={() => setConfirmOpen(true)}
            >
              {actionLabel}
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
            {requireTyping ? (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Type{' '}
                  <span className="font-mono text-destructive">
                    {requireTyping}
                  </span>{' '}
                  to confirm
                </label>
                <Input
                  value={confirmText}
                  onChange={e => setConfirmText(e.target.value)}
                  className="h-8 text-sm"
                  placeholder={requireTyping}
                />
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                This action cannot be undone. Are you sure you want to continue?
              </p>
            )}
            <Button
              variant="destructive"
              size="sm"
              disabled={!canConfirm}
              className="cursor-pointer"
              onClick={() => {
                onConfirm?.();
                setConfirmOpen(false);
                setConfirmText('');
              }}
            >
              {actionLabel}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*  Profile setup: name + phone verification                                  */
/* -------------------------------------------------------------------------- */

function ProfileSetupCard() {
  const { user, setAuth, session } = useAuthStore();

  const nameParts = (user?.name ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const [firstName, setFirstName] = useState(nameParts[0] ?? '');
  const [lastName, setLastName] = useState(nameParts.slice(1).join(' ') ?? '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber ?? '');

  // "details" -> "verify" -> "done"
  const [step, setStep] = useState<'details' | 'verify' | 'done'>('details');
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const isNameValid = firstName.trim().length > 0 && lastName.trim().length > 0;
  const isPhoneValid = phoneNumber.trim().replace(/\D/g, '').length >= 10;

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
    if (!isNameValid || !isPhoneValid) return;
    setError(null);
    setIsSubmitting(true);
    try {
      // TODO: replace with real API call, e.g.
      // await api.sendPhoneVerification({ phoneNumber });
      await new Promise(resolve => setTimeout(resolve, 600));
      setStep('verify');
      startCooldown();
    } catch {
      setError("Couldn't send a verification code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerifyCode() {
    if (code.trim().length !== 6) return;
    setError(null);
    setIsSubmitting(true);
    try {
      // TODO: replace with real API call, e.g.
      // await api.verifyPhoneCode({ phoneNumber, code });
      await new Promise(resolve => setTimeout(resolve, 600));

      if (user && session) {
        setAuth(
          {
            ...user,
            name: `${firstName.trim()} ${lastName.trim()}`.trim(),
            phoneNumber: phoneNumber.trim(),
            profileSetupComplete: true,
          },
          session
        );
      }
      setStep('done');
    } catch {
      setError("That code didn't match. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (step === 'done') {
    return (
      <Card className="shadow-none border-emerald-500/30 bg-emerald-500/[0.04]">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Check className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              Profile complete
            </p>
            <p className="text-xs text-muted-foreground">
              Your name and phone number have been saved.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-none border-amber-500/30 bg-amber-500/[0.04]">
      <CardHeader className="p-4 border-b border-amber-500/20">
        <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
          Complete your profile
        </CardTitle>
        <CardDescription className="text-xs">
          Add your name and verify your phone number to finish setting up your
          account.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {step === 'details' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  First name
                </label>
                <Input
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="Ada"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Last name
                </label>
                <Input
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="Lovelace"
                  className="h-8 text-sm"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Phone number
              </label>
              <div className="relative">
                <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  placeholder="+234 801 234 5678"
                  className="h-8 text-sm pl-8"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                We'll text you a 6-digit code to verify this number.
              </p>
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </>
        )}

        {step === 'verify' && (
          <>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Enter the code sent to {phoneNumber}
              </label>
              <Input
                value={code}
                onChange={e =>
                  setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                }
                placeholder="000000"
                inputMode="numeric"
                className="h-10 text-center text-lg font-mono tracking-[0.5em]"
              />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep('details')}
                className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Change phone number
              </button>
              <button
                type="button"
                disabled={resendCooldown > 0}
                onClick={handleSendCode}
                className="text-xs text-primary hover:underline disabled:text-muted-foreground disabled:no-underline cursor-pointer disabled:cursor-not-allowed"
              >
                {resendCooldown > 0
                  ? `Resend code in ${resendCooldown}s`
                  : 'Resend code'}
              </button>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="p-4 border-t border-amber-500/20 flex justify-end">
        {step === 'details' && (
          <Button
            size="sm"
            className="gap-1.5 cursor-pointer"
            disabled={!isNameValid || !isPhoneValid || isSubmitting}
            onClick={handleSendCode}
          >
            {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Send verification code
          </Button>
        )}
        {step === 'verify' && (
          <Button
            size="sm"
            className="gap-1.5 cursor-pointer"
            disabled={code.length !== 6 || isSubmitting}
            onClick={handleVerifyCode}
          >
            {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Verify & save
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*  General tab                                                               */
/* -------------------------------------------------------------------------- */

function GeneralTab() {
  const { collections } = useCollectionsStore();
  const { user } = useAuthStore();
  const [workspaceName, setWorkspaceName] = useState('Semaphore Pay');

  const profileIncomplete =
    !user?.profileSetupComplete || !user?.name?.trim() || !user?.phoneNumber;

  return (
    <div className="space-y-6">
      {profileIncomplete && <ProfileSetupCard />}

      <Card className="shadow-none border-border/60">
        <CardHeader className="p-4 border-b border-border/50">
          <CardTitle className="text-sm font-semibold">Workspace</CardTitle>
          <CardDescription className="text-xs">
            Manage your workspace name and general settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Workspace Name
            </label>
            <Input
              value={workspaceName}
              onChange={e => setWorkspaceName(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Collections
            </label>
            <p className="text-xs text-muted-foreground">
              {collections.length} collection
              {collections.length !== 1 ? 's' : ''} active
            </p>
          </div>
        </CardContent>
        <CardFooter className="p-4 border-t border-border/50 flex justify-end">
          <Button size="sm" className="gap-1.5 cursor-pointer">
            Save Changes
          </Button>
        </CardFooter>
      </Card>

      <DangerZoneCard
        title="Delete Workspace"
        description="Permanently delete this workspace and all associated data. This cannot be undone."
        actionLabel="Delete Workspace"
        requireTyping="delete workspace"
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  API keys tab                                                              */
/* -------------------------------------------------------------------------- */

function ApiKeysTab() {
  const [showKey, setShowKey] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  function handleCopy(key: string) {
    navigator.clipboard.writeText(key);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">API Keys</h3>
          <p className="text-xs text-muted-foreground">
            Manage keys for authenticating with the Semaphore Pay API.
          </p>
        </div>
        <Button size="sm" className="gap-1.5 cursor-pointer">
          <Plus className="h-3.5 w-3.5" />
          Generate Key
        </Button>
      </div>
      <div className="space-y-3">
        {mockApiKeys.map(key => (
          <Card key={key.id} className="shadow-none border-border/60">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Key className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {key.name}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-medium ${
                        key.type === 'secret'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {key.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <code className="text-[11px] font-mono text-muted-foreground">
                      {showKey === key.id
                        ? 'sk_live_abc123def456ghi789'
                        : key.prefix}
                    </code>
                    <button
                      type="button"
                      onClick={() =>
                        setShowKey(showKey === key.id ? null : key.id)
                      }
                      className="text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showKey === key.id ? (
                        <EyeOff className="h-3 w-3" />
                      ) : (
                        <Eye className="h-3 w-3" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(key.prefix)}
                      className="text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {copied === key.id ? (
                        <Check className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Created {key.createdAt} · Last used {key.lastUsed}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <DangerZoneCard
        title="Revoke all API keys"
        description="Immediately invalidate every active key. Any integration using them will stop working."
        actionLabel="Revoke All Keys"
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Billing tab                                                               */
/* -------------------------------------------------------------------------- */

function BillingTab() {
  return (
    <div className="space-y-6">
      <Card className="shadow-none border-border/60">
        <CardHeader className="p-4 border-b border-border/50">
          <CardTitle className="text-sm font-semibold">Current Plan</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-foreground">
                  Pro
                </span>
                <Badge className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  Active
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Unlimited collections, priority support, advanced analytics.
              </p>
            </div>
            <Button variant="outline" size="sm" className="cursor-pointer">
              Manage Subscription
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card className="shadow-none border-border/60">
        <CardHeader className="p-4 border-b border-border/50">
          <CardTitle className="text-sm font-semibold">Usage</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {[
            { label: 'Collections', used: 2, limit: 10 },
            { label: 'Plans', used: 4, limit: 5 },
            { label: 'Team Members', used: 2, limit: 5 },
          ].map(item => (
            <div key={item.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">
                  {item.label}
                </span>
                <span className="text-muted-foreground">
                  {item.used} / {item.limit}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${(item.used / item.limit) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card className="shadow-none border-border/60">
        <CardHeader className="p-4 border-b border-border/50">
          <CardTitle className="text-sm font-semibold">
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Visa ending in 4242
                </p>
                <p className="text-xs text-muted-foreground">Expires 12/2027</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="cursor-pointer">
              Update
            </Button>
          </div>
        </CardContent>
      </Card>

      <DangerZoneCard
        title="Cancel subscription"
        description="Your workspace will be downgraded to the Free plan at the end of the billing period."
        actionLabel="Cancel Subscription"
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Team tab                                                                  */
/* -------------------------------------------------------------------------- */

function TeamTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Team Members
          </h3>
          <p className="text-xs text-muted-foreground">
            Manage who has access to this workspace.
          </p>
        </div>
        <Button size="sm" className="gap-1.5 cursor-pointer">
          <Plus className="h-3.5 w-3.5" />
          Invite Member
        </Button>
      </div>
      <div className="space-y-3">
        {mockTeamMembers.map(member => (
          <Card key={member.id} className="shadow-none border-border/60">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                  {member.name
                    .split(' ')
                    .map(n => n[0])
                    .join('')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {member.name}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-medium capitalize ${
                        member.role === 'owner'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {member.role}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {member.email}
                  </p>
                </div>
              </div>
              {member.role !== 'owner' && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive cursor-pointer"
                >
                  Remove
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <DangerZoneCard
        title="Leave workspace"
        description="You'll lose access to this workspace and all its collections. An owner can re-invite you later."
        actionLabel="Leave Workspace"
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Panel shell                                                               */
/* -------------------------------------------------------------------------- */

export function SettingsPanel() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  return (
    // h-full + min-h-0 let this panel shrink inside its flex parent instead of
    // being pushed to its content height, which is what was clipping the
    // overflow-y-auto scroll area on shorter laptop screens.
    <div className="flex flex-1 flex-col h-full min-h-0 overflow-y-auto gap-6 p-6 bg-background [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your workspace configuration, API keys, billing, and team.
        </p>
      </div>
      {/* Tab nav */}
      <div className="flex items-center gap-0.5 self-start rounded-md bg-muted/60 p-0.5 shrink-0">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 rounded-[5px] px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-background text-foreground shadow-sm ring-1 ring-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>
      {activeTab === 'general' && <GeneralTab />}
      {activeTab === 'api-keys' && <ApiKeysTab />}
      {activeTab === 'billing' && <BillingTab />}
      {activeTab === 'team' && <TeamTab />}
    </div>
  );
}
