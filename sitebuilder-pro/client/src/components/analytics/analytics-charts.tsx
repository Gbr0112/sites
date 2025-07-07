import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface AnalyticsChartsProps {
  data: any[];
  type: 'views-orders' | 'revenue' | 'sales-trend' | 'product-performance' | 'delivery-type' | 'peak-hours';
  isLoading: boolean;
}

export default function AnalyticsCharts({ data, type, isLoading }: AnalyticsChartsProps) {
  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 mb-2">📊</div>
          <p className="text-gray-600">Dados insuficientes para gerar gráfico</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  const renderViewsOrdersChart = () => {
    const chartData = data.map(item => ({
      date: formatDate(item.date),
      views: item.views || 0,
      orders: item.orders || 0,
    }));

    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="views" 
            stroke="#3B82F6" 
            strokeWidth={2}
            name="Visualizações"
          />
          <Line 
            type="monotone" 
            dataKey="orders" 
            stroke="#10B981" 
            strokeWidth={2}
            name="Pedidos"
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const renderRevenueChart = () => {
    const chartData = data.map(item => ({
      date: formatDate(item.date),
      revenue: parseFloat(item.revenue || 0),
    }));

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip 
            formatter={(value: number) => [
              new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(value),
              'Faturamento'
            ]}
          />
          <Bar dataKey="revenue" fill="#F59E0B" name="Faturamento" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderSalesTrendChart = () => {
    const chartData = data.map(item => ({
      date: formatDate(item.date),
      orders: item.orders || 0,
      revenue: parseFloat(item.revenue || 0),
    }));

    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          <Bar yAxisId="left" dataKey="orders" fill="#8884d8" name="Pedidos" />
          <Line 
            yAxisId="right" 
            type="monotone" 
            dataKey="revenue" 
            stroke="#ff7300" 
            strokeWidth={2}
            name="Faturamento (R$)"
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const renderProductPerformanceChart = () => {
    const chartData = data.slice(0, 5).map(item => ({
      name: item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name,
      quantity: item.quantity,
      revenue: item.revenue,
    }));

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="name" type="category" width={100} />
          <Tooltip 
            formatter={(value: number, name: string) => [
              name === 'quantity' ? value : new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(value),
              name === 'quantity' ? 'Quantidade' : 'Faturamento'
            ]}
          />
          <Bar dataKey="quantity" fill="#8884d8" name="Quantidade" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderDeliveryTypeChart = () => {
    const deliveryStats = data.reduce((acc: any, order: any) => {
      const type = order.deliveryType === 'delivery' ? 'Delivery' : 'Retirada';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const chartData = Object.entries(deliveryStats).map(([name, value]) => ({
      name,
      value: value as number,
    }));

    const COLORS = ['#FF6B35', '#4ECDC4'];

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  const renderPeakHoursChart = () => {
    const hourStats = data.reduce((acc: any, order: any) => {
      const hour = new Date(order.createdAt).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {});

    const chartData = Array.from({ length: 24 }, (_, hour) => ({
      hour: `${hour.toString().padStart(2, '0')}:00`,
      orders: hourStats[hour] || 0,
    }));

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="hour" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="orders" fill="#8884d8" name="Pedidos" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  switch (type) {
    case 'views-orders':
      return renderViewsOrdersChart();
    case 'revenue':
      return renderRevenueChart();
    case 'sales-trend':
      return renderSalesTrendChart();
    case 'product-performance':
      return renderProductPerformanceChart();
    case 'delivery-type':
      return renderDeliveryTypeChart();
    case 'peak-hours':
      return renderPeakHoursChart();
    default:
      return (
        <div className="h-64 flex items-center justify-center">
          <p className="text-gray-600">Tipo de gráfico não suportado</p>
        </div>
      );
  }
}
