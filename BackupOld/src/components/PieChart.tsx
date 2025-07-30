import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
  Plugin
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface PieChartProps {
  label: string;
  value: number;
}

export function PieChart({ label, value }: PieChartProps) {
  const roundedValue = Math.round(value);
  const data = {
    labels: [label, 'Livre'],
    datasets: [
      {
        data: [roundedValue, 100 - roundedValue],
        backgroundColor: [
          roundedValue > 75 ? '#ef4444' : roundedValue > 50 ? '#f59e42' : '#22c55e',
          '#e5e7eb',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Plugin para mostrar o percentual no centro
  const centerTextPlugin: Plugin<'pie'> = {
    id: 'centerText',
    afterDraw: (chart) => {
      const { ctx, chartArea } = chart;
      ctx.save();
      ctx.font = 'bold 1.2rem Arial';
      ctx.fillStyle = '#222';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const x = (chartArea.left + chartArea.right) / 2;
      const y = (chartArea.top + chartArea.bottom) / 2;
      ctx.fillText(`${roundedValue}%`, x, y);
      ctx.restore();
    }
  };

  const options: ChartOptions<'pie'> = {
    plugins: {
      legend: { display: false },
      centerText: {},
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="bg-gray-50 rounded-xl shadow-sm border border-gray-200 p-2 flex flex-col items-center justify-center w-28 h-28">
      <div className="text-xs font-semibold text-gray-700 mb-1">{label}</div>
      <div style={{ width: '80px', height: '80px', position: 'relative' }}>
        <Pie data={data} options={options} plugins={[centerTextPlugin]} />
      </div>
    </div>
  );
}
