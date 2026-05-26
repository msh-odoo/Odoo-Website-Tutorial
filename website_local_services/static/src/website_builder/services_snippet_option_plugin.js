import { Plugin } from "@html_editor/plugin";
import { BuilderAction } from "@html_builder/core/builder_action";
import { registry } from "@web/core/registry";


class ServicesSnippetOptionPlugin extends Plugin {
    static id = "serviceCardDynamicOption";
    resources = {
        builder_actions: {
            NumberOfCardAction,
        },
        so_content_addition_selector: [".s_services"],
    };
}

class NumberOfCardAction extends BuilderAction {
    static id = "numberOfCardAction";
    getValue({ editingElement }) {
        debugger;
        const dynamicContent = editingElement.querySelector(".o_dynamic_content");
        return dynamicContent.dataset.numberOfElements || "4";
    }
    async apply({ editingElement, actionValue }) {
        debugger;
        const dynamicContent = editingElement.querySelector(".o_dynamic_content");
        dynamicContent.dataset.numberOfElements = actionValue;
    }
}

registry.category("website-plugins").add(ServicesSnippetOptionPlugin.id, ServicesSnippetOptionPlugin);
