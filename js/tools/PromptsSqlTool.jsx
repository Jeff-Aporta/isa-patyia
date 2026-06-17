import { getMaterialUI } from "../core/platform.ts";
import { usePromptsSqlTool } from "./promptsSql/usePromptsSqlTool.ts";
import { PromptsSqlActionBar } from "./promptsSql/PromptsSqlActionBar.jsx";
import { PromptsSqlTree } from "./promptsSql/PromptsSqlTree.jsx";
import { PromptsSqlBodyEditor, PromptsSqlMapeoTable } from "./promptsSql/PromptsSqlEditorPane.jsx";
import { FileImportMapDialog } from "./promptsSql/FileImportMapDialog.jsx";
import { JconfigDetailDialog } from "./promptsSql/JconfigDetailDialog.jsx";

const { Paper, Alert } = getMaterialUI();

export function PromptsSqlTool({ bootPrompts = {}, onNeedLogin }) {
  const tool = usePromptsSqlTool({ bootPrompts, onNeedLogin });

  return (
    <div className="tool-grid tool-grid-prompts tool-grid-prompts--solo">
      <Paper className="tool-panel scroll-panel" elevation={0}>
        <PromptsSqlActionBar
          filledCount={tool.filledCount}
          instruccionKeysLength={tool.instruccionKeys.length}
          loadBusy={tool.loadBusy}
          actionBusy={tool.actionBusy}
          hasLocalChanges={tool.hasLocalChanges}
          pendingTiposLength={tool.pendingTipos.length}
          canPublish={tool.canPublish}
          saveTitle={tool.saveTitle}
          fileInputRef={tool.fileInputRef}
          onFileInput={tool.onFileInput}
          onImportClick={() => tool.fileInputRef.current?.click()}
          onDiscardAll={tool.discardAll}
          onSaveAll={tool.saveAll}
        />

        <div className="panel-body panel-body-tabs custom-scrollbar">
          {tool.loadErr && <Alert severity="warning" sx={{ mb: 1 }}>{tool.loadErr}</Alert>}

          <div className="prompt-instrucciones-zone">
            <PromptsSqlTree
              instruccionKeys={tool.instruccionKeys}
              prompts={tool.prompts}
              activeTab={tool.activeTab}
              onActiveTabChange={tool.setActiveTab}
              dragOver={tool.dragOver}
              onDragEnter={tool.onDragEnter}
              onDragLeave={tool.onDragLeave}
              onDragOverZone={tool.onDragOverZone}
              onDrop={tool.onDrop}
            >
              <PromptsSqlBodyEditor
                activeTipo={tool.activeTipo}
                activePrompt={tool.activePrompt}
                canEdit={tool.canEdit}
                editBlockReason={tool.editBlockReason}
                loadBusy={tool.loadBusy}
                onBodyChange={(body) => tool.updateBody(tool.activeTipo, body)}
                onPersist={(body) => tool.saveOneInstruction(tool.activeTipo, body)}
              />
            </PromptsSqlTree>
          </div>

          <PromptsSqlMapeoTable
            activeTipo={tool.activeTipo}
            instruccionKeys={tool.instruccionKeys}
            prompts={tool.prompts}
            mapped={tool.mapped}
            canEdit={tool.canEdit}
            loggedIn={tool.loggedIn}
            modelSelectOptions={tool.modelSelectOptions}
            onSelectTipo={tool.setActiveTab}
            onUpdateConfig={tool.updateConfig}
            onOpenJconfig={(tipo) => tool.setJconfigDlg({ open: true, tipo })}
            onConfirmResetConfig={tool.confirmResetConfig}
          />
        </div>
      </Paper>

      <FileImportMapDialog
        open={tool.importDlg.open}
        onClose={() => tool.setImportDlg({ open: false, rows: [] })}
        rows={tool.importDlg.rows}
        instructionKeys={tool.instruccionKeys}
        onChangeRow={tool.onImportRowChange}
        onConfirm={tool.confirmFileImport}
      />

      <JconfigDetailDialog
        open={tool.jconfigDlg.open}
        onClose={() => tool.setJconfigDlg({ open: false, tipo: null })}
        tipo={tool.jconfigDlg.tipo}
        jc={tool.jconfigDlg.tipo ? tool.prompts[tool.jconfigDlg.tipo]?.jconfig : null}
        body={tool.jconfigDlg.tipo ? tool.prompts[tool.jconfigDlg.tipo]?.body : ""}
      />
    </div>
  );
}
