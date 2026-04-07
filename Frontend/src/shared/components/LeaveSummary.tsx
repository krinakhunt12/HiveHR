import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Calendar, Activity, LifeBuoy } from 'lucide-react';

type Props = {
  paid: number;
  sick: number;
};

const LeaveSummary = ({ paid, sick }: Props) => {
  const total = paid + sick;

  return (
    <Card className="hover:border-primary/10">
      <CardHeader className="py-4 px-6 border-b border-soft">
        <CardTitle className="text-sm font-semibold">Leave Summary</CardTitle>
      </CardHeader>
      <CardContent className="p-4 grid grid-cols-3 gap-3">
        <div className="flex flex-col items-start">
          <div className="p-2 bg-bg rounded-lg mb-2">
            <Calendar size={16} />
          </div>
          <p className="text-[10px] text-muted uppercase tracking-wider">Paid Leave</p>
          <p className="text-sm font-semibold text-main">{paid} Days</p>
        </div>

        <div className="flex flex-col items-start">
          <div className="p-2 bg-bg rounded-lg mb-2">
            <LifeBuoy size={16} />
          </div>
          <p className="text-[10px] text-muted uppercase tracking-wider">Sick Leave</p>
          <p className="text-sm font-semibold text-main">{sick} Days</p>
        </div>

        <div className="flex flex-col items-start">
          <div className="p-2 bg-bg rounded-lg mb-2">
            <Activity size={16} />
          </div>
          <p className="text-[10px] text-muted uppercase tracking-wider">Total</p>
          <p className="text-sm font-semibold text-main">{total} Days</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeaveSummary;
