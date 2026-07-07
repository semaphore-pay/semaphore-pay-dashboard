import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';
import { MailCheck, ArrowLeft } from 'lucide-react';

export function LoginForm({
  className,
  logo,
  ...props
}: React.ComponentProps<'div'> & { logo?: React.ReactNode }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    try {
      const { error: authError } = await authClient.signIn.magicLink({
        email,
        callbackURL: window.location.origin,
      });
      if (authError) {
        toast.error(authError.message ?? 'Failed to send magic link');
        setStatus('idle');
        return;
      }
      setStatus('sent');
    } catch {
      toast.error('Network error');
      setStatus('idle');
    }
  }

  if (status === 'sent') {
    return (
      <div className={cn('flex flex-col gap-6 py-6', className)} {...props}>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-2">
            <MailCheck className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Check your email
            </h1>
            <FieldDescription className="text-base max-w-sm">
              We sent a magic link to{' '}
              <strong className="font-medium text-foreground">{email}</strong>.
              Click the link to sign in.
            </FieldDescription>
          </div>
        </div>
        <div className="flex justify-center mt-2">
          <Button
            variant="ghost"
            onClick={() => {
              setStatus('idle');
              setEmail('');
            }}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Try another email
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <a
              href="#"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex items-center justify-center">
                {logo ?? (
                  <span className="text-xl font-bold">Semaphore Pay</span>
                )}
              </div>
              <span className="sr-only">Semaphore Pay</span>
            </a>
            {/* <h1 className="text-xl font-bold">Welcome to Semaphore Pay</h1> */}
          </div>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </Field>
          <Field>
            <Button type="submit" disabled={status === 'loading'}>
              {status === 'loading' ? 'Sending link...' : 'Sign in'}
            </Button>
          </Field>
        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-center">
        By continuing, you agree to our <a href="/terms">Terms of Service</a>{' '}
        and <a href="/privacy">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}
