import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTOTP } from '@/hooks/useTOTP';
import { toast } from 'sonner';
import { Shield, Loader2, Key, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

// Rate limiting constants
const MAX_ATTEMPTS = 3;
const LOCKOUT_DURATION_MS = 60000; // 1 minute

interface TwoFactorVerifyProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const TwoFactorVerify = ({ onSuccess, onCancel }: TwoFactorVerifyProps) => {
  const { verify, verifyBackup, loading, error } = useTOTP();
  const [code, setCode] = useState('');
  const [useBackup, setUseBackup] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);
  const lockoutTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startLockoutTimer = useCallback(() => {
    const endTime = Date.now() + LOCKOUT_DURATION_MS;
    setLockedUntil(endTime);

    const updateRemaining = () => {
      const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
      setLockoutRemaining(remaining);
      if (remaining > 0) {
        lockoutTimerRef.current = setTimeout(updateRemaining, 1000);
      } else {
        setLockedUntil(null);
        setAttempts(0);
      }
    };
    updateRemaining();
  }, []);

  const isLocked = lockedUntil !== null && Date.now() < lockedUntil;

  const handleVerify = async () => {
    // Check if locked out
    if (isLocked) {
      toast.error(`Too many attempts. Please wait ${lockoutRemaining} seconds.`);
      return;
    }

    if (useBackup) {
      if (code.length < 9) {
        toast.error('Please enter a valid backup code');
        return;
      }
      const result = await verifyBackup(code);
      if (result.valid) {
        setAttempts(0);
        toast.success(`Verified! ${result.remainingCodes} backup codes remaining.`);
        onSuccess();
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        if (newAttempts >= MAX_ATTEMPTS) {
          startLockoutTimer();
          toast.error(`Too many failed attempts. Please wait 60 seconds.`);
        } else {
          toast.error(`Invalid backup code. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`);
        }
      }
    } else {
      if (code.length !== 6) {
        toast.error('Please enter a 6-digit code');
        return;
      }
      const valid = await verify(code);
      if (valid) {
        setAttempts(0);
        toast.success('Verified!');
        onSuccess();
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        if (newAttempts >= MAX_ATTEMPTS) {
          startLockoutTimer();
          toast.error(`Too many failed attempts. Please wait 60 seconds.`);
        } else {
          toast.error(`Invalid code. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`);
        }
      }
    }
    setCode('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Shield className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Two-Factor Authentication
        </h3>
        <p className="text-muted-foreground text-sm">
          {useBackup 
            ? 'Enter one of your backup codes'
            : 'Enter the 6-digit code from your authenticator app'
          }
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="2fa-code">
          {useBackup ? 'Backup Code' : 'Verification Code'}
        </Label>
        <Input
          id="2fa-code"
          value={code}
          onChange={(e) => {
            if (useBackup) {
              setCode(e.target.value.toUpperCase());
            } else {
              setCode(e.target.value.replace(/\D/g, '').slice(0, 6));
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={useBackup ? 'XXXX-XXXX' : '000000'}
          className={`text-center text-xl tracking-widest font-mono ${useBackup ? 'text-lg' : 'text-2xl'}`}
          maxLength={useBackup ? 9 : 6}
          autoFocus
        />
      </div>

      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}

      {isLocked && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
          <p className="text-sm text-destructive">
            Too many failed attempts. Please wait {lockoutRemaining} seconds.
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Button
          onClick={handleVerify}
          disabled={loading || isLocked || (useBackup ? code.length < 9 : code.length !== 6)}
          className="w-full"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isLocked ? (
            `Locked (${lockoutRemaining}s)`
          ) : (
            'Verify'
          )}
        </Button>
        
        <Button 
          variant="ghost" 
          onClick={onCancel}
          className="w-full"
        >
          Cancel
        </Button>
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={() => {
            setUseBackup(!useBackup);
            setCode('');
          }}
          className="text-sm text-primary hover:underline inline-flex items-center gap-1"
        >
          <Key className="h-3 w-3" />
          {useBackup ? 'Use authenticator app instead' : 'Use a backup code'}
        </button>
      </div>
    </motion.div>
  );
};
