import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TemplateSelectorProps {
  templates: any[];
  selectedTemplate: any;
  onSelectTemplate: (template: any) => void;
  isLoading: boolean;
}

export default function TemplateSelector({
  templates,
  selectedTemplate,
  onSelectTemplate,
  isLoading,
}: TemplateSelectorProps) {
  const defaultTemplates = [
    {
      id: 1,
      name: "Açaí & Smoothies",
      category: "açaí",
      description: "Perfeito para açaí, smoothies e lanches saudáveis",
      imageUrl: "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?ixlib=rb-4.0.3&w=400&h=200&fit=crop",
      config: {
        primaryColor: "#8B5CF6",
        secondaryColor: "#EC4899",
        theme: "healthy",
        layout: "grid",
      },
    },
    {
      id: 2,
      name: "Hamburgueria",
      category: "burger",
      description: "Ideal para hambúrgueres, lanches e fast food",
      imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&w=400&h=200&fit=crop",
      config: {
        primaryColor: "#EF4444",
        secondaryColor: "#F59E0B",
        theme: "fastfood",
        layout: "list",
      },
    },
    {
      id: 3,
      name: "Pizzaria",
      category: "pizza",
      description: "Especializado em pizzas e massas artesanais",
      imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&w=400&h=200&fit=crop",
      config: {
        primaryColor: "#F59E0B",
        secondaryColor: "#EF4444",
        theme: "italian",
        layout: "grid",
      },
    },
    {
      id: 4,
      name: "Doces & Sobremesas",
      category: "doces",
      description: "Para confeitarias, brigadeiros e doces gourmet",
      imageUrl: "https://images.unsplash.com/photo-1551024506-0bccd828d307?ixlib=rb-4.0.3&w=400&h=200&fit=crop",
      config: {
        primaryColor: "#EC4899",
        secondaryColor: "#8B5CF6",
        theme: "sweet",
        layout: "grid",
      },
    },
  ];

  const templatesToShow = templates.length > 0 ? templates : defaultTemplates;

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'açaí':
        return 'bg-purple-100 text-purple-600';
      case 'burger':
      case 'hamburger':
        return 'bg-red-100 text-red-600';
      case 'pizza':
        return 'bg-yellow-100 text-yellow-600';
      case 'doces':
        return 'bg-pink-100 text-pink-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="w-full h-32 bg-gray-300 rounded-lg mb-3"></div>
              <div className="w-3/4 h-4 bg-gray-300 rounded mb-1"></div>
              <div className="w-full h-3 bg-gray-300 rounded mb-2"></div>
              <div className="w-16 h-6 bg-gray-300 rounded-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {templatesToShow.map((template) => (
        <Card
          key={template.id}
          className={cn(
            "cursor-pointer transition-all hover:shadow-md",
            selectedTemplate?.id === template.id
              ? "ring-2 ring-primary border-primary"
              : "border-gray-200 hover:border-primary"
          )}
          onClick={() => onSelectTemplate(template)}
        >
          <CardContent className="p-4">
            <img
              src={template.imageUrl}
              alt={template.name}
              className="w-full h-32 object-cover rounded-lg mb-3"
            />
            <h4 className="font-semibold text-neutral mb-1">{template.name}</h4>
            <p className="text-sm text-gray-600 mb-2">{template.description}</p>
            <Badge className={getCategoryColor(template.category)}>
              {template.category}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
