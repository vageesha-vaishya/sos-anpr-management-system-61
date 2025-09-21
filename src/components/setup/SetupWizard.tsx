import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  Database, 
  Globe, 
  Building, 
  MapPin, 
  Home, 
  Users, 
  Shield, 
  Car, 
  CreditCard, 
  Bell,
  Loader2
} from 'lucide-react';

// Import existing components
import { DatabaseSetup } from './DatabaseSetup';

interface SetupStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  required: boolean;
  completed: boolean;
  dependencies?: number[];
}

const SETUP_STEPS: SetupStep[] = [
  {
    id: 1,
    title: "Welcome & Database Setup",
    description: "Initialize the database with core schema and demo data",
    icon: <Database className="w-5 h-5" />,
    required: true,
    completed: false
  },
  {
    id: 2,
    title: "Geography Configuration",
    description: "Set up geographical hierarchy (Continent → Country → State → City)",
    icon: <Globe className="w-5 h-5" />,
    required: true,
    completed: false,
    dependencies: [1]
  },
  {
    id: 3,
    title: "Organization Setup",
    description: "Create your organization profile and basic settings",
    icon: <Building className="w-5 h-5" />,
    required: true,
    completed: false,
    dependencies: [2]
  },
  {
    id: 4,
    title: "Location Mapping",
    description: "Define locations and map them to geographical areas",
    icon: <MapPin className="w-5 h-5" />,
    required: true,
    completed: false,
    dependencies: [3]
  },
  {
    id: 5,
    title: "Building Configuration",
    description: "Set up buildings, floors, and units structure",
    icon: <Home className="w-5 h-5" />,
    required: true,
    completed: false,
    dependencies: [4]
  },
  {
    id: 6,
    title: "Society Configuration",
    description: "Configure society details, amenities, and management structure",
    icon: <Users className="w-5 h-5" />,
    required: true,
    completed: false,
    dependencies: [5]
  },
  {
    id: 7,
    title: "User Management",
    description: "Set up user roles, permissions, and initial admin accounts",
    icon: <Shield className="w-5 h-5" />,
    required: true,
    completed: false,
    dependencies: [6]
  },
  {
    id: 8,
    title: "Security & Access Control",
    description: "Configure security settings, access controls, and visitor management",
    icon: <Shield className="w-5 h-5" />,
    required: false,
    completed: false,
    dependencies: [7]
  },
  {
    id: 9,
    title: "Vehicle Management",
    description: "Set up vehicle registration, parking, and ANPR integration",
    icon: <Car className="w-5 h-5" />,
    required: false,
    completed: false,
    dependencies: [7]
  },
  {
    id: 10,
    title: "Billing & Notifications",
    description: "Configure billing systems, payment methods, and notification preferences",
    icon: <CreditCard className="w-5 h-5" />,
    required: false,
    completed: false,
    dependencies: [7]
  }
];

