import { useState, useEffect } from 'react';
import {
  Building2,
  Key,
  Wallet,
  Copy,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Check,
  AlertTriangle,
  Loader2,
  Layers,
  Package,
  Users,
  Activity,
  ArrowRight,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  useCollectionsStore,
  useDashboardStore,
  useBalanceStore,
} from '@/store';
import * as api from '@/lib/api';

type SettingsTab = 'general' | 'api-keys' | 'payouts';

const tabs: { id: SettingsTab; label: string; icon: typeof Building2 }[] = [
  { id: 'general', label: 'General', icon: Building2 },
  { id: 'api-keys', label: 'API Keys', icon: Key },
  { id: 'payouts', label: 'Payouts', icon: Wallet },
];

/* -------------------------------------------------------------------------- */
/* Reusable danger-zone card                                                 */
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
  requireTyping?: string;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const canConfirm = !requireTyping || confirmText === requireTyping;

  return (
    <Card className="shadow-none border-destructive/30 bg-destructive/2">
      <CardHeader className="p-4 border-b border-destructive/20">
        <CardTitle className="text-sm font-semibold text-destructive flex items-center gap-1.5">
          <AlertTriangle className="h-4 w-4" />
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
              className="cursor-pointer shrink-0 shadow-none"
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
                  <span className="font-mono text-destructive bg-destructive/10 px-1 rounded">
                    {requireTyping}
                  </span>{' '}
                  to confirm
                </label>
                <Input
                  value={confirmText}
                  onChange={e => setConfirmText(e.target.value)}
                  className="h-8 text-sm focus-visible:ring-destructive"
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
              className="cursor-pointer shadow-none"
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
/* General tab                                                               */
/* -------------------------------------------------------------------------- */

function GeneralTab() {
  const { collections } = useCollectionsStore();
  const { activeCollectionId } = useDashboardStore();
  const activeCollection = collections.find(c => c.id === activeCollectionId);

  const stats = [
    {
      label: 'Configured Plans',
      value: activeCollection?.plans ?? 0,
      icon: Layers,
    },
    {
      label: 'Active Products',
      value: activeCollection?.products ?? 0,
      icon: Package,
    },
    {
      label: 'Total Customers',
      value: activeCollection?.customers ?? 0,
      icon: Users,
    },
    {
      label: 'Active Subscriptions',
      value: activeCollection?.activeSubscriptions ?? 0,
      icon: Activity,
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="shadow-none border-border/60">
        <CardHeader className="p-4 border-b border-border/50">
          <CardTitle className="text-sm font-semibold">
            Collection Configuration
          </CardTitle>
          <CardDescription className="text-xs">
            Manage your workspace identity and view overarching statistics.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-6">
          <div className="space-y-1.5 max-w-xl">
            <label className="text-xs font-medium text-foreground">
              Collection Name
            </label>
            <div className="flex gap-2">
              <Input
                value={activeCollection?.name ?? ''}
                className="h-8 text-sm"
                disabled
              />
              <Button size="sm" variant="outline" className="h-8" disabled>
                Edit
              </Button>
            </div>
          </div>

          <div className="@container/main">
            <div className="grid grid-cols-2 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs @xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
              {stats.map(stat => {
                const Icon = stat.icon;
                return (
                  <Card
                    key={stat.label}
                    className="@container/card data-[slot=card]"
                    data-slot="card"
                  >
                    <CardHeader className="p-4 pb-2">
                      <CardDescription className="text-xs">
                        {stat.label}
                      </CardDescription>
                      <CardTitle className="text-2xl font-semibold tabular-nums mt-1">
                        {stat.value}
                      </CardTitle>
                    </CardHeader>
                    <CardFooter className="p-4 pt-0">
                      <Icon className="h-4 w-4 text-muted-foreground/50" />
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <DangerZoneCard
        title="Delete Collection"
        description="Permanently delete this collection and all associated data. This cannot be undone."
        actionLabel="Delete Collection"
        requireTyping="delete collection"
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* API keys tab                                                              */
/* -------------------------------------------------------------------------- */

function ApiKeysTab() {
  const { activeCollectionId } = useDashboardStore();
  const [keys, setKeys] = useState<api.ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showKey, setShowKey] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<{
    keys: api.ApiKey[];
    label: string;
  } | null>(null);
  const [confirmText, setConfirmText] = useState('');

  useEffect(() => {
    if (!activeCollectionId) return;
    setLoading(true);
    api.listApiKeys(activeCollectionId).then(data => {
      setKeys(data);
      setLoading(false);
    });
  }, [activeCollectionId]);

  const secretKeys = keys.filter(k => k.type === 'secret');
  const publicKeys = keys.filter(k => k.type === 'public');

  function maskKey(key: string) {
    const prefix = key.slice(0, 12);
    return `${prefix}${'•'.repeat(24)}`;
  }

  async function handleCopy(key: string) {
    await navigator.clipboard.writeText(key);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  async function handleGenerate() {
    if (!activeCollectionId) return;
    setGenerating(true);
    try {
      const newPublic = await api.createApiKey(activeCollectionId, {
        type: 'public',
        environment: 'production',
      });
      const newSecret = await api.createApiKey(activeCollectionId, {
        type: 'secret',
        environment: 'production',
      });
      setKeys(prev => [...prev, newPublic, newSecret]);
    } finally {
      setGenerating(false);
    }
  }

  async function handleRevokeConfirm() {
    if (!activeCollectionId || !revokeTarget) return;
    for (const k of revokeTarget.keys) {
      await api.revokeApiKey(activeCollectionId, k.key);
    }
    const revokedKeys = new Set(revokeTarget.keys.map(k => k.key));
    setKeys(prev => prev.filter(k => !revokedKeys.has(k.key)));
    setRevokeTarget(null);
    setConfirmText('');
  }

  function openRevokePair() {
    const pair = [...secretKeys, ...publicKeys];
    if (pair.length === 0) return;
    setRevokeTarget({ keys: pair, label: 'all keys' });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            API Credentials
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage authentication keys for interacting with the Semaphore Pay
            API.
          </p>
        </div>
        <Button
          size="sm"
          className="gap-1.5 cursor-pointer"
          onClick={handleGenerate}
          disabled={generating}
        >
          {generating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Plus className="h-3.5 w-3.5" />
          )}
          Generate New Pair
        </Button>
      </div>

      {loading ? (
        <Card className="shadow-none border-border/60">
          <CardContent className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading keys...
          </CardContent>
        </Card>
      ) : keys.length === 0 ? (
        <Card className="shadow-none border-border/60 bg-muted/10">
          <CardContent className="p-8 text-center flex flex-col items-center justify-center">
            <Key className="h-8 w-8 text-muted-foreground mb-3 opacity-20" />
            <p className="text-sm font-medium text-foreground">
              No API keys configured
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Generate a pair to start authenticating API requests.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {secretKeys.map(sk => {
            const pk = publicKeys.find(k => k.environment === sk.environment);
            const pair = pk ? [sk, pk] : [sk];
            return (
              <Card
                key={sk.key}
                className="shadow-none border-border/60 overflow-hidden"
              >
                <div className="bg-muted/30 p-3 border-b border-border/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="text-[10px] font-semibold bg-background text-foreground uppercase tracking-wider"
                    >
                      {sk.environment}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      Created {new Date(sk.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                    onClick={() =>
                      setRevokeTarget({
                        keys: pair,
                        label: `${sk.environment} pair`,
                      })
                    }
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-3 bg-muted/20 p-2.5 rounded-md border border-border/50">
                    <Badge
                      variant="outline"
                      className="text-[10px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 w-16 justify-center shadow-none border-amber-500/20"
                    >
                      SECRET
                    </Badge>
                    <code className="text-[11px] font-mono text-muted-foreground flex-1 tracking-wider">
                      {showKey === sk.key ? sk.key : maskKey(sk.key)}
                    </code>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground"
                        onClick={() =>
                          setShowKey(showKey === sk.key ? null : sk.key)
                        }
                      >
                        {showKey === sk.key ? (
                          <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground"
                        onClick={() => handleCopy(sk.key)}
                      >
                        {copied === sk.key ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {pk && (
                    <div className="flex items-center gap-3 bg-muted/20 p-2.5 rounded-md border border-border/50">
                      <Badge
                        variant="outline"
                        className="text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 w-16 justify-center shadow-none border-emerald-500/20"
                      >
                        PUBLIC
                      </Badge>
                      <code className="text-[11px] font-mono text-muted-foreground flex-1 tracking-wider">
                        {showKey === pk.key ? pk.key : maskKey(pk.key)}
                      </code>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground"
                          onClick={() =>
                            setShowKey(showKey === pk.key ? null : pk.key)
                          }
                        >
                          {showKey === pk.key ? (
                            <EyeOff className="h-3.5 w-3.5" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground"
                          onClick={() => handleCopy(pk.key)}
                        >
                          {copied === pk.key ? (
                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <DangerZoneCard
        title="Revoke All Keys"
        description="Invalidates every active key. Integrations will stop working immediately."
        actionLabel="Revoke All"
        onConfirm={openRevokePair}
      />

      <AlertDialog
        open={!!revokeTarget}
        onOpenChange={() => {
          setRevokeTarget(null);
          setConfirmText('');
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke {revokeTarget?.label}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will immediately invalidate these keys. Any application using
              them will stop working. You cannot undo this action.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <label className="text-xs font-medium text-foreground">
              Type{' '}
              <span className="font-mono text-destructive bg-destructive/10 px-1 rounded">
                revoke
              </span>{' '}
              to confirm
            </label>
            <Input
              value={confirmText}
              onChange={e => setConfirmText(e.target.value)}
              className="h-8 text-sm mt-1.5 focus-visible:ring-destructive"
              placeholder="revoke"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setRevokeTarget(null);
                setConfirmText('');
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={confirmText !== 'revoke'}
              onClick={handleRevokeConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-none"
            >
              Revoke Keys
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Payouts tab                                                               */
/* -------------------------------------------------------------------------- */

function formatBalance(amount: number): string {
  return `₦${(amount / 100).toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function PayoutsTab() {
  const { balance, loading, fetch: fetchBalance } = useBalanceStore();
  const { activeCollectionId } = useDashboardStore();

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance, activeCollectionId]);

  return (
    <div className="space-y-6">
      <div className="@container/main">
        <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 dark:*:data-[slot=card]:bg-card">
          <Card className="@container/card data-[slot=card]" data-slot="card">
            <CardHeader className="p-5 pb-2">
              <CardDescription className="text-xs font-medium uppercase tracking-wider">
                Available Balance
              </CardDescription>
              <CardTitle className="text-4xl font-semibold tabular-nums mt-2">
                {loading
                  ? 'Loading...'
                  : formatBalance(balance?.available ?? 0)}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-4">
              <div className="text-xs text-muted-foreground mb-4">
                Available funds from customer payments, minus platform fees.
              </div>
              <Button
                className="w-full sm:w-auto gap-1.5 cursor-pointer shadow-none"
                disabled
              >
                <Wallet className="h-4 w-4" />
                Withdraw Funds
              </Button>
            </CardContent>
          </Card>

          <Card className="@container/card data-[slot=card]" data-slot="card">
            <CardHeader className="p-5 pb-2 border-b border-border/50">
              <CardTitle className="text-sm font-semibold">
                Payout Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                <div className="flex items-center justify-between p-4 text-sm">
                  <span className="text-muted-foreground">Platform fee</span>
                  <span className="font-medium text-foreground">
                    1.35% per txn
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 text-sm">
                  <span className="text-muted-foreground">Total earned</span>
                  <span className="font-medium text-foreground tabular-nums">
                    {loading
                      ? 'Loading...'
                      : formatBalance(balance?.totalEarned ?? 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 text-sm">
                  <span className="text-muted-foreground">Payout schedule</span>
                  <span className="font-medium text-foreground">
                    T+1 (Next Business Day)
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 text-sm">
                  <span className="text-muted-foreground">Minimum payout</span>
                  <span className="font-medium text-foreground tabular-nums">
                    ₦5,000.00
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-none border-border/60">
          <CardHeader className="p-4 border-b border-border/50">
            <CardTitle className="text-sm font-semibold">
              Settlement Account
            </CardTitle>
            <CardDescription className="text-xs">
              Bank account where your payouts will be sent.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center text-center space-y-3">
              <div className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  No account configured
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Add a bank account to receive payouts.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 mt-2 cursor-pointer shadow-none"
                disabled
              >
                <Plus className="h-3.5 w-3.5" />
                Add Bank Account
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none border-border/60">
          <CardHeader className="p-4 border-b border-border/50 flex flex-row items-center justify-between py-3">
            <CardTitle className="text-sm font-semibold">
              Recent Payouts
            </CardTitle>
            <Button variant="ghost" size="sm" className="h-8 text-xs" disabled>
              View All <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center text-center text-sm text-muted-foreground h-full min-h-30">
              No payout history available yet.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Panel shell                                                               */
/* -------------------------------------------------------------------------- */

export function SettingsPanel() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  return (
    <div className="flex flex-1 flex-col h-full min-h-0 overflow-y-auto gap-6 p-6 bg-background [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your collection, API keys, and payouts.
        </p>
      </div>

      <div className="flex items-center gap-1 self-start rounded-md bg-muted/40 p-1 border border-border/50 shrink-0">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-background text-foreground shadow-xs border border-border/50'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 pb-10">
        {activeTab === 'general' && <GeneralTab />}
        {activeTab === 'api-keys' && <ApiKeysTab />}
        {activeTab === 'payouts' && <PayoutsTab />}
      </div>
    </div>
  );
}
