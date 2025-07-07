import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Store, ArrowLeft, TrendingUp, Eye, ShoppingCart, DollarSign, Calendar } from "lucide-react";
import { Link, useRoute } from "wouter";
import AnalyticsCharts from "@/components/analytics/analytics-charts";

export default function Analytics() {
  const [, params] = useRoute("/analytics/:siteId");
  const siteId = params?.siteId;
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState("7d");

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const getDateRangeParams = () => {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (dateRange) {
      case "1d":
        startDate.setDate(endDate.getDate() - 1);
        break;
      case "7d":
        startDate.setDate(endDate.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(endDate.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 7);
    }
    
    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
  };

  const { data: site, isLoading: siteLoading } = useQuery({
    queryKey: ["/api/sites", siteId],
    enabled: isAuthenticated && !!siteId,
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
      }
    },
  });

  const { data: analytics = [], isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/sites", siteId, "analytics", dateRange],
    queryFn: async () => {
      const { startDate, endDate } = getDateRangeParams();
      const response = await fetch(
        `/api/sites/${siteId}/analytics?startDate=${startDate}&endDate=${endDate}`,
        { credentials: "include" }
      );
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return response.json();
    },
    enabled: isAuthenticated && !!siteId,
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
      }
    },
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["/api/sites", siteId, "orders"],
    enabled: isAuthenticated && !!siteId,
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
      }
    },
  });

  if (isLoading || !isAuthenticated || siteLoading) {
    return (
      <div className="min-h-screen bg-background-alt flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando analytics...</p>
        </div>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="min-h-screen bg-background-alt flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold text-neutral mb-2">Site não encontrado</h1>
            <p className="text-gray-600 mb-4">
              O site que você está tentando acessar não existe ou você não tem permissão.
            </p>
            <Link href="/">
              <Button>Voltar ao Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate summary metrics
  const totalViews = analytics.reduce((sum: number, item: any) => sum + (item.views || 0), 0);
  const totalOrders = analytics.reduce((sum: number, item: any) => sum + (item.orders || 0), 0);
  const totalRevenue = analytics.reduce((sum: number, item: any) => sum + parseFloat(item.revenue || 0), 0);
  const avgConversionRate = analytics.length > 0 
    ? analytics.reduce((sum: number, item: any) => sum + parseFloat(item.conversionRate || 0), 0) / analytics.length
    : 0;

  // Get today's data
  const today = new Date().toDateString();
  const todayOrders = orders.filter((order: any) => 
    new Date(order.createdAt).toDateString() === today
  );
  const todayRevenue = todayOrders.reduce((sum: number, order: any) => 
    sum + parseFloat(order.totalAmount), 0
  );

  // Get product performance
  const productStats = orders.reduce((acc: any, order: any) => {
    const items = Array.isArray(order.items) ? order.items : [];
    items.forEach((item: any) => {
      if (!acc[item.name]) {
        acc[item.name] = { quantity: 0, revenue: 0 };
      }
      acc[item.name].quantity += item.quantity || 1;
      acc[item.name].revenue += (item.price || 0) * (item.quantity || 1);
    });
    return acc;
  }, {});

  const topProducts = Object.entries(productStats)
    .map(([name, stats]: [string, any]) => ({ name, ...stats }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-background-alt">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/">
                <Button variant="ghost" size="icon" className="mr-2">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="bg-primary rounded-xl p-2">
                <Store className="text-white h-6 w-6" />
              </div>
              <div className="ml-3">
                <h1 className="text-2xl font-bold text-neutral">Analytics - {site.name}</h1>
                <p className="text-sm text-gray-600">{site.slug}.netlify.app</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">Últimas 24 horas</SelectItem>
                  <SelectItem value="7d">Últimos 7 dias</SelectItem>
                  <SelectItem value="30d">Últimos 30 dias</SelectItem>
                  <SelectItem value="90d">Últimos 90 dias</SelectItem>
                </SelectContent>
              </Select>
              <Link href={`/editor/${siteId}`}>
                <Button variant="outline">
                  Editar Site
                </Button>
              </Link>
              <Link href={`/orders/${siteId}`}>
                <Button variant="outline">
                  Pedidos
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Visualizações</p>
                  <p className="text-2xl font-bold text-neutral">{totalViews}</p>
                </div>
                <div className="bg-blue-100 rounded-lg p-3">
                  <Eye className="text-blue-600 h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-green-600 font-medium">↗ +12%</span>
                <span className="text-gray-600 ml-1">vs período anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pedidos</p>
                  <p className="text-2xl font-bold text-neutral">{totalOrders}</p>
                </div>
                <div className="bg-green-100 rounded-lg p-3">
                  <ShoppingCart className="text-green-600 h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-green-600 font-medium">↗ +8%</span>
                <span className="text-gray-600 ml-1">vs período anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Faturamento</p>
                  <p className="text-2xl font-bold text-neutral">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(totalRevenue)}
                  </p>
                </div>
                <div className="bg-yellow-100 rounded-lg p-3">
                  <DollarSign className="text-yellow-600 h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-green-600 font-medium">↗ +15%</span>
                <span className="text-gray-600 ml-1">vs período anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Taxa de Conversão</p>
                  <p className="text-2xl font-bold text-neutral">
                    {avgConversionRate.toFixed(1)}%
                  </p>
                </div>
                <div className="bg-purple-100 rounded-lg p-3">
                  <TrendingUp className="text-purple-600 h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-green-600 font-medium">↗ +3%</span>
                <span className="text-gray-600 ml-1">vs período anterior</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Detailed Analytics */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="sales">Vendas</TabsTrigger>
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="customers">Clientes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Visualizações vs Pedidos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AnalyticsCharts
                    data={analytics}
                    type="views-orders"
                    isLoading={analyticsLoading}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Faturamento por Dia
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AnalyticsCharts
                    data={analytics}
                    type="revenue"
                    isLoading={analyticsLoading}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sales" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Vendas por Período</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AnalyticsCharts
                      data={analytics}
                      type="sales-trend"
                      isLoading={analyticsLoading}
                    />
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Resumo de Hoje</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Pedidos Hoje</span>
                      <span className="font-bold">{todayOrders.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Faturamento Hoje</span>
                      <span className="font-bold">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(todayRevenue)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Ticket Médio</span>
                      <span className="font-bold">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(todayOrders.length > 0 ? todayRevenue / todayOrders.length : 0)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Produtos Mais Vendidos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topProducts.length > 0 ? (
                      topProducts.map((product, index) => (
                        <div key={product.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-sm">{index + 1}</span>
                            </div>
                            <div>
                              <p className="font-medium text-sm">{product.name}</p>
                              <p className="text-xs text-gray-600">{product.quantity} vendidos</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm">
                              {new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                              }).format(product.revenue)}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Nenhuma venda registrada ainda</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance de Produtos</CardTitle>
                </CardHeader>
                <CardContent>
                  <AnalyticsCharts
                    data={topProducts}
                    type="product-performance"
                    isLoading={analyticsLoading}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="customers" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Clientes por Tipo de Entrega</CardTitle>
                </CardHeader>
                <CardContent>
                  <AnalyticsCharts
                    data={orders}
                    type="delivery-type"
                    isLoading={analyticsLoading}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Horários de Pico</CardTitle>
                </CardHeader>
                <CardContent>
                  <AnalyticsCharts
                    data={orders}
                    type="peak-hours"
                    isLoading={analyticsLoading}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
