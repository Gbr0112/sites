import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Phone, MapPin, Clock, ShoppingBag, MessageCircle } from "lucide-react";

interface OrderListProps {
  orders: any[];
  isLoading: boolean;
  onUpdateStatus: (orderId: string, status: string) => void;
  site: any;
}

export default function OrderList({ orders, isLoading, onUpdateStatus, site }: OrderListProps) {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-600';
      case 'preparing':
        return 'bg-yellow-100 text-yellow-600';
      case 'ready':
        return 'bg-green-100 text-green-600';
      case 'delivered':
        return 'bg-gray-100 text-gray-600';
      case 'cancelled':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new':
        return 'Novo';
      case 'preparing':
        return 'Preparando';
      case 'ready':
        return 'Pronto';
      case 'delivered':
        return 'Entregue';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const sendWhatsAppMessage = (order: any) => {
    if (!site.whatsappNumber) {
      alert('Número do WhatsApp não configurado');
      return;
    }

    const items = Array.isArray(order.items) ? order.items : [];
    const itemsText = items.map((item: any) => 
      `${item.quantity || 1}x ${item.name} - R$ ${(item.price || 0).toFixed(2)}`
    ).join('\n');

    const message = `🛍️ *Pedido #${order.id.slice(-6).toUpperCase()}*\n\n` +
      `👤 *Cliente:* ${order.customerName}\n` +
      `📱 *Telefone:* ${order.customerPhone}\n` +
      `📍 *Entrega:* ${order.deliveryType === 'delivery' ? 'Delivery' : 'Retirada'}\n` +
      (order.customerAddress ? `🏠 *Endereço:* ${order.customerAddress}\n` : '') +
      `\n📋 *Itens:*\n${itemsText}\n\n` +
      `💰 *Total:* R$ ${parseFloat(order.totalAmount).toFixed(2)}\n` +
      `🕐 *Pedido feito em:* ${formatDate(order.createdAt)} às ${formatTime(order.createdAt)}\n` +
      (order.notes ? `\n📝 *Observações:* ${order.notes}` : '');

    const phoneNumber = site.whatsappNumber.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="w-32 h-4 bg-gray-300 rounded"></div>
                    <div className="w-24 h-3 bg-gray-300 rounded"></div>
                  </div>
                </div>
                <div className="w-20 h-6 bg-gray-300 rounded-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8">
        <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Nenhum pedido encontrado
        </h3>
        <p className="text-gray-600">
          Quando os clientes fizerem pedidos, eles aparecerão aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <ShoppingBag className="text-white h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="font-medium">{order.customerName}</p>
                    <Badge className={getStatusColor(order.status)}>
                      {getStatusLabel(order.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatTime(order.createdAt)}
                    </span>
                    <span className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {order.deliveryType === 'delivery' ? 'Delivery' : 'Retirada'}
                    </span>
                    <span className="font-bold text-primary">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(parseFloat(order.totalAmount))}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedOrder(order)}
                    >
                      Ver Detalhes
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        Pedido #{order.id.slice(-6).toUpperCase()}
                      </DialogTitle>
                    </DialogHeader>
                    
                    {selectedOrder && (
                      <div className="space-y-6">
                        {/* Customer Info */}
                        <div>
                          <h4 className="font-semibold mb-3">Informações do Cliente</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">{selectedOrder.customerPhone}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">
                                {selectedOrder.deliveryType === 'delivery' ? 'Delivery' : 'Retirada'}
                              </span>
                            </div>
                          </div>
                          {selectedOrder.customerAddress && (
                            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-600">
                                <strong>Endereço:</strong> {selectedOrder.customerAddress}
                              </p>
                            </div>
                          )}
                        </div>

                        <Separator />

                        {/* Order Items */}
                        <div>
                          <h4 className="font-semibold mb-3">Itens do Pedido</h4>
                          <div className="space-y-2">
                            {Array.isArray(selectedOrder.items) && selectedOrder.items.map((item: any, index: number) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                  <p className="font-medium">{item.name}</p>
                                  <p className="text-sm text-gray-600">Quantidade: {item.quantity || 1}</p>
                                </div>
                                <p className="font-bold">
                                  {new Intl.NumberFormat('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL'
                                  }).format((item.price || 0) * (item.quantity || 1))}
                                </p>
                              </div>
                            ))}
                          </div>
                          
                          <div className="mt-4 p-3 bg-primary/5 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold">Total do Pedido</span>
                              <span className="font-bold text-primary text-lg">
                                {new Intl.NumberFormat('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL'
                                }).format(parseFloat(selectedOrder.totalAmount))}
                              </span>
                            </div>
                          </div>
                        </div>

                        {selectedOrder.notes && (
                          <>
                            <Separator />
                            <div>
                              <h4 className="font-semibold mb-2">Observações</h4>
                              <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
                                {selectedOrder.notes}
                              </p>
                            </div>
                          </>
                        )}

                        <Separator />

                        {/* Actions */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">Status:</span>
                            <Select
                              value={selectedOrder.status}
                              onValueChange={(status) => onUpdateStatus(selectedOrder.id, status)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="new">Novo</SelectItem>
                                <SelectItem value="preparing">Preparando</SelectItem>
                                <SelectItem value="ready">Pronto</SelectItem>
                                <SelectItem value="delivered">Entregue</SelectItem>
                                <SelectItem value="cancelled">Cancelado</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {site.whatsappNumber && (
                            <Button
                              onClick={() => sendWhatsAppMessage(selectedOrder)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Enviar WhatsApp
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>

                <Select
                  value={order.status}
                  onValueChange={(status) => onUpdateStatus(order.id, status)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Novo</SelectItem>
                    <SelectItem value="preparing">Preparando</SelectItem>
                    <SelectItem value="ready">Pronto</SelectItem>
                    <SelectItem value="delivered">Entregue</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>

                {site.whatsappNumber && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => sendWhatsAppMessage(order)}
                    className="text-green-600 border-green-600 hover:bg-green-50"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
