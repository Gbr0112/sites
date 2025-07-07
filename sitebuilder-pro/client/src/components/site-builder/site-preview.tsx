import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MessageCircle } from "lucide-react";

interface SitePreviewProps {
  template: any;
  config: {
    name: string;
    whatsappNumber: string;
    address: string;
    slug: string;
  };
}

export default function SitePreview({ template, config }: SitePreviewProps) {
  const siteName = config.name || template.name;
  const getThemeColors = () => {
    switch (template.category) {
      case 'açaí':
        return { primary: '#8B5CF6', secondary: '#EC4899' };
      case 'burger':
        return { primary: '#EF4444', secondary: '#F59E0B' };
      case 'pizza':
        return { primary: '#F59E0B', secondary: '#EF4444' };
      case 'doces':
        return { primary: '#EC4899', secondary: '#8B5CF6' };
      default:
        return { primary: '#FF6B35', secondary: '#4ECDC4' };
    }
  };

  const colors = getThemeColors();

  const getSampleProducts = () => {
    switch (template.category) {
      case 'açaí':
        return [
          { name: 'Açaí Tradicional', price: 12.90, image: 'https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?ixlib=rb-4.0.3&w=200&h=150&fit=crop' },
          { name: 'Açaí Premium', price: 18.90, image: 'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?ixlib=rb-4.0.3&w=200&h=150&fit=crop' },
        ];
      case 'burger':
        return [
          { name: 'Burger Clássico', price: 24.90, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&w=200&h=150&fit=crop' },
          { name: 'Burger Gourmet', price: 32.90, image: 'https://images.unsplash.com/photo-1550317138-10000687a72b?ixlib=rb-4.0.3&w=200&h=150&fit=crop' },
        ];
      case 'pizza':
        return [
          { name: 'Pizza Margherita', price: 35.90, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&w=200&h=150&fit=crop' },
          { name: 'Pizza Pepperoni', price: 42.90, image: 'https://images.unsplash.com/photo-1594007654729-04375c7d3da8?ixlib=rb-4.0.3&w=200&h=150&fit=crop' },
        ];
      case 'doces':
        return [
          { name: 'Brigadeiro Gourmet', price: 3.50, image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?ixlib=rb-4.0.3&w=200&h=150&fit=crop' },
          { name: 'Torta de Chocolate', price: 8.90, image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&w=200&h=150&fit=crop' },
        ];
      default:
        return [
          { name: 'Produto 1', price: 15.90, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&w=200&h=150&fit=crop' },
          { name: 'Produto 2', price: 22.90, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&w=200&h=150&fit=crop' },
        ];
    }
  };

  const products = getSampleProducts();

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 p-4">
        <div className="text-center mb-4">
          <div className="text-xs text-gray-500 mb-1">Prévia do Site</div>
          <div className="text-xs text-gray-400">
            {config.slug ? `${config.slug}.netlify.app` : 'seu-site.netlify.app'}
          </div>
        </div>
        
        <Card className="max-w-sm mx-auto">
          <CardContent className="p-4">
            {/* Site Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: colors.primary }}
                >
                  <span className="text-white font-bold text-lg">
                    {siteName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-lg">{siteName}</h4>
                  <p className="text-sm text-gray-600">
                    {template.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium">4.8</span>
              </div>
            </div>

            {/* Address */}
            {config.address && (
              <div className="mb-4 p-2 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">{config.address}</p>
              </div>
            )}

            {/* Featured Products */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {products.map((product, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-20 object-cover rounded-lg mb-2"
                  />
                  <h5 className="font-semibold text-sm">{product.name}</h5>
                  <p className="font-bold text-sm" style={{ color: colors.primary }}>
                    R$ {product.price.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            {/* WhatsApp Button */}
            <Button
              className="w-full"
              style={{ backgroundColor: colors.primary }}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Fazer Pedido
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
