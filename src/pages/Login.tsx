import { LoginForm } from '@/components/login-form';
import { BackgroundRippleEffect } from '@/components/ui/background-ripple-effect';
import { ThemeToggle } from '@/components/theme-toggle';
import Logo from '@/components/Logo';

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="pointer-events-auto fixed inset-0 z-0 h-screen w-screen">
        <BackgroundRippleEffect />
      </div>
      <div className="absolute bottom-4 left-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm z-10">
        <LoginForm logo={<Logo className="h-8 w-auto" />} />
      </div>
    </div>
  );
}
