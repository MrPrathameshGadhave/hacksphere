'use client';

import { useEffect, useState } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { formatSubmissionDeadline, isSubmissionDeadlinePassed } from '@/lib/hackathon';

export function DeadlineCountdown() {
  const [timeRemaining, setTimeRemaining] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPassed: boolean;
  } | null>(null);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const hackathonEnd = new Date(process.env.NEXT_PUBLIC_HACKATHON_END_TIME || '');
      
      if (isNaN(hackathonEnd.getTime())) {
        return null;
      }

      const isPassed = isSubmissionDeadlinePassed();
      const now = new Date();
      const diff = hackathonEnd.getTime() - now.getTime();

      if (isPassed || diff <= 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isPassed: true,
        };
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      return { days, hours, minutes, seconds, isPassed: false };
    };

    const time = calculateTimeRemaining();
    if (time) {
      setTimeRemaining(time);
    }

    const interval = setInterval(() => {
      const time = calculateTimeRemaining();
      if (time) {
        setTimeRemaining(time);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!timeRemaining) return null;

  if (timeRemaining.isPassed) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
        <p className="text-sm font-semibold text-red-800">
          Submission deadline has passed. Editing is now locked.
        </p>
      </div>
    );
  }

  const isUrgent = timeRemaining.days === 0 && timeRemaining.hours <= 6;

  return (
    <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${
      isUrgent
        ? 'border-orange-200 bg-orange-50'
        : 'border-blue-200 bg-blue-50'
    }`}>
      <Clock className={`h-5 w-5 flex-shrink-0 ${
        isUrgent ? 'text-orange-600' : 'text-blue-600'
      }`} />
      <p className={`text-sm font-semibold ${
        isUrgent ? 'text-orange-800' : 'text-blue-800'
      }`}>
        Time remaining: <span className="font-bold">
          {timeRemaining.days > 0 && `${timeRemaining.days}d `}
          {timeRemaining.hours.toString().padStart(2, '0')}h{' '}
          {timeRemaining.minutes.toString().padStart(2, '0')}m{' '}
          {timeRemaining.seconds.toString().padStart(2, '0')}s
        </span>
      </p>
    </div>
  );
}
