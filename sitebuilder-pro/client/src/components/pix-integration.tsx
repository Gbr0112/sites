import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, QrCode, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PIXIntegrationProps {
  site: any;
  onUpdate: (pixData: { pixKey: string; pixKeyType: string }) => void;
}

export function PIXIntegration({ site, onUpdate }: PIXIntegrationProps) {
  const [pixKey, setPixKey] = useState(site?.pixKey || '');
  const [pixKeyType, setPixKeyType] = useState(site?.pixKeyType || 'cpf');
  const [showQRCode, setShowQRCode] = useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    onUpdate({ pixKey, pixKeyType });
    toast({
      title: "PIX configurado com sucesso!",
      description: "Seus clientes agora podem pagar via PIX",
    });
  };

  const generatePixCode = (amount: number = 50) => {
    // Simplified PIX code generation (in production, use a proper PIX library)
    const pixCode = `00020126580014BR.GOV.BCB.PIX0136${pixKey}52040000530398654${amount.toFixed(2)}5802BR5925${site?.name || 'Estabelecimento'}6009SAO PAULO62070503***6304`;
    return pixCode;
  };

  const copyPixCode = async (amount: number = 50) => {
    const pixCode = generatePixCode(amount);
    await navigator.clipboard.writeText(pixCode);
    toast({
      title: "Código PIX copiado!",
      description: "Cole no aplicativo do seu banco",
    });
  };

  const abbreviatePixCode = (code: string) => {
    return code.length > 50 ? `${code.substring(0, 25)}...${code.substring(code.length - 20)}` : code;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Integração PIX
        </CardTitle>
        <CardDescription>
          Configure sua chave PIX para receber pagamentos (opcional)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="pixKeyType">Tipo da Chave PIX</Label>
            <Select value={pixKeyType} onValueChange={setPixKeyType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cpf">CPF</SelectItem>
                <SelectItem value="cnpj">CNPJ</SelectItem>
                <SelectItem value="email">E-mail</SelectItem>
                <SelectItem value="phone">Telefone</SelectItem>
                <SelectItem value="random">Chave Aleatória</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="pixKey">Chave PIX</Label>
            <Input
              id="pixKey"
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
              placeholder="Digite sua chave PIX"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={!pixKey}>
            Salvar Configuração
          </Button>
          
          {pixKey && (
            <Button variant="outline" onClick={() => setShowQRCode(!showQRCode)}>
              <QrCode className="h-4 w-4 mr-2" />
              {showQRCode ? 'Ocultar' : 'Testar'} PIX
            </Button>
          )}
        </div>

        {showQRCode && pixKey && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-semibold mb-2">Teste de Pagamento PIX</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Código PIX para R$ 50,00 (exemplo):
            </p>
            
            <div className="flex items-center gap-2 mb-3">
              <code className="bg-white dark:bg-gray-900 p-2 rounded text-xs flex-1 font-mono">
                {abbreviatePixCode(generatePixCode(50))}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyPixCode(50)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="text-xs text-gray-500 dark:text-gray-400">
              * No site do cliente, o código será gerado automaticamente com o valor do pedido
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}