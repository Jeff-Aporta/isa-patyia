import { getMaterialUI } from "../core/platform.ts";
import { MetaDialog } from "../ui/shared.jsx";
import { useChatTool } from "./chat/useChatTool.ts";
import { ChatLoggedOutShell } from "./chat/ChatLoggedOutShell.jsx";
import { ChatThreadSidebar } from "./chat/ChatThreadSidebar.jsx";
import { ChatMainPanel } from "./chat/ChatMainPanel.jsx";
import { JwtModal } from "./chat/JwtModal.jsx";
import { TercerosAuditDialog } from "./chat/TercerosAuditDialog.jsx";
import { UI } from "../core/platform.ts";
import { getReact } from "../core/platform.ts";
import { mobileDrawerPaperProps } from "../ui/mobileDrawer.ts";

const { Box, Drawer, Fab, useTheme, useMediaQuery } = getMaterialUI();
const { useState } = getReact();
const { Icon } = UI;

export function ChatTool({ bootChat, onNeedLogin }) {
  const chat = useChatTool({ bootChat });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!chat.loggedIn) {
    return <ChatLoggedOutShell onNeedLogin={onNeedLogin} />;
  }

  const sidebarProps = {
    jwt: chat.jwt,
    displayScope: chat.displayScope,
    sessionUser: chat.sessionUser,
    canInteract: chat.canInteract,
    viewOnly: chat.viewOnly,
    jwtLoading: chat.jwtLoading,
    canSend: chat.canSend,
    needsJwt: chat.needsJwt,
    listScope: chat.listScope,
    sessionScopeLoading: chat.sessionScopeLoading,
    viewingAuditOther: chat.viewingAuditOther,
    auditScope: chat.auditScope,
    loadingList: chat.loadingList,
    rows: chat.rows,
    selectedId: chat.selectedId,
    convListMeta: chat.convListMeta,
    convListPage: chat.convListPage,
    onOpenJwt: () => chat.setJwtOpen(true),
    onOpenAudit: () => chat.setAuditDialogOpen(true),
    onNewChat: chat.onNewChat,
    onOpenConv: chat.openConv,
    onDelete: chat.onDelete,
    onConvListPageChange: chat.setConvListPage,
  };

  return (
    <Box
      className="conv-log-shell paty-chat-shell"
      sx={{ display: "flex", height: "100%", minHeight: 0, flexDirection: { xs: "column", md: "row" }, position: "relative" }}
    >
      <ChatThreadSidebar {...sidebarProps} />

      {isMobile ? (
        <Drawer
          anchor="left"
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          ModalProps={{ keepMounted: true }}
          PaperProps={mobileDrawerPaperProps("paty-mobile-sidebar-drawer")}
        >
          <ChatThreadSidebar
            {...sidebarProps}
            drawerMode
            onClose={() => setSidebarOpen(false)}
          />
        </Drawer>
      ) : null}

      <ChatMainPanel
        jwt={chat.jwt}
        needsJwt={chat.needsJwt}
        viewingAuditOther={chat.viewingAuditOther}
        selectedId={chat.selectedId}
        detail={chat.detail}
        canSend={chat.canSend}
        loadingThread={chat.loadingThread}
        sending={chat.sending}
        showThread={chat.showThread}
        logError={chat.logError}
        displayMensajes={chat.displayMensajes}
        chatUserName={chat.chatUserName}
        ratingMsgId={chat.ratingMsgId}
        threadScrollRef={chat.threadScrollRef}
        onThreadScroll={chat.onThreadScroll}
        onOpenJwt={() => chat.setJwtOpen(true)}
        onClearAuditFilter={chat.clearAuditFilter}
        onRefreshConv={() => chat.openConv(chat.selectedId)}
        draft={chat.draft}
        images={chat.images}
        payloadPreviewOpen={chat.payloadPreviewOpen}
        postBodyPreview={chat.postBodyPreview}
        inputRef={chat.inputRef}
        fileInputRef={chat.fileInputRef}
        onDraftChange={(e) => chat.setDraft(e.target.value)}
        onPaste={chat.onPaste}
        onSend={chat.onSend}
        onTogglePayloadPreview={() => chat.setPayloadPreviewOpen((v) => !v)}
        onAttachImagesClick={chat.onAttachImagesClick}
        onAttachImagesChange={chat.onAttachImagesChange}
        onRemoveImage={(idx) => chat.setImages((p) => p.filter((_, j) => j !== idx))}
        onMeta={chat.onMeta}
        onRateMessage={chat.onRateMessage}
        onOpenSidebar={isMobile ? () => setSidebarOpen(true) : undefined}
      />

      {isMobile ? (
        <Fab
          color="primary"
          size="medium"
          className="paty-mobile-sidebar-fab"
          aria-label="Abrir conversaciones"
          onClick={() => setSidebarOpen(true)}
          sx={{
            position: "absolute",
            bottom: 12,
            left: 12,
            zIndex: 6,
            display: sidebarOpen ? "none" : "flex",
          }}
        >
          <Icon icon="mdi:forum-outline" size={22} />
        </Fab>
      ) : null}

      <JwtModal
        open={chat.jwtOpen}
        onClose={() => chat.setJwtOpen(false)}
        initialToken={chat.jwt?.token || ""}
        onSave={chat.setJwt}
      />
      <MetaDialog
        open={chat.metaOpen}
        onClose={() => chat.setMetaOpen(false)}
        meta={chat.metaMsg?.meta}
        usageStats={chat.metaMsg?.usageStats ?? null}
        title={chat.metaMsg ? `Trazabilidad · ${chat.metaMsg.rol}` : ""}
        isUserMessage={Boolean(chat.metaMsg?.esUsuario)}
      />
      <TercerosAuditDialog
        open={chat.auditDialogOpen}
        onClose={() => chat.setAuditDialogOpen(false)}
        jwt={chat.jwt}
        sessionUser={chat.sessionUser}
        currentScope={chat.auditCurrentScope}
        onSelect={chat.handleSelectAuditScope}
      />
    </Box>
  );
}
