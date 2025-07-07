import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import TemplateSelector from "@/components/site-builder/template-selector";
import SitePreview from "@/components/site-builder/site-preview";
import ConfigurationPanel from "@/components/site-builder/configuration-panel";

export default function SiteBuilder() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [siteConfig, setSiteConfig] = useState({
    name: "",
    whatsappNumber: "",
    address: "",
    slug: "",
  });

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

  const { data: templates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ["/api/templates"],
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

  const createSiteMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/sites", data);
      return response.json();
    },
    onSuccess: (newSite) => {
      toast({
        title: "Site criado com sucesso!",
        description: `Seu site ${newSite.name} foi criado e está pronto para ser editado.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sites"] });
      setLocation(`/editor/${newSite.id}`);
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
        title: "Erro ao criar site",
        description: "Tente novamente em alguns momentos.",
        variant: "destructive",
      });
    },
  });

  const handleCreateSite = () => {
    if (!selectedTemplate) {
      toast({
        title: "Selecione um template",
        description: "Escolha um template para continuar.",
        variant: "destructive",
      });
      return;
    }

    if (!siteConfig.name || !siteConfig.slug) {
      toast({
        title: "Preencha os campos obrigatórios",
        description: "Nome do site e URL são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    createSiteMutation.mutate({
      templateId: selectedTemplate.id,
      name: siteConfig.name,
      slug: siteConfig.slug,
      whatsappNumber: siteConfig.whatsappNumber,
      address: siteConfig.address,
      config: {
        ...selectedTemplate.config,
        customization: {
          name: siteConfig.name,
          whatsappNumber: siteConfig.whatsappNumber,
          address: siteConfig.address,
        },
      },
    });
  };

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
              <h1 className="ml-3 text-2xl font-bold text-neutral">Criar Novo Site</h1>
            </div>
            <Button 
              onClick={handleCreateSite}
              disabled={createSiteMutation.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {createSiteMutation.isPending ? "Criando..." : "Criar Site"}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Template Selection */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Escolha um Template</CardTitle>
              </CardHeader>
              <CardContent>
                <TemplateSelector
                  templates={templates}
                  selectedTemplate={selectedTemplate}
                  onSelectTemplate={setSelectedTemplate}
                  isLoading={templatesLoading}
                />
              </CardContent>
            </Card>

            {/* Site Preview */}
            {selectedTemplate && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Prévia do Site</CardTitle>
                </CardHeader>
                <CardContent>
                  <SitePreview
                    template={selectedTemplate}
                    config={siteConfig}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Configuration */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Configurações</CardTitle>
              </CardHeader>
              <CardContent>
                <ConfigurationPanel
                  config={siteConfig}
                  onConfigChange={setSiteConfig}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
