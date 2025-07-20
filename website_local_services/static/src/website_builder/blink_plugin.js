import { Component, xml, reactive, useState, useRef } from "@odoo/owl";
// import { StackingComponent, useStackingComponentState } from "@website/stacking_component";
import { Plugin } from "@html_editor/plugin";
import { withSequence } from "@html_editor/utils/resource";
import { _t } from "@web/core/l10n/translation";
import { registry } from "@web/core/registry";

class BlinkPlugin extends Plugin {
    static id = "blink";
    static dependencies = ["history", "selection", "split", "format"];
    resources = {
        // toolbar_groups: [withSequence(50, { id: "websiteDecoration" })],
        toolbar_items: [
            {
                id: "blink",
                groupId: "websiteDecoration",
                description: _t("Apply Blink Effect"),
                Component: BlinkToolbarButton,
                props: {
                    blinkConfiguratorProps: {
                        applyBlink: this.applyBlink.bind(this),
                        previewBlink: this.previewBlink.bind(this),
                        revertBlink: this.revertBlink.bind(this),
                        // applyBlinkStyle: this.applyHighlightStyle.bind(this),
                        // previewBlinkStyle: this.previewHighlightStyle.bind(this),
                        // revertBlinkStyle: this.revertHighlightStyle.bind(this),
                        getBlinkState: () => this.blinkState,
                        // getUsedCustomColors: this.getUsedCustomColors.bind(this),
                        deleteBlink: this.deleteSelectedBlink.bind(this),
                    },
                    onClick: this.completeBlinkSelection.bind(this),
                },
            },
        ],
    };

    setup() {
        this.previewableApplyBlink = this.dependencies.history.makePreviewableOperation(
            this._applyBlink.bind(this)
        );
        // this.previewableApplyHighlightStyle = this.dependencies.history.makePreviewableOperation(
        //     this._applyHighlightStyle.bind(this)
        // );
        this.blinkState = reactive({
            blinkId: undefined,
            color: "",
            // thickness: undefined,
        });
    }

    updateSelectedHighlight() {
        const nodes = this.getSelectedBlinkNodes();
        const uniqueNodes = new Set(nodes);
        if (uniqueNodes.size === 0) {
            this.highlightState.highlightId = undefined;
            this.highlightState.color = "";
            this.highlightState.thickness = undefined;
            return;
        }

        this.highlightState.highlightId =
            uniqueNodes.size > 1 ? "multiple" : getCurrentTextBlink(nodes[0]);
        if (this.highlightState.highlightId) {
            // If multiple highlights are selected, either show the common highlight properties
            // or nothing if none
            const style = nodes.map((node) =>
                getComputedStyle(node).getPropertyValue("--text-highlight-color")
            );
            this.highlightState.color = style.every((v) => v === style[0]) ? style[0] : undefined;
            const thickness = nodes.map((node) =>
                getComputedStyle(node).getPropertyValue("--text-highlight-width")
            );
            this.highlightState.thickness = thickness.every((v) => v === thickness[0])
                ? parseInt(thickness[0])
                : "";
        }
    }

    _applyBlink(highlightId) {
        // const highlightedNodes = this.getSelectedBlinkNodes();
        // for (const node of new Set(highlightedNodes)) {
        //     for (const svg of node.querySelectorAll(".o_text_highlight_svg")) {
        //         svg.remove();
        //     }
        // }

        // let thicknessToRestore;
        // let colorToRestore;
        // if (highlightedNodes.length > 0) {
        //     const style = getComputedStyle(highlightedNodes[0]);
        //     colorToRestore = style.getPropertyValue("--text-highlight-color");
        //     thicknessToRestore = style.getPropertyValue("--text-highlight-width");
        // }

        // this.dependencies.format.formatSelection("highlight", {
        //     formatProps: { highlightId, colorToRestore, thicknessToRestore },
        //     applyStyle: true,
        // });

        // this.updateSelectedHighlight();
    }

    applyBlink(highlightId) {
        // this.previewableApplyHighlight.commit(highlightId);
    }
    previewBlink(highlightId) {
        // this.previewableApplyHighlight.preview(highlightId);
    }
    revertBlink() {
        // this.previewableApplyHighlight.revert();
    }

    getSelectedBlinkNodes() {
        return this.dependencies.selection
            .getTargetedNodes()
            .map((n) => closestElement(n, ".o_text_highlight"))
            .filter(Boolean);
    }
    /**
     * This method completes the selection by ensuring that the selection
     * always cover all the text nodes within the highlighted elements.
     */
    completeBlinkSelection() {
        const targetedNodes = this.dependencies.selection
            .getTargetedNodes()
            .map(
                (n) =>
                    closestElement(n, ".o_text_highlight") ||
                    n?.querySelector?.(".o_text_highlight")
            );
        let { startContainer, startOffset, endContainer, endOffset, direction } =
            this.dependencies.selection.getEditableSelection();

        if (targetedNodes.length > 0) {
            if (targetedNodes[0]?.matches?.(".o_text_highlight")) {
                const firstTextNode = descendants(targetedNodes[0]).filter(isTextNode)[0];
                startContainer = firstTextNode;
                startOffset = 0;
            }
            if (targetedNodes.at(-1)?.matches?.(".o_text_highlight")) {
                const lastTextNode = descendants(targetedNodes.at(-1)).filter(isTextNode).at(-1);
                endContainer = lastTextNode;
                endOffset = nodeSize(endContainer);
            }
        }
        const [anchorNode, anchorOffset, focusNode, focusOffset] = direction
            ? [startContainer, startOffset, endContainer, endOffset]
            : [endContainer, endOffset, startContainer, startOffset];
        this.dependencies.selection.setSelection({
            anchorNode,
            anchorOffset,
            focusNode,
            focusOffset,
        });
        this.dependencies.selection.focusEditable();
        this.dependencies.history.stageSelection();
    }

    deleteSelectedBlink() {
        const highlightedNodes = this.getSelectedBlinkNodes();
        for (const node of new Set(highlightedNodes)) {
            for (const svg of node.querySelectorAll(".o_text_highlight_svg")) {
                svg.remove();
            }
        }

        this.dependencies.format.formatSelection("highlight", {
            applyStyle: false,
        });
        this.updateSelectedBlink();
    }

}

registry.category("website-plugins").add(BlinkPlugin.id, BlinkPlugin);

class BlinkToolbarButton extends Component {
    static props = {
        blinkConfiguratorProps: Object,
        onClick: Function,
        title: String,
        getSelection: Function,
    };
    static template = xml`
        <button t-ref="root" t-attf-class="btn btn-light o-select-highlight" t-on-click="openHighlightConfigurator" t-att-title="props.title">
            <i class="fa oi oi-text-effect oi-fw py-1"/>
        </button>
    `;

    setup() {
        this.blinkState = useState(this.props.blinkConfiguratorProps.getBlinkState());
        this.root = useRef("root");
        // this.componentStack = useStackingComponentState();
        // this.componentStack.push(HighlightConfigurator, {
        //     componentStack: this.componentStack,
        //     ...this.props.blinkConfiguratorProps,
        // });
        // this.configuratorPopover = usePopover(StackingComponent, {
        //     onClose: () => {
        //         while (this.componentStack.stack.length > 1) {
        //             this.componentStack.pop();
        //         }
        //     },
        // });
    }
    openBlinkConfigurator() {
        this.props.onClick();
        this.configuratorPopover.open(this.root.el, {
            stackState: this.componentStack,
            style: "max-height: 300px; width: 262px",
            class: "d-flex flex-column p-2",
        });
    }
}
