import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, Smartphone, TrendingUp, Globe } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background-alt">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="bg-primary rounded-xl p-2">
                <Store className="text-white h-6 w-6" />
              </div>
              <h1 className="ml-3 text-2xl font-bold text-neutral">SiteBuilder Pro</h1>
            </div>
            <Button onClick={handleLogin} className="bg-primary hover:bg-primary/90">
              Entrar
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-neutral mb-6">
            Crie Sites de Delivery
            <br />
            <span className="text-primary">Em Minutos</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Plataforma completa para criar sites de pedidos online com integração WhatsApp,
            painel administrativo e analytics em tempo real.
          </p>
          <Button 
            onClick={handleLogin}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-lg px-8 py-4"
          >
            Começar Agora - Grátis
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral mb-4">
              Tudo que você precisa em uma plataforma
            </h2>
            <p className="text-xl text-gray-600">
              Ferramenta completa para criar e gerenciar sites de delivery profissionais
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="bg-primary/10 rounded-lg p-3 w-12 h-12 mx-auto mb-4">
                  <Globe className="text-primary h-6 w-6" />
                </div>
                <CardTitle className="text-lg">Criação Rápida</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Templates prontos para açaí, lanches, pizzas e muito mais. 
                  Seu site fica pronto em minutos.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="bg-secondary/10 rounded-lg p-3 w-12 h-12 mx-auto mb-4">
                  <Smartphone className="text-secondary h-6 w-6" />
                </div>
                <CardTitle className="text-lg">Integração WhatsApp</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Pedidos são enviados diretamente para o seu WhatsApp.
                  Configuração simples e automática.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="bg-accent/10 rounded-lg p-3 w-12 h-12 mx-auto mb-4">
                  <TrendingUp className="text-accent h-6 w-6" />
                </div>
                <CardTitle className="text-lg">Analytics Completo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Acompanhe visualizações, pedidos, faturamento e 
                  muito mais em tempo real.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="bg-purple-100 rounded-lg p-3 w-12 h-12 mx-auto mb-4">
                  <Store className="text-purple-600 h-6 w-6" />
                </div>
                <CardTitle className="text-lg">Painel Administrativo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Gerencie pedidos, produtos e configurações
                  em um painel intuitivo e profissional.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Pronto para começar?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Crie seu primeiro site de delivery em menos de 5 minutos
          </p>
          <Button 
            onClick={handleLogin}
            size="lg"
            variant="secondary"
            className="bg-white text-primary hover:bg-gray-100 text-lg px-8 py-4"
          >
            Criar Meu Site Agora
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary rounded-xl p-2">
              <Store className="text-white h-6 w-6" />
            </div>
            <span className="ml-3 text-xl font-bold">SiteBuilder Pro</span>
          </div>
          <p className="text-gray-400">
            A plataforma mais completa para criar sites de delivery profissionais
          </p>
        </div>
      </footer>
    </div>
  );
}
