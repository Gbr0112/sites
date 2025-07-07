import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Store, Bell, Plus, Globe, ShoppingCart, DollarSign, Eye } from "lucide-react";
import { Link } from "wouter";
import { ThemeToggle } from "@/components/theme-toggle";
import StatsCards from "@/components/dashboard/stats-cards";
import SiteCards from "@/components/dashboard/site-cards";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

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

  const { data: sites = [], isLoading: sitesLoading } = useQuery({
    queryKey: ["/api/sites"],
    enabled: isAuthenticated,
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

  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    enabled: isAuthenticated,
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

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background-alt flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <div className="min-h-screen bg-background-alt">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="bg-primary rounded-xl p-2">
                <Store className="text-white h-6 w-6" />
              </div>
              <h1 className="ml-3 text-2xl font-bold text-neutral">SiteBuilder Pro</h1>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-2">
                {user?.profileImageUrl && (
                  <img 
                    src={user.profileImageUrl} 
                    alt="Avatar" 
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
                <span className="text-sm font-medium text-neutral">
                  {user?.firstName || user?.email}
                </span>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Overview */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-neutral mb-2">Painel de Controle</h2>
          <p className="text-gray-600">Crie e gerencie sites de delivery profissionais em minutos</p>
        </div>

        {/* Stats Cards */}
        <StatsCards stats={stats} />

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Left Column - Quick Actions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Criar Novo Site</span>
                  <Link href="/builder">
                    <Button className="bg-primary hover:bg-primary/90">
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Site
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Escolha um template e crie seu site de delivery em poucos minutos.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg hover:border-primary cursor-pointer transition-colors">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <span className="text-2xl">🍓</span>
                    </div>
                    <span className="text-sm font-medium">Açaí</span>
                  </div>
                  <div className="text-center p-4 border rounded-lg hover:border-primary cursor-pointer transition-colors">
                    <div className="w-12 h-12 bg-red-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <span className="text-2xl">🍔</span>
                    </div>
                    <span className="text-sm font-medium">Lanches</span>
                  </div>
                  <div className="text-center p-4 border rounded-lg hover:border-primary cursor-pointer transition-colors">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <span className="text-2xl">🍕</span>
                    </div>
                    <span className="text-sm font-medium">Pizza</span>
                  </div>
                  <div className="text-center p-4 border rounded-lg hover:border-primary cursor-pointer transition-colors">
                    <div className="w-12 h-12 bg-pink-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <span className="text-2xl">🍰</span>
                    </div>
                    <span className="text-sm font-medium">Doces</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Recent Activity */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Atividade Recente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sites.slice(0, 3).map((site: any) => (
                    <div key={site.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <Store className="text-white h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{site.name}</p>
                          <p className="text-xs text-gray-600">
                            {site.isActive ? 'Ativo' : 'Inativo'}
                          </p>
                        </div>
                      </div>
                      <Link href={`/editor/${site.id}`}>
                        <Button variant="ghost" size="sm">
                          Editar
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dicas Rápidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-900">💡 Dica</p>
                    <p className="text-sm text-blue-700">
                      Configure seu WhatsApp para receber pedidos automaticamente
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-900">🚀 Melhore</p>
                    <p className="text-sm text-green-700">
                      Adicione fotos dos seus produtos para aumentar as vendas
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* My Sites Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-neutral">Meus Sites</h3>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon">
                <Globe className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <SiteCards sites={sites} isLoading={sitesLoading} />
        </div>
      </div>
    </div>
  );
}
