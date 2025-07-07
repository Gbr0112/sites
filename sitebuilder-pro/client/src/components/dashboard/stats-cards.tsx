import { Card, CardContent } from "@/components/ui/card";
import { Globe, ShoppingCart, DollarSign, Eye } from "lucide-react";

interface StatsCardsProps {
  stats?: {
    totalSites: number;
    totalOrders: number;
    totalRevenue: number;
    totalViews: number;
  };
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sites Criados</p>
              <p className="text-2xl font-bold text-neutral">
                {stats?.totalSites || 0}
              </p>
            </div>
            <div className="bg-primary/10 rounded-lg p-3">
              <Globe className="text-primary h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium">+2</span>
            <span className="text-gray-600 ml-1">este mês</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Pedidos</p>
              <p className="text-2xl font-bold text-neutral">
                {stats?.totalOrders || 0}
              </p>
            </div>
            <div className="bg-secondary/10 rounded-lg p-3">
              <ShoppingCart className="text-secondary h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium">+12%</span>
            <span className="text-gray-600 ml-1">vs mês passado</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Faturamento Total</p>
              <p className="text-2xl font-bold text-neutral">
                {formatCurrency(stats?.totalRevenue || 0)}
              </p>
            </div>
            <div className="bg-accent/10 rounded-lg p-3">
              <DollarSign className="text-accent h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium">+5.2%</span>
            <span className="text-gray-600 ml-1">este mês</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Visualizações</p>
              <p className="text-2xl font-bold text-neutral">
                {stats?.totalViews || 0}
              </p>
            </div>
            <div className="bg-purple-100 rounded-lg p-3">
              <Eye className="text-purple-600 h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium">+8.1%</span>
            <span className="text-gray-600 ml-1">esta semana</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