export const SetupWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [steps, setSteps] = useState(SETUP_STEPS);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const currentStepData = steps.find(step => step.id === currentStep);
  const progress = (steps.filter(step => step.completed).length / steps.length) * 100;
  const requiredStepsCompleted = steps.filter(step => step.required && step.completed).length;
  const totalRequiredSteps = steps.filter(step => step.required).length;

  const canProceed = (stepId: number) => {
    const step = steps.find(s => s.id === stepId);
    if (!step?.dependencies) return true;
    
    return step.dependencies.every(depId => 
      steps.find(s => s.id === depId)?.completed
    );
  };

  const markStepCompleted = (stepId: number) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, completed: true } : step
    ));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepId: number) => {
    if (canProceed(stepId)) {
      setCurrentStep(stepId);
    }
  };

  const handleFinishSetup = () => {
    toast({
      title: "Setup Complete!",
      description: "Your SOS ANPR Management System is ready to use.",
    });
    // Navigate to dashboard or main application
    window.location.href = '/dashboard';
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <WelcomeStep onComplete={() => markStepCompleted(1)} />;
      case 2:
        return <GeographyStep onComplete={() => markStepCompleted(2)} />;
      case 3:
        return <OrganizationStep onComplete={() => markStepCompleted(3)} />;
      case 4:
        return <LocationMappingStep onComplete={() => markStepCompleted(4)} />;
      case 5:
        return <BuildingConfigStep onComplete={() => markStepCompleted(5)} />;
      case 6:
        return <SocietyConfigStep onComplete={() => markStepCompleted(6)} />;
      case 7:
        return <UserManagementStep onComplete={() => markStepCompleted(7)} />;
      case 8:
        return <SecurityAccessStep onComplete={() => markStepCompleted(8)} />;
      case 9:
        return <VehicleManagementStep onComplete={() => markStepCompleted(9)} />;
      case 10:
        return <BillingNotificationStep onComplete={() => markStepCompleted(10)} />;
      default:
        return <div>Step not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            SOS ANPR Management System Setup
          </h1>
          <p className="text-lg text-gray-600">
            Let's get your community management system configured
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Overall Progress
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Required: {requiredStepsCompleted}/{totalRequiredSteps}</span>
            <span>Total: {steps.filter(s => s.completed).length}/{steps.length}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Step Navigation Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Setup Steps</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {steps.map((step) => (
                    <button
                      key={step.id}
                      onClick={() => handleStepClick(step.id)}
                      disabled={!canProceed(step.id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        currentStep === step.id
                          ? 'bg-primary text-primary-foreground'
                          : canProceed(step.id)
                          ? 'hover:bg-gray-100'
                          : 'opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {step.completed ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            step.icon
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium truncate">
                              {step.title}
                            </span>
                            {step.required && (
                              <Badge variant="secondary" className="text-xs">
                                Required
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs opacity-75 truncate">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {currentStepData?.icon}
                    <div>
                      <CardTitle>{currentStepData?.title}</CardTitle>
                      <CardDescription>{currentStepData?.description}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={currentStepData?.required ? "default" : "secondary"}>
                    {currentStepData?.required ? "Required" : "Optional"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {/* Step Content */}
                <div className="mb-6">
                  {renderStepContent()}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  <div className="flex space-x-2">
                    {currentStep === steps.length ? (
                      <Button
                        onClick={handleFinishSetup}
                        disabled={requiredStepsCompleted < totalRequiredSteps}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Complete Setup
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          onClick={handleNext}
                          disabled={currentStep === steps.length}
                        >
                          Skip
                        </Button>
                        <Button
                          onClick={handleNext}
                          disabled={currentStep === steps.length}
                        >
                          Next
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// Step Components
const WelcomeStep: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Database className="w-16 h-16 mx-auto mb-4 text-primary" />
        <h2 className="text-2xl font-bold mb-2">Welcome to SOS ANPR Setup</h2>
        <p className="text-gray-600">
          This wizard will guide you through setting up your comprehensive community management system.
        </p>
      </div>
      
      <Alert>
        <AlertDescription>
          The database setup will create all necessary tables and populate them with demo data 
          to help you get started quickly.
        </AlertDescription>
      </Alert>

      <DatabaseSetup />
      
      <div className="text-center">
        <Button onClick={onComplete} className="mt-4">
          Mark as Complete
        </Button>
      </div>
    </div>
  );
};

const GeographyStep: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">Geography Configuration</h3>
        <p className="text-gray-600 mb-4">
          Set up the geographical hierarchy for your organization. This creates the foundation 
          for location-based services and regional management.
        </p>
      </div>

      <Alert>
        <AlertDescription>
          <strong>Required Fields:</strong> Continent, Country, State, City<br/>
          <strong>Navigation:</strong> Master Data Management → Geography Manager
        </AlertDescription>
      </Alert>

      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <Globe className="w-12 h-12 mx-auto mb-4" />
            <p>Geography management interface will be integrated here</p>
            <p className="text-sm mt-2">Navigate to Master Data Management → Geography Manager to configure geographical hierarchy</p>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-center">
        <Button onClick={onComplete} className="mt-4">
          Complete Geography Setup
        </Button>
      </div>
    </div>
  );
};

const OrganizationStep: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">Organization Setup</h3>
        <p className="text-gray-600 mb-4">
          Create your organization profile with basic information and settings.
        </p>
      </div>

      <Alert>
        <AlertDescription>
          <strong>Required Fields:</strong> Organization Name, Type, Contact Details<br/>
          <strong>Navigation:</strong> Master Data Management → Organization Management
        </AlertDescription>
      </Alert>

      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <Building className="w-12 h-12 mx-auto mb-4" />
            <p>Organization management interface will be integrated here</p>
            <p className="text-sm mt-2">Navigate to Master Data Management → Organization Management to configure organization details</p>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-center">
        <Button onClick={onComplete} className="mt-4">
          Complete Organization Setup
        </Button>
      </div>
    </div>
  );
};

const LocationMappingStep: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">Location Mapping</h3>
        <p className="text-gray-600 mb-4">
          Define and map your locations to the geographical areas you've set up.
        </p>
      </div>

      <Alert>
        <AlertDescription>
          <strong>Required Fields:</strong> Location Name, Address, Geographic Mapping<br/>
          <strong>Dependencies:</strong> Geography and Organization must be completed first<br/>
          <strong>Navigation:</strong> System Admin Hub → Location Management
        </AlertDescription>
      </Alert>

      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <MapPin className="w-12 h-12 mx-auto mb-4" />
            <p>Location mapping interface will be integrated here</p>
            <p className="text-sm mt-2">Navigate to System Admin Hub → Location Management to configure locations</p>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-center">
        <Button onClick={onComplete} className="mt-4">
          Complete Location Mapping
        </Button>
      </div>
    </div>
  );
};

const BuildingConfigStep: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">Building Configuration</h3>
        <p className="text-gray-600 mb-4">
          Set up your building structure including floors, units, and physical layout.
        </p>
      </div>

      <Alert>
        <AlertDescription>
          <strong>Required Fields:</strong> Building Name, Floors, Units per Floor<br/>
          <strong>Dependencies:</strong> Locations must be mapped first<br/>
          <strong>Navigation:</strong> Society Management → Building Management
        </AlertDescription>
      </Alert>

      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <Home className="w-12 h-12 mx-auto mb-4" />
            <p>Building configuration interface will be integrated here</p>
            <p className="text-sm mt-2">Navigate to Society Management → Building Management to configure buildings</p>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-center">
        <Button onClick={onComplete} className="mt-4">
          Complete Building Configuration
        </Button>
      </div>
    </div>
  );
};

const SocietyConfigStep: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">Society Configuration</h3>
        <p className="text-gray-600 mb-4">
          Configure your society details, amenities, and management structure.
        </p>
      </div>

      <Alert>
        <AlertDescription>
          <strong>Required Fields:</strong> Society Name, Management Structure, Amenities<br/>
          <strong>Dependencies:</strong> Buildings must be configured first<br/>
          <strong>Navigation:</strong> Society Management Hub
        </AlertDescription>
      </Alert>

      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4" />
            <p>Society configuration interface will be integrated here</p>
            <p className="text-sm mt-2">Navigate to Society Management Hub to configure society details</p>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-center">
        <Button onClick={onComplete} className="mt-4">
          Complete Society Configuration
        </Button>
      </div>
    </div>
  );
};

