import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

interface OrderStatusData {
  name: string;
  value: number;
  color: string;
}

interface OrderStatusChartProps {
  data: OrderStatusData[];
}

export default function OrderStatusChart({ data }: OrderStatusChartProps) {
  const hasData = data.some((d) => d.value > 0);
  const totalOrders = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="bg-white rounded-lg p-6 border border-slate-200/60 flex flex-col h-full">
      <h3 className="font-medium text-black text-base mb-6">Order Status</h3>
      
      <div className="h-[200px] w-full relative mb-4">
        {hasData ? (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: 'none', fontSize: '13px' }}
                  itemStyle={{ color: '#000' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-semibold text-black leading-none">
                {totalOrders}
              </span>
              <span className="text-[10px] uppercase font-medium text-black/50 tracking-wider mt-1">Orders</span>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <p className="text-sm font-medium text-black/40">No orders</p>
          </div>
        )}
      </div>

      {/* Custom Legend for Pie Chart */}
      <div className="flex flex-wrap justify-center gap-3">
        {data.map((entry, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-[13px] text-black/80 font-medium">{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
