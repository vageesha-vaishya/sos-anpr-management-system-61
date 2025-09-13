import React from 'react';
import { ArrowLeft, ChevronRight, Home } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useNavigation } from '@/contexts/NavigationContext';
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface BreadcrumbNavigationProps {
  currentPageTitle?: string;
  showBackButton?: boolean;
  className?: string;
}

export const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = ({
  currentPageTitle,
  showBackButton = true,
  className = ""
}) => {
  const { navigationState, goBack } = useNavigation();
  const navigate = useNavigate();

  const handleBackClick = () => {
    if (navigationState.previousPage) {
      navigate(navigationState.previousPage.path);
    } else {
      goBack();
    }
  };

  const breadcrumbs = navigationState.breadcrumbs.slice(-4); // Show last 4 breadcrumbs
  const hasMultipleBreadcrumbs = breadcrumbs.length > 1;

  return (
    <div className={`flex items-center gap-4 mb-6 ${className}`}>
      {showBackButton && navigationState.previousPage && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleBackClick}
          className="flex items-center gap-2 hover:bg-muted/80"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {navigationState.previousPage.label}
        </Button>
      )}

      {hasMultipleBreadcrumbs && (
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/" className="flex items-center gap-1">
                  <Home className="h-4 w-4" />
                  SOS
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>

            {breadcrumbs.length > 3 && (
              <>
                <BreadcrumbSeparator>
                  <ChevronRight className="h-4 w-4" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbEllipsis />
                </BreadcrumbItem>
              </>
            )}

            {breadcrumbs.slice(-3, -1).map((breadcrumb, index) => (
              <React.Fragment key={breadcrumb.path}>
                <BreadcrumbSeparator>
                  <ChevronRight className="h-4 w-4" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={breadcrumb.path}>{breadcrumb.label}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </React.Fragment>
            ))}

            {breadcrumbs.length > 0 && (
              <>
                <BreadcrumbSeparator>
                  <ChevronRight className="h-4 w-4" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbPage>
                    {currentPageTitle || breadcrumbs[breadcrumbs.length - 1]?.label}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      )}
    </div>
  );
};