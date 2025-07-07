import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, ExternalLink, BarChart3, ShoppingBag, Eye, Zap } from "lucide-react";
import { Link } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SiteCardsProps {
  sites: any[];
  isLoading: boolean;
}

export default function SiteCards({ sites, isLoading }: SiteCardsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deployMutation = useMutation({
    mutationFn: (siteId: string) => apiRequest(`/api/sites/${siteId}/deploy`, {
      method: 'POST',
    }),
    onSuccess: (data) => {
      toast({
        title: "Deploy realizado com sucesso!",
        description: `Site disponível em: ${data.url}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sites"] });
    },
    onError: (error) => {
      toast({
        title: "Erro no deploy",
        description: "Não foi possível fazer o deploy do site.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                  <div className="w-24 h-4 bg-gray-300 rounded"></div>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-6 h-6 bg-gray-300 rounded"></div>
                  <div className="w-6 h-6 bg-gray-300 rounded"></div>
                </div>
              </div>
              <div className="w-full h-32 bg-gray-300 rounded-lg mb-3"></div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-4 bg-gray-300 rounded"></div>
                  <div className="w-16 h-4 bg-gray-300 rounded"></div>
                </div>
                <div className="w-16 h-6 bg-gray-300 rounded-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (sites.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <ShoppingBag className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Nenhum site criado ainda</h3>
          <p className="text-gray-600 mb-4">
            Crie seu primeiro site de delivery e comece a vender online
          </p>
          <Link href="/builder">
            <Button className="bg-primary hover:bg-primary/90">
              Criar Primeiro Site
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'açaí':
        return 'bg-purple-500';
      case 'burger':
      case 'hamburger':
        return 'bg-red-500';
      case 'pizza':
        return 'bg-yellow-500';
      case 'doces':
        return 'bg-pink-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getCategoryEmoji = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'açaí':
        return '🍓';
      case 'burger':
      case 'hamburger':
        return '🍔';
      case 'pizza':
        return '🍕';
      case 'doces':
        return '🍰';
      default:
        return '🍽️';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sites.map((site) => (
        <Card key={site.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 ${getCategoryColor(site.category || 'default')} rounded-full flex items-center justify-center`}>
                  <span className="text-sm">{getCategoryEmoji(site.category || 'default')}</span>
                </div>
                <span className="font-semibold text-sm">{site.name}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Link href={`/site-preview/${site.id}`}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href={`/editor/${site.id}`}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
                {site.netlifyUrl ? (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => window.open(site.netlifyUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => deployMutation.mutate(site.id)}
                    disabled={deployMutation.isPending}
                  >
                    <Zap className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            
            {/* Site Preview */}
            <div className="bg-gray-100 rounded-lg h-32 mb-3 flex items-center justify-center overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <span className="text-4xl opacity-50">
                  {getCategoryEmoji(site.category || 'default')}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <Link href={`/site-analytics/${site.id}`}>
                  <Button variant="ghost" size="sm" className="p-0 h-auto">
                    <BarChart3 className="h-4 w-4 mr-1" />
                    Analytics
                  </Button>
                </Link>
                <Link href={`/orders/${site.id}`}>
                  <Button variant="ghost" size="sm" className="p-0 h-auto">
                    <ShoppingBag className="h-4 w-4 mr-1" />
                    Pedidos
                  </Button>
                </Link>
              </div>
              <Badge variant={site.isActive ? "default" : "secondary"}>
                {site.isActive ? 'Ativo' : 'Pausado'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
