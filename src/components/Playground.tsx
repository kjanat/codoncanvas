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
          display={{
            nucleotideMode: state.nucleotideMode,
            onToggleNucleotideMode: actions.handleToggleNucleotideMode,
            showReference: state.showReference,
            onToggleReference: () =>
              actions.setShowReference(!state.showReference),
          }}
          examples={examples}
          execution={{
            canRun: state.validation.isValid,
            onRun: actions.runGenome,
          }}
          history={{
            canRedo: state.canRedo,
            canUndo: state.canUndo,
            onRedo: actions.handleRedo,
            onUndo: actions.handleUndo,
          }}
          io={{
            copied: state.copied,
            onCopy: actions.handleCopyCode,
            onLoad: actions.handleLoad,
            onSave: actions.handleSave,
            onShare: actions.handleShare,
          }}
          onExampleChange={actions.handleExampleChange}
          selectedExampleKey={state.selectedExampleKey}
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
