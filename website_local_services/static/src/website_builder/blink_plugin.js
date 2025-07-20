import { Component, xml, reactive, useState, useRef } from "@odoo/owl";
import { Plugin } from "@html_editor/plugin";
import { formatsSpecs } from "@html_editor/utils/formatting";
import { closestElement, descendants } from "@html_editor/utils/dom_traversal";
import { isTextNode } from "@html_editor/utils/dom_info";
import { nodeSize } from "@html_editor/utils/position";
import { _t } from "@web/core/l10n/translation";
import { registry } from "@web/core/registry";

function getCurrentTextBlink(el) {
    const blinkEl = el.closest(".o_text_blink");
    if (!blinkEl) {
        return;
    }
    return Array.from(blinkEl.classList)
        .find((cls) => cls.startsWith("o_text_blink_"))
        ?.replace("o_text_blink_", "");
}

formatsSpecs.blink = {
    isFormatted: (node) => closestElement(node)?.classList.contains("o_text_blink"),
    hasStyle: (node) => closestElement(node)?.classList.contains("o_text_blink"),
    addStyle: (node, { blinkId, colorToRestore }) => {
        node.classList.add("o_text_blink", `o_text_blink_${blinkId || 1}`);
        if (colorToRestore && colorToRestore !== "currentColor") {
            node.style.setProperty("--text-blink-color", colorToRestore);
        }
    },
    removeStyle: (node) => {
        removeClass(
            node,
            ...[...node.classList].filter((cls) => cls.startsWith("o_text_blink"))
        );
    },
};

class BlinkPlugin extends Plugin {
    static id = "blink";
    static dependencies = ["history", "selection", "split", "format"];
    resources = {
        toolbar_items: [
            {
                id: "blink",
                groupId: "websiteDecoration",
                description: _t("Apply Blink Effect"),
                Component: BlinkToolbarButton,
                props: {
                    blinkConfiguratorProps: {
                        applyBlink: this.applyBlink.bind(this),
                        getBlinkState: () => this.blinkState,
                        deleteBlink: this.deleteSelectedBlink.bind(this),
                    },
                    onClick: () => {
                        this.applyBlink();
                        this.completeBlinkSelection();
                    },
                },
            },
        ],
    };

    setup() {
        this.blinkState = reactive({
            blinkId: undefined,
            color: "",
        });
    }

    updateSelectedBlink() {
        const nodes = this.getSelectedBlinkNodes();
        const uniqueNodes = new Set(nodes);
        if (uniqueNodes.size === 0) {
            this.blinkStateState.highlightId = undefined;
            this.blinkState.color = "";
            return;
        }

        this.blinkState.blinkId =
            uniqueNodes.size > 1 ? "multiple" : getCurrentTextBlink(nodes[0]);
        if (this.blinkState.blinkId) {
            // If multiple highlights are selected, either show the common highlight properties
            // or nothing if none
            const style = nodes.map((node) =>
                getComputedStyle(node).getPropertyValue("--text-blink-color")
            );
            this.blinkState.color = style.every((v) => v === style[0]) ? style[0] : undefined;
        }
    }

    _applyBlink(blinkId) {
        if (!blinkId) {
            blinkId = "1";
        }
        const blinkNodes = this.getSelectedBlinkNodes();
        let colorToRestore;
        if (blinkNodes.length > 0) {
            const style = getComputedStyle(blinkNodes[0]);
            colorToRestore = style.getPropertyValue("--text-highlight-color");
        }

        this.dependencies.format.formatSelection("blink", {
            formatProps: { blinkId, colorToRestore },
            applyStyle: true,
        });

        this.updateSelectedBlink();
    }

    applyBlink(highlightId) {
        this._applyBlink();
    }

    getSelectedBlinkNodes() {
        return this.dependencies.selection
            .getTargetedNodes()
            .map((n) => closestElement(n, ".o_text_blink"))
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
                    closestElement(n, ".o_text_blink") ||
                    n?.querySelector?.(".o_text_blink")
            );
        let { startContainer, startOffset, endContainer, endOffset, direction } =
            this.dependencies.selection.getEditableSelection();

        if (targetedNodes.length > 0) {
            if (targetedNodes[0]?.matches?.(".o_text_blink")) {
                const firstTextNode = descendants(targetedNodes[0]).filter(isTextNode)[0];
                startContainer = firstTextNode;
                startOffset = 0;
            }
            if (targetedNodes.at(-1)?.matches?.(".o_text_blink")) {
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
        this.dependencies.format.formatSelection("blink", {
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
        <button t-ref="root" t-attf-class="btn btn-light o-select-blink" t-on-click="applyBlink" t-att-title="props.title">
            <i class="fa fa-solid fa-eye"></i>
        </button>
    `;

    setup() {
        this.blinkState = useState(this.props.blinkConfiguratorProps.getBlinkState());
        this.root = useRef("root");
    }
    applyBlink() {
        this.props.onClick();
    }
}
