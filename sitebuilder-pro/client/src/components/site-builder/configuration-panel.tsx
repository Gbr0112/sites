import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

interface ConfigurationPanelProps {
  config: {
    name: string;
    whatsappNumber: string;
    address: string;
    slug: string;
  };
  onConfigChange: (config: any) => void;
}

export default function ConfigurationPanel({ config, onConfigChange }: ConfigurationPanelProps) {
  const handleInputChange = (field: string, value: string) => {
    onConfigChange({ ...config, [field]: value });
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (value: string) => {
    handleInputChange('name', value);
    if (!config.slug || config.slug === generateSlug(config.name)) {
      handleInputChange('slug', generateSlug(value));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="name">Nome do Site *</Label>
        <Input
          id="name"
          value={config.name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="Ex: Açaí do João"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="whatsapp">WhatsApp</Label>
        <Input
          id="whatsapp"
          value={config.whatsappNumber}
          onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
          placeholder="(11) 99999-9999"
          className="mt-1"
        />
        <p className="text-xs text-gray-500 mt-1">
          Número para receber os pedidos
        </p>
      </div>

      <div>
        <Label htmlFor="address">Endereço</Label>
        <Textarea
          id="address"
          value={config.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          placeholder="Rua das Palmeiras, 123 - Centro"
          className="mt-1 min-h-[80px]"
        />
      </div>

      <div>
        <Label htmlFor="slug">URL do Site *</Label>
        <div className="flex mt-1">
          <Input
            id="slug"
            value={config.slug}
            onChange={(e) => handleInputChange('slug', e.target.value)}
            placeholder="meu-site"
            className="rounded-r-none"
          />
          <span className="bg-gray-100 px-3 py-2 border border-l-0 border-gray-300 rounded-r-lg text-sm text-gray-600 min-w-[110px]">
            .netlify.app
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          URL onde seu site ficará disponível
        </p>
      </div>

      {config.slug && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Prévia da URL</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-mono">
                https://{config.slug}.netlify.app
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(`https://${config.slug}.netlify.app`, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="pt-4 border-t">
        <h4 className="font-medium mb-2">Próximos Passos</h4>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-start space-x-2">
            <span className="w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-xs font-medium">1</span>
            <span>Criar site com template escolhido</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="w-5 h-5 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-xs font-medium">2</span>
            <span>Personalizar produtos e preços</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="w-5 h-5 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-xs font-medium">3</span>
            <span>Publicar site no Netlify</span>
          </div>
        </div>
      </div>
    </div>
  );
}
