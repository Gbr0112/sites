import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Store, ArrowLeft, ShoppingBag, Phone, MapPin, Clock } from "lucide-react";
import { Link, useRoute } from "wouter";
import OrderList from "@/components/orders/order-list";

export default function Orders() {
  const [, params] = useRoute("/orders/:siteId");
  const siteId = params?.siteId;
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState("all");

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

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/sites", siteId, "orders"],
    enabled: isAuthenticated && !!siteId,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
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

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const response = await apiRequest("PUT", `/api/orders/${orderId}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Status atualizado!",
        description: "O status do pedido foi atualizado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sites", siteId, "orders"] });
    },
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
        return;
      }
      toast({
        title: "Erro ao atualizar status",
        description: "Tente novamente em alguns momentos.",
        variant: "destructive",
      });
    },
  });

  if (isLoading || !isAuthenticated || siteLoading) {
    return (
      <div className="min-h-screen bg-background-alt flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando pedidos...</p>
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

  const filteredOrders = orders.filter((order: any) => {
    if (statusFilter === "all") return true;
    return order.status === statusFilter;
  });

  const getStatusCounts = () => {
    const counts = orders.reduce((acc: any, order: any) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});
    
    return {
      new: counts.new || 0,
      preparing: counts.preparing || 0,
      ready: counts.ready || 0,
      delivered: counts.delivered || 0,
      cancelled: counts.cancelled || 0,
    };
  };

  const statusCounts = getStatusCounts();
  const totalOrders = orders.length;
  const todayRevenue = orders
    .filter((order: any) => {
      const orderDate = new Date(order.createdAt);
      const today = new Date();
      return orderDate.toDateString() === today.toDateString();
    })
    .reduce((total: number, order: any) => total + parseFloat(order.totalAmount), 0);

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
                <h1 className="text-2xl font-bold text-neutral">Pedidos - {site.name}</h1>
                <p className="text-sm text-gray-600">{site.slug}.netlify.app</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Link href={`/editor/${siteId}`}>
                <Button variant="outline">
                  Editar Site
                </Button>
              </Link>
              <Link href={`/analytics/${siteId}`}>
                <Button variant="outline">
                  Analytics
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Pedidos</p>
                  <p className="text-2xl font-bold text-neutral">{totalOrders}</p>
                </div>
                <div className="bg-primary/10 rounded-lg p-3">
                  <ShoppingBag className="text-primary h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Novos Pedidos</p>
                  <p className="text-2xl font-bold text-neutral">{statusCounts.new}</p>
                </div>
                <div className="bg-blue-100 rounded-lg p-3">
                  <Clock className="text-blue-600 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Em Preparo</p>
                  <p className="text-2xl font-bold text-neutral">{statusCounts.preparing}</p>
                </div>
                <div className="bg-yellow-100 rounded-lg p-3">
                  <Clock className="text-yellow-600 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Faturamento Hoje</p>
                  <p className="text-2xl font-bold text-neutral">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(todayRevenue)}
                  </p>
                </div>
                <div className="bg-green-100 rounded-lg p-3">
                  <Store className="text-green-600 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <ShoppingBag className="h-5 w-5 mr-2" />
                Gerenciar Pedidos
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os pedidos</SelectItem>
                    <SelectItem value="new">Novos ({statusCounts.new})</SelectItem>
                    <SelectItem value="preparing">Em preparo ({statusCounts.preparing})</SelectItem>
                    <SelectItem value="ready">Prontos ({statusCounts.ready})</SelectItem>
                    <SelectItem value="delivered">Entregues ({statusCounts.delivered})</SelectItem>
                    <SelectItem value="cancelled">Cancelados ({statusCounts.cancelled})</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <OrderList
              orders={filteredOrders}
              isLoading={ordersLoading}
              onUpdateStatus={(orderId, status) =>
                updateOrderStatusMutation.mutate({ orderId, status })
              }
              site={site}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
