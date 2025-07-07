import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Store, ArrowLeft, Save, Rocket, Settings, ShoppingBag } from "lucide-react";
import { Link, useRoute } from "wouter";
import { PIXIntegration } from "@/components/pix-integration";

export default function SiteEditor() {
  const [, params] = useRoute("/editor/:siteId");
  const siteId = params?.siteId;
  const { isAuthenticated, isLoading } = useAuth();
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

  const { data: products = [] } = useQuery({
    queryKey: ["/api/sites", siteId, "products"],
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

  const updateSiteMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", `/api/sites/${siteId}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Site atualizado!",
        description: "As alterações foram salvas com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sites", siteId] });
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
        title: "Erro ao atualizar site",
        description: "Tente novamente em alguns momentos.",
        variant: "destructive",
      });
    },
  });

  const handleSaveSite = () => {
    if (!site) return;
    
    updateSiteMutation.mutate({
      name: site.name,
      whatsappNumber: site.whatsappNumber,
      address: site.address,
      config: site.config,
    });
  };

  const handlePublishSite = () => {
    toast({
      title: "Site publicado!",
      description: `Seu site está disponível em: https://${site.slug}.netlify.app`,
    });
    
    // Simulate Netlify deployment
    setTimeout(() => {
      window.open(`https://${site.slug}.netlify.app`, '_blank');
    }, 1000);
  };

  if (isLoading || !isAuthenticated || siteLoading) {
    return (
      <div className="min-h-screen bg-background-alt flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando editor...</p>
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
              O site que você está tentando editar não existe ou você não tem permissão para acessá-lo.
            </p>
            <Link href="/">
              <Button>Voltar ao Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                <h1 className="text-2xl font-bold text-neutral">{site.name}</h1>
                <p className="text-sm text-gray-600">{site.slug}.netlify.app</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={handleSaveSite}
                disabled={updateSiteMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {updateSiteMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
              <Button
                onClick={handlePublishSite}
                className="bg-primary hover:bg-primary/90"
              >
                <Rocket className="h-4 w-4 mr-2" />
                Publicar
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="design" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="design">Design</TabsTrigger>
            <TabsTrigger value="products">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Produtos ({products.length})
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </TabsTrigger>
            <TabsTrigger value="pix">PIX</TabsTrigger>
            <TabsTrigger value="preview">Prévia</TabsTrigger>
          </TabsList>

          <TabsContent value="design" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Personalização Visual</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cor Principal
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={site.config?.primaryColor || "#FF6B35"}
                          className="w-12 h-8 rounded border border-gray-300"
                        />
                        <span className="text-sm text-gray-600">
                          {site.config?.primaryColor || "#FF6B35"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cor Secundária
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={site.config?.secondaryColor || "#4ECDC4"}
                          className="w-12 h-8 rounded border border-gray-300"
                        />
                        <span className="text-sm text-gray-600">
                          {site.config?.secondaryColor || "#4ECDC4"}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Prévia em Tempo Real</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="max-w-xs mx-auto bg-white rounded-lg shadow-sm p-4">
                      <div className="flex items-center space-x-3 mb-4">
                        <div 
                          className="w-8 h-8 rounded-full"
                          style={{ backgroundColor: site.config?.primaryColor || "#FF6B35" }}
                        ></div>
                        <div>
                          <h4 className="font-bold text-sm">{site.name}</h4>
                          <p className="text-xs text-gray-600">Delivery Online</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-16 bg-gray-100 rounded"></div>
                        <div className="h-16 bg-gray-100 rounded"></div>
                      </div>
                      <button
                        className="w-full mt-3 py-2 text-white text-sm font-medium rounded"
                        style={{ backgroundColor: site.config?.primaryColor || "#FF6B35" }}
                      >
                        Fazer Pedido
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Produtos do Cardápio</span>
                  <Button className="bg-primary hover:bg-primary/90">
                    Adicionar Produto
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {products.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Nenhum produto cadastrado
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Adicione produtos ao seu cardápio para que os clientes possam fazer pedidos.
                    </p>
                    <Button className="bg-primary hover:bg-primary/90">
                      Adicionar Primeiro Produto
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((product: any) => (
                      <Card key={product.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <ShoppingBag className="h-8 w-8 text-gray-400" />
                            )}
                          </div>
                          <h4 className="font-semibold text-sm mb-1">{product.name}</h4>
                          <p className="text-xs text-gray-600 mb-2">{product.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-primary">
                              R$ {parseFloat(product.price).toFixed(2)}
                            </span>
                            <Button variant="ghost" size="sm">
                              Editar
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Básicas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome do Site
                      </label>
                      <input
                        type="text"
                        value={site.name}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        WhatsApp
                      </label>
                      <input
                        type="text"
                        value={site.whatsappNumber || ""}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Endereço
                      </label>
                      <textarea
                        value={site.address || ""}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        rows={3}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Configurações Avançadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        URL do Site
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          value={site.slug}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        <span className="bg-gray-100 px-3 py-2 border border-l-0 border-gray-300 rounded-r-lg text-sm text-gray-600">
                          .netlify.app
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={site.isActive}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor="isActive" className="text-sm text-gray-700">
                        Site ativo (visível para clientes)
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="pix" className="mt-6">
            <PIXIntegration 
              site={site} 
              onUpdate={(pixData) => {
                updateSiteMutation.mutate({
                  id: siteId,
                  ...pixData
                });
              }}
            />
          </TabsContent>

          <TabsContent value="preview" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Prévia do Site</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: site.config?.primaryColor || "#FF6B35" }}
                        >
                          <span className="text-white font-bold">
                            {site?.name?.charAt(0)?.toUpperCase() || 'S'}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-bold text-lg">{site.name}</h4>
                          <p className="text-sm text-gray-600">Delivery Online</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-yellow-400">★</span>
                        <span className="text-sm font-medium">4.8</span>
                      </div>
                    </div>

                    {site.address && (
                      <div className="mb-4 p-2 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">{site.address}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {products.slice(0, 4).map((product: any) => (
                        <div key={product.id} className="bg-gray-50 rounded-lg p-3">
                          <div className="w-full h-16 bg-gray-200 rounded-lg mb-2"></div>
                          <h5 className="font-semibold text-sm">{product.name}</h5>
                          <p className="text-sm" style={{ color: site.config?.primaryColor || "#FF6B35" }}>
                            R$ {parseFloat(product.price).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>

                    <button
                      className="w-full py-3 text-white rounded-lg font-semibold"
                      style={{ backgroundColor: site.config?.primaryColor || "#FF6B35" }}
                    >
                      🍃 Fazer Pedido
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
