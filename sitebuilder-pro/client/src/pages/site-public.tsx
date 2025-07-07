import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  MapPin, 
  Clock, 
  Star,
  Phone,
  Copy,
  QrCode,
  CreditCard
} from "lucide-react";

interface CartItem {
  id: number;
  name: string;
  price: string;
  quantity: number;
  observations?: string;
}

export default function SitePublic() {
  const [, params] = useRoute("/s/:slug");
  const [, previewParams] = useRoute("/preview/:id");
  const slug = params?.slug;
  const previewId = previewParams?.id;
  const { toast } = useToast();
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    address: "",
    observations: "",
  });
  const [showCart, setShowCart] = useState(false);
  const [showPixPayment, setShowPixPayment] = useState(false);
  const [pixCode, setPixCode] = useState("");

  // Fetch site data
  const { data, isLoading } = useQuery({
    queryKey: slug ? ["/api/public/sites", slug] : ["/api/sites", previewId],
    enabled: !!(slug || previewId),
  });

  const site = data?.site;
  const products = data?.products || [];

  // Track view on mount
  useEffect(() => {
    if (site?.id && !previewId) {
      apiRequest(`/api/sites/${site.id}/track-view`, { method: 'POST' }).catch(() => {});
    }
  }, [site?.id, previewId]);

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === productId);
      if (existing && existing.quantity > 1) {
        return prev.map(item =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
      return prev.filter(item => item.id !== productId);
    });
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);
  };

  const generatePixCode = (amount: number) => {
    if (!site?.pixKey) return "";
    // Simplified PIX code generation
    const pixCode = `00020126580014BR.GOV.BCB.PIX0136${site.pixKey}52040000530398654${amount.toFixed(2)}5802BR5925${site.name}6009SAO PAULO62070503***6304`;
    return pixCode;
  };

  const copyPixCode = async () => {
    const total = getTotalPrice();
    const code = generatePixCode(total);
    setPixCode(code);
    await navigator.clipboard.writeText(code);
    toast({
      title: "Código PIX copiado!",
      description: "Cole no aplicativo do seu banco para pagar",
    });
  };

  const sendWhatsAppOrder = () => {
    if (!site?.whatsappNumber) {
      toast({
        title: "WhatsApp não configurado",
        description: "Entre em contato diretamente com o estabelecimento",
        variant: "destructive"
      });
      return;
    }

    const orderDetails = cart.map((item, index) => 
      `${index + 1}. *${item.name}*\n` +
      `   Qtd: ${item.quantity}x | Valor: R$ ${parseFloat(item.price).toFixed(2)}\n` +
      `   Subtotal: R$ ${(parseFloat(item.price) * item.quantity).toFixed(2)}` +
      `${item.observations ? `\n   📝 _${item.observations}_` : ''}`
    ).join('\n\n');

    const total = getTotalPrice();
    const currentDate = new Date().toLocaleDateString('pt-BR');
    const currentTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    const message = 
      `🏪 *${site.name.toUpperCase()}* 🏪\n` +
      `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      
      `📦 *NOVO PEDIDO #${Date.now().toString().slice(-6)}*\n` +
      `📅 ${currentDate} às ${currentTime}\n\n` +
      
      `👤 *DADOS DO CLIENTE*\n` +
      `▸ Nome: ${customerInfo.name}\n` +
      `▸ Telefone: ${customerInfo.phone}\n` +
      `▸ Endereço: ${customerInfo.address}\n\n` +
      
      `🛒 *ITENS DO PEDIDO*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━\n` +
      `${orderDetails}\n\n` +
      
      `💰 *RESUMO FINANCEIRO*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━\n` +
      `🔸 Subtotal: R$ ${total.toFixed(2)}\n` +
      `🔸 Taxa de entrega: A combinar\n` +
      `🔸 *TOTAL: R$ ${total.toFixed(2)}*\n\n` +
      
      `${customerInfo.observations ? 
        `📝 *OBSERVAÇÕES*\n━━━━━━━━━━━━━━━━━━━━━━\n_${customerInfo.observations}_\n\n` : 
        ''
      }` +
      
      `💳 *FORMAS DE PAGAMENTO*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━\n` +
      `💵 Dinheiro | 💳 Cartão` +
      `${site.pixKey ? `\n🔸 *PIX:* ${site.pixKey}` : ''}\n\n` +
      
      `✅ *Confirme o pedido para continuarmos!*\n` +
      `🚚 Tempo estimado: 30-45 minutos`;

    const whatsappUrl = `https://wa.me/${site.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Site não encontrado</h1>
          <p className="text-gray-600">O site que você está procurando não existe ou foi desativado.</p>
        </div>
      </div>
    );
  }

  const primaryColor = site.config?.primaryColor || "#FF6B35";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: primaryColor }}
              >
                {site.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{site.name}</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span>4.8</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>30-45 min</span>
                  </div>
                </div>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              className="relative"
              onClick={() => setShowCart(true)}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Carrinho ({cart.length})
              {cart.length > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </Badge>
              )}
            </Button>
          </div>
          
          {site.address && (
            <div className="mt-3 flex items-center space-x-1 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{site.address}</span>
            </div>
          )}
        </div>
      </header>

      {/* Products */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product: any) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-4xl">🍽️</span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                  {product.description && (
                    <p className="text-sm text-gray-600 mb-3">{product.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span 
                      className="text-xl font-bold"
                      style={{ color: primaryColor }}
                    >
                      R$ {parseFloat(product.price).toFixed(2)}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => addToCart(product)}
                      style={{ backgroundColor: primaryColor }}
                      className="hover:opacity-90"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:items-center justify-center p-4">
          <div className="bg-white rounded-t-3xl md:rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Seu Pedido</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowCart(false)}>
                  Fechar
                </Button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Seu carrinho está vazio</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-gray-600">
                            R$ {parseFloat(item.price).toFixed(2)} each
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => addToCart(item)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-6" />

                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium mb-1">Nome *</label>
                      <Input
                        value={customerInfo.name}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Seu nome completo"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Telefone *</label>
                      <Input
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Endereço de entrega *</label>
                      <Textarea
                        value={customerInfo.address}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Rua, número, complemento, bairro"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Observações</label>
                      <Textarea
                        value={customerInfo.observations}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, observations: e.target.value }))}
                        placeholder="Observações sobre o pedido"
                        rows={2}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xl font-bold">
                      <span>Total:</span>
                      <span style={{ color: primaryColor }}>
                        R$ {getTotalPrice().toFixed(2)}
                      </span>
                    </div>

                    {site.pixKey && (
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setShowPixPayment(!showPixPayment)}
                        >
                          <CreditCard className="h-4 w-4 mr-2" />
                          Pagar com PIX
                        </Button>
                        
                        {showPixPayment && (
                          <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                            <div className="text-center">
                              <QrCode className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                              <p className="text-sm font-medium">Código PIX</p>
                              <p className="text-xs text-gray-600">
                                R$ {getTotalPrice().toFixed(2)}
                              </p>
                            </div>
                            
                            <div className="bg-white p-3 rounded border">
                              <code className="text-xs break-all">
                                {pixCode || generatePixCode(getTotalPrice()).substring(0, 50) + "..."}
                              </code>
                            </div>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={copyPixCode}
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copiar código PIX
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    <Button
                      className="w-full"
                      style={{ backgroundColor: primaryColor }}
                      onClick={sendWhatsAppOrder}
                      disabled={!customerInfo.name || !customerInfo.phone || !customerInfo.address}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Finalizar no WhatsApp
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}