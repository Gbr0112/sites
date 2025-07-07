import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Eye, Settings, BarChart3, Copy, Check } from "lucide-react";
import { useState } from "react";

export default function SitePreview() {
  const { id } = useParams<{ id: string }>();
  const [copied, setCopied] = useState(false);

  const { data: site, isLoading: siteLoading } = useQuery({
    queryKey: ["/api/sites", id],
  });

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["/api/sites", id, "products"],
  });

  const { data: template, isLoading: templateLoading } = useQuery({
    queryKey: ["/api/templates", site?.templateId],
    enabled: !!site?.templateId,
  });

  if (siteLoading || templateLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Site não encontrado</h1>
          <p className="text-muted-foreground">O site que você está procurando não existe.</p>
        </div>
      </div>
    );
  }

  const generatePreviewHtml = () => {
    if (!template) return "";
    
    let html = template.htmlContent || "";
    
    // Replace template variables
    html = html.replace(/\{\{siteName\}\}/g, site.name);
    html = html.replace(/\{\{siteDescription\}\}/g, site.config?.description || "");
    html = html.replace(/\{\{address\}\}/g, site.address || "");
    html = html.replace(/\{\{whatsappNumber\}\}/g, site.whatsappNumber || "");
    
    // Add products data
    if (products && products.length > 0) {
      const productsHtml = products.map(product => `
        <div class="product-card">
          <img src="${product.imageUrl || "https://via.placeholder.com/300x200"}" alt="${product.name}">
          <h3>${product.name}</h3>
          <p>${product.description}</p>
          <div class="product-price">R$ ${product.price}</div>
          <button class="order-btn" onclick="orderProduct('${product.name}', '${product.price}')">
            Pedir via WhatsApp
          </button>
        </div>
      `).join("");
      
      html = html.replace('<div class="products-grid" id="products"></div>', 
        `<div class="products-grid" id="products">${productsHtml}</div>`);
    }
    
    // Add CSS and JS
    html = html.replace('<link rel="stylesheet" href="styles.css">', 
      `<style>${template.cssContent || ""}</style>`);
    html = html.replace('<script src="script.js"></script>', 
      `<script>${template.jsContent || ""}</script>`);
    
    return html;
  };

  const copyUrl = () => {
    const url = `${window.location.origin}/preview/${site.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const siteUrl = site.netlifyUrl || `${window.location.origin}/preview/${site.id}`;

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Site Info Panel */}
        <div className="w-full lg:w-1/3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                {site.name}
              </CardTitle>
              <CardDescription>
                Preview do seu site
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge variant={site.isActive ? "default" : "secondary"}>
                  {site.isActive ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Slug</p>
                <p className="text-sm">{site.slug}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">WhatsApp</p>
                <p className="text-sm">{site.whatsappNumber || "Não configurado"}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Endereço</p>
                <p className="text-sm">{site.address || "Não configurado"}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">URL do Site</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm truncate flex-1">{siteUrl}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyUrl}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button asChild className="w-full">
                  <a href={siteUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Abrir Site
                  </a>
                </Button>
                
                <Button variant="outline" asChild className="w-full">
                  <a href={`/site-editor/${site.id}`}>
                    <Settings className="h-4 w-4 mr-2" />
                    Editar Site
                  </a>
                </Button>
                
                <Button variant="outline" asChild className="w-full">
                  <a href={`/site-analytics/${site.id}`}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Ver Analytics
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Preview Panel */}
        <div className="w-full lg:w-2/3">
          <Card>
            <CardHeader>
              <CardTitle>Preview do Site</CardTitle>
              <CardDescription>
                Veja como seu site aparece para os clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <Skeleton className="h-96 w-full" />
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <iframe
                    srcDoc={generatePreviewHtml()}
                    className="w-full h-96"
                    title="Site Preview"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}