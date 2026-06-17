import { getMaterialUI } from "../core/platform.ts";
import { MetaDialog } from "../ui/shared.jsx";
import { useChatTool } from "./chat/useChatTool.ts";
import { ChatLoggedOutShell } from "./chat/ChatLoggedOutShell.jsx";
import { ChatThreadSidebar } from "./chat/ChatThreadSidebar.jsx";
import { ChatMainPanel } from "./chat/ChatMainPanel.jsx";
import { JwtModal } from "./chat/JwtModal.jsx";
import { TercerosAuditDialog } from "./chat/TercerosAuditDialog.jsx";

const { Box } = getMaterialUI();

export function ChatTool({ bootChat, onNeedLogin }) {
  const chat = useChatTool({ bootChat });

  if (!chat.loggedIn) {
    return <ChatLoggedOutShell onNeedLogin={onNeedLogin} />;
  }

  return (
    <Box className="conv-log-shell paty-chat-shell" sx={{ display: "flex", height: "100%", minHeight: 0, flexDirection: { xs: "column", md: "row" } }}>
      <ChatThreadSidebar
        jwt={chat.jwt}
        displayScope={chat.displayScope}
        sessionUser={chat.sessionUser}
        canInteract={chat.canInteract}
        viewOnly={chat.viewOnly}
        jwtLoading={chat.jwtLoading}
        canSend={chat.canSend}
        needsJwt={chat.needsJwt}
        listScope={chat.listScope}
        sessionScopeLoading={chat.sessionScopeLoading}
        viewingAuditOther={chat.viewingAuditOther}
        auditScope={chat.auditScope}
        loadingList={chat.loadingList}
        rows={chat.rows}
        selectedId={chat.selectedId}
        convListMeta={chat.convListMeta}
        convListPage={chat.convListPage}
        onOpenJwt={() => chat.setJwtOpen(true)}
        onOpenAudit={() => chat.setAuditDialogOpen(true)}
        onNewChat={chat.onNewChat}
        onOpenConv={chat.openConv}
        onDelete={chat.onDelete}
        onConvListPageChange={chat.setConvListPage}
      />

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
      />

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
