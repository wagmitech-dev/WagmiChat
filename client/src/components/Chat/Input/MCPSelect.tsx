import React, { memo, useCallback } from 'react';
import { MultiSelect, MCPIcon } from '@librechat/client';
import { SystemRoles } from 'librechat-data-provider';
import MCPServerStatusIcon from '~/components/MCP/MCPServerStatusIcon';
import MCPConfigDialog from '~/components/MCP/MCPConfigDialog';
import { useBadgeRowContext } from '~/Providers';
import { useMCPServerManager } from '~/hooks';
import { useAuthContext } from '~/hooks';
import { useGetStartupConfig } from '~/data-provider';

type MCPSelectProps = { conversationId?: string | null };

function MCPSelectContent({ conversationId }: MCPSelectProps) {
  const { user } = useAuthContext();
  const { data: startupConfig } = useGetStartupConfig();
  
  // Check if MCP should be restricted to admins only
  const mcpJustAdmin = startupConfig?.mcpJustAdmin === true;
  const isAdmin = user?.role === SystemRoles.ADMIN;
  
  // If MCP is restricted to admins only and user is not admin, don't render the component
  if (mcpJustAdmin && !isAdmin) {
    return null;
  }
  
  const {
    configuredServers,
    mcpValues,
    isPinned,
    placeholderText,
    batchToggleServers,
    getServerStatusIconProps,
    getConfigDialogProps,
    isInitializing,
    localize,
  } = useMCPServerManager({ conversationId });

  const renderSelectedValues = useCallback(
    (values: string[], placeholder?: string) => {
      if (values.length === 0) {
        return placeholder || localize('com_ui_select') + '...';
      }
      if (values.length === 1) {
        return values[0];
      }
      return localize('com_ui_x_selected', { 0: values.length });
    },
    [localize],
  );

  // Simplified render - just return the default content
  const renderItemContent = undefined;

  return (
    <>
      <MultiSelect
        items={configuredServers}
        selectedValues={mcpValues ?? []}
        setSelectedValues={batchToggleServers}
        renderSelectedValues={renderSelectedValues}
        renderItemContent={renderItemContent}
        placeholder={placeholderText}
        popoverClassName="min-w-fit"
        className="badge-icon min-w-fit"
        selectIcon={
          <img 
            src="/assets/Wagmi_Tech_Logo_Avatar.png" 
            alt="Wagmi Tech Logo" 
            className="icon-md text-text-primary" 
            style={{ width: '1rem', height: '1rem', objectFit: 'contain' }}
          />
        }
        selectItemsClassName="border border-blue-600/50 bg-blue-500/10 hover:bg-blue-700/10"
        selectClassName="group relative inline-flex items-center justify-center md:justify-start gap-1.5 rounded-full border border-border-medium text-sm font-medium transition-all md:w-full size-9 p-2 md:p-3 bg-transparent shadow-sm hover:bg-surface-hover hover:shadow-md active:shadow-inner"
      />
      {getConfigDialogProps && (
        <MCPConfigDialog {...getConfigDialogProps} conversationId={conversationId} />
      )}
    </>
  );
}

function MCPSelect(props: MCPSelectProps) {
  const { mcpServerNames } = useBadgeRowContext();
  if ((mcpServerNames?.length ?? 0) === 0) return null;
  return <MCPSelectContent {...props} />;
}

export default memo(MCPSelect);
