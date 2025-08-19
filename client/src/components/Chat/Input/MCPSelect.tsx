
import React, { memo, useRef, useMemo, useEffect, useCallback } from 'react';
import { useRecoilState } from 'recoil';
import { Constants, EModelEndpoint, LocalStorageKeys, SystemRoles } from 'librechat-data-provider';
import { useAvailableToolsQuery } from '~/data-provider';
import useLocalStorage from '~/hooks/useLocalStorageAlt';
import MultiSelect from '~/components/ui/MultiSelect';
import { ephemeralAgentByConvoId } from '~/store';
import MCPIcon from '~/components/ui/MCPIcon';
import { useLocalize, useAuthContext } from '~/hooks';
import { useGetStartupConfig } from '~/data-provider';

const storageCondition = (value: unknown, rawCurrentValue?: string | null) => {
  if (rawCurrentValue) {
    try {
      const currentValue = rawCurrentValue?.trim() ?? '';
      if (currentValue.length > 2) {
        return true;
      }
    } catch (e) {
      console.error(e);
    }
  }
  return Array.isArray(value) && value.length > 0;
};

function MCPSelect({ conversationId }: { conversationId?: string | null }) {
  const localize = useLocalize();
  const { user } = useAuthContext();
  const { data: startupConfig } = useGetStartupConfig();
  const key = conversationId ?? Constants.NEW_CONVO;
  const hasSetFetched = useRef<string | null>(null);

  // Check if MCP should be restricted to admins only
  const mcpJustAdmin = startupConfig?.mcpJustAdmin === true;
  const isAdmin = user?.role === SystemRoles.ADMIN;
  
  // If MCP is restricted to admins only and user is not admin, don't render the component
  if (mcpJustAdmin && !isAdmin) {
    return null;
  }

  const { data: mcpServerSet, isFetched } = useAvailableToolsQuery(EModelEndpoint.agents, {
    select: (data) => {
      const serverNames = new Set<string>();
      data.forEach((tool) => {
        const isMCP = tool.pluginKey.includes(Constants.mcp_delimiter);
        if (isMCP && tool.chatMenu !== false) {
          const parts = tool.pluginKey.split(Constants.mcp_delimiter);
          serverNames.add(parts[parts.length - 1]);
        }
      });
      return serverNames;
    },
  });

  const [ephemeralAgent, setEphemeralAgent] = useRecoilState(ephemeralAgentByConvoId(key));
  const mcpState = useMemo(() => {
    return ephemeralAgent?.mcp ?? [];
  }, [ephemeralAgent?.mcp]);

  const setSelectedValues = useCallback(
    (values: string[] | null | undefined) => {
      if (!values) {
        return;
      }
      if (!Array.isArray(values)) {
        return;
      }
      setEphemeralAgent((prev) => ({
        ...prev,
        mcp: values,
      }));
    },
    [setEphemeralAgent],
  );
  const [mcpValues, setMCPValues] = useLocalStorage<string[]>(
    `${LocalStorageKeys.LAST_MCP_}${key}`,
    mcpState,
    setSelectedValues,
    storageCondition,
  );

  useEffect(() => {
    if (hasSetFetched.current === key) {
      return;
    }
    if (!isFetched) {
      return;
    }
    hasSetFetched.current = key;
    if ((mcpServerSet?.size ?? 0) > 0) {
      setMCPValues(mcpValues.filter((mcp) => mcpServerSet?.has(mcp)));
      return;
    }
    setMCPValues([]);
  }, [isFetched, setMCPValues, mcpServerSet, key, mcpValues]);


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

  const renderItemContent = useCallback(
    (serverName: string, defaultContent: React.ReactNode) => {
      const statusIconProps = getServerStatusIconProps(serverName);
      const isServerInitializing = isInitializing(serverName);

      /**
       Common wrapper for the main content (check mark + text).
       Ensures Check & Text are adjacent and the group takes available space.
        */
      const mainContentWrapper = (
        <button
          type="button"
          className={`flex flex-grow items-center rounded bg-transparent p-0 text-left transition-colors focus:outline-none ${
            isServerInitializing ? 'opacity-50' : ''
          }`}
          tabIndex={0}
          disabled={isServerInitializing}
        >
          {defaultContent}
        </button>
      );

      const statusIcon = statusIconProps && <MCPServerStatusIcon {...statusIconProps} />;

      if (statusIcon) {
        return (
          <div className="flex w-full items-center justify-between">
            {mainContentWrapper}
            <div className="ml-2 flex items-center">{statusIcon}</div>
          </div>
        );
      }

      return mainContentWrapper;
    },
    [getServerStatusIconProps, isInitializing],
  );

  if ((!mcpValues || mcpValues.length === 0) && !isPinned) {
    return null;
  }

  if (!configuredServers || configuredServers.length === 0) {
    return null;
  }

  const configDialogProps = getConfigDialogProps();

  return (
    <MultiSelect
      items={mcpServers ?? []}
      selectedValues={mcpValues ?? []}
      setSelectedValues={setMCPValues}
      defaultSelectedValues={mcpValues ?? []}
      renderSelectedValues={renderSelectedValues}
      placeholder={localize('com_ui_mcp_servers')}
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
  );
}

export default memo(MCPSelect);