const UserManagementStep: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">User Management</h3>
        <p className="text-gray-600 mb-4">
          Set up user roles, permissions, and create initial admin accounts.
        </p>
      </div>

      <Alert>
        <AlertDescription>
          <strong>Required Fields:</strong> Admin User, Role Assignments, Permission Matrix<br/>
          <strong>Dependencies:</strong> Society configuration must be completed<br/>
          <strong>Navigation:</strong> System Admin Hub → User Management
        </AlertDescription>
      </Alert>

      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <Shield className="w-12 h-12 mx-auto mb-4" />
            <p>User management interface will be integrated here</p>
            <p className="text-sm mt-2">Navigate to System Admin Hub → User Management to configure users and roles</p>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-center">
        <Button onClick={onComplete} className="mt-4">
          Complete User Management
        </Button>
      </div>
    </div>
  );
};

const SecurityAccessStep: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">Security & Access Control</h3>
        <p className="text-gray-600 mb-4">
          Configure security settings, access controls, and visitor management (Optional).
        </p>
      </div>

      <Alert>
        <AlertDescription>
          <strong>Optional Fields:</strong> Security Policies, Access Rules, Visitor Protocols<br/>
          <strong>Navigation:</strong> Operations Hub → Security Management
        </AlertDescription>
      </Alert>

      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <Shield className="w-12 h-12 mx-auto mb-4" />
            <p>Security configuration interface will be integrated here</p>
            <p className="text-sm mt-2">Navigate to Operations Hub → Security Management for advanced security settings</p>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-center">
        <Button onClick={onComplete} className="mt-4">
          Complete Security Setup
        </Button>
      </div>
    </div>
  );
};

const VehicleManagementStep: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">Vehicle Management</h3>
        <p className="text-gray-600 mb-4">
          Set up vehicle registration, parking management, and ANPR integration (Optional).
        </p>
      </div>

      <Alert>
        <AlertDescription>
          <strong>Optional Fields:</strong> Vehicle Registration, Parking Slots, ANPR Settings<br/>
          <strong>Navigation:</strong> Operations Hub → Vehicle Management
        </AlertDescription>
      </Alert>

      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <Car className="w-12 h-12 mx-auto mb-4" />
            <p>Vehicle management interface will be integrated here</p>
            <p className="text-sm mt-2">Navigate to Operations Hub → Vehicle Management to configure vehicle settings</p>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-center">
        <Button onClick={onComplete} className="mt-4">
          Complete Vehicle Management
        </Button>
      </div>
    </div>
  );
};

const BillingNotificationStep: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">Billing & Notifications</h3>
        <p className="text-gray-600 mb-4">
          Configure billing systems, payment methods, and notification preferences (Optional).
        </p>
      </div>

      <Alert>
        <AlertDescription>
          <strong>Optional Fields:</strong> Payment Gateways, Billing Cycles, Notification Settings<br/>
          <strong>Navigation:</strong> Financial Hub → Billing Management
        </AlertDescription>
      </Alert>

      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <div className="flex justify-center space-x-4 mb-4">
              <CreditCard className="w-12 h-12" />
              <Bell className="w-12 h-12" />
            </div>
            <p>Billing and notification interface will be integrated here</p>
            <p className="text-sm mt-2">Navigate to Financial Hub → Billing Management for payment and notification settings</p>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-center">
        <Button onClick={onComplete} className="mt-4">
          Complete Billing & Notifications
        </Button>
      </div>
    </div>
  );
};