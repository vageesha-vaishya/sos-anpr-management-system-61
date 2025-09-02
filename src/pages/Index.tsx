import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Camera, BarChart3, Users, AlertTriangle, ArrowRight, CheckCircle } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { useEffect } from "react"

export default function Index() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard')
    }
  }, [user, loading, navigate])

  const features = [
    {
      icon: <Camera className="h-8 w-8" />,
      title: "ANPR Detection",
      description: "Automated Number Plate Recognition with real-time processing and high accuracy detection.",
      stats: "99.2% accuracy"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Security Management",
      description: "Comprehensive security features with whitelist/blacklist management and alert systems.",
      stats: "24/7 monitoring"
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Analytics Dashboard",
      description: "Detailed insights and analytics with customizable reports and real-time monitoring.",
      stats: "Real-time reports"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Multi-tenant Architecture",
      description: "Scalable multi-organization support with role-based access control and data isolation.",
      stats: "Enterprise ready"
    },
    {
      icon: <AlertTriangle className="h-8 w-8" />,
      title: "Real-time Alerts",
      description: "Instant notifications for security incidents, blacklisted vehicles, and system events.",
      stats: "Instant alerts"
    }
  ]

  const benefits = [
    "Advanced automatic number plate recognition",
    "Multi-location oversight and camera management",
    "Building-specific monitoring and visitor control",
    "Real-time processing and role-based access control"
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">ANPR Security</h1>
              <p className="text-xs text-muted-foreground">Platform Administrator</p>
            </div>
          </div>
          <Link to="/auth">
            <Button className="group">
              Get Started
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 rounded-3xl"></div>
        <div className="max-w-4xl mx-auto relative">
          <Badge variant="outline" className="mb-6 text-primary border-primary/20">
            Advanced Automatic Number Plate Recognition system
          </Badge>
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
            ANPR Security System
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            with multi-tenant architecture, real-time processing, and role-based access control.
          </p>
          
          {/* Benefits List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto mb-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center text-left">
                <CheckCircle className="w-5 h-5 text-success mr-3 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">{benefit}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/auth">
              <Button size="xl" className="w-full sm:w-auto group">
                Explore the dashboard
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="outline" size="xl" className="w-full sm:w-auto">
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold mb-4">Powerful Features</h3>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to manage your ANPR system efficiently and securely
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 group border-2 hover:border-primary/20">
              <CardHeader className="p-0 pb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <div className="text-primary">{feature.icon}</div>
                </div>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {feature.stats}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary/5 via-transparent to-primary/5 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-3xl font-bold mb-4">Select a role above to explore the dashboard</h3>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              This demo showcases the multi-tenant architecture.
            </p>
            <Link to="/auth">
              <Button size="xl" className="group">
                Access Dashboard
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-background/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <span className="font-semibold">ANPR Security System</span>
            </div>
            <p className="text-muted-foreground text-sm">
              &copy; 2024 ANPR Security System. Advanced security technology.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
