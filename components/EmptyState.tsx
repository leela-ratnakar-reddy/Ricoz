import React from "react";
import { Button } from "@/components/Button";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
}) => {
  return (
    <div className="text-center py-16 px-4 bg-[#FFF9F3]/60 border border-dashed border-[#E6D8CF] rounded-2xl max-w-lg mx-auto my-6 select-none shadow-2xs">
      {icon && (
        <div className="w-12 h-12 rounded-full bg-white border border-[#E6D8CF] text-muted mx-auto flex items-center justify-center mb-4">
          {icon}
        </div>
      )}
      <h3 className="font-serif text-lg font-normal text-espresso tracking-tight">{title}</h3>
      <p className="mt-1.5 text-xs text-muted max-w-sm mx-auto leading-relaxed">
        {description}
      </p>
      {actionLabel && (
        <div className="mt-6">
          <Button
            size="sm"
            variant="secondary"
            href={actionHref}
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
