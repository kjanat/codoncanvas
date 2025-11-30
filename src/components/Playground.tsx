/**
 * Playground - Main CodonCanvas editor and execution environment
 *
 * Orchestrates the editor, canvas, and toolbar components with shared state.
 * Handles genome execution, history, keyboard shortcuts, and URL sharing.
 */

import { CodonReference } from "@/components/CodonReference";
import { KeyboardShortcutsHelp } from "@/components/KeyboardShortcutsHelp";
import { PlaygroundCanvas } from "@/components/PlaygroundCanvas";
import { PlaygroundEditor } from "@/components/PlaygroundEditor";
import { PlaygroundToolbar } from "@/components/PlaygroundToolbar";
import { usePlayground } from "./playground";

export function Playground() {
  const { state, actions, refs, examples, selectedExample, shortcuts } =
    usePlayground();

  return (
    <div className="flex h-full flex-col lg:flex-row">
      {/* Editor Panel */}
      <div className="flex flex-1 flex-col">
        <PlaygroundToolbar
          canRedo={state.canRedo}
          canRun={state.validation.isValid}
          canUndo={state.canUndo}
          copied={state.copied}
          examples={examples}
          nucleotideMode={state.nucleotideMode}
          onCopy={actions.handleCopyCode}
          onExampleChange={actions.handleExampleChange}
          onLoad={actions.handleLoad}
          onRedo={actions.handleRedo}
          onRun={actions.runGenome}
          onSave={actions.handleSave}
          onShare={actions.handleShare}
          onShowModeInfo={actions.setShowModeInfo}
          onToggleNucleotideMode={actions.handleToggleNucleotideMode}
          onToggleReference={() =>
            actions.setShowReference(!state.showReference)
          }
          onUndo={actions.handleUndo}
          selectedExampleKey={state.selectedExampleKey}
          showModeInfo={state.showModeInfo}
          showReference={state.showReference}
        />
        <PlaygroundEditor
          displayedGenome={state.displayedGenome}
          isPending={state.isPending}
          nucleotideMode={state.nucleotideMode}
          onGenomeChange={actions.handleGenomeChange}
          ref={refs.editorRef}
          stats={state.stats}
          validation={state.validation}
        />
      </div>

      {/* Canvas Panel */}
      <PlaygroundCanvas
        height={400}
        onClear={actions.clear}
        onExportPNG={actions.handleExportPNG}
        ref={refs.canvasRef}
        selectedExample={selectedExample}
        width={400}
      />

      {/* Reference Panel */}
      {state.showReference && (
        <CodonReference
          onInsert={actions.handleInsertCodon}
          onToggleCollapse={() => actions.setShowReference(false)}
        />
      )}

      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp
        isOpen={state.showShortcutsHelp}
        onClose={() => actions.setShowShortcutsHelp(false)}
        shortcuts={shortcuts}
      />
    </div>
  );
}

export default Playground;
