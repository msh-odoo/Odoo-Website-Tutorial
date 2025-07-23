import { BuilderAction } from "@html_builder/core/builder_action";
import { BaseOptionComponent, useDomState } from "@html_builder/core/utils";
import { Plugin } from "@html_editor/plugin";
import { rpc } from "@web/core/network/rpc";
import { _t } from "@web/core/l10n/translation";
import { registry } from "@web/core/registry";

export class ServiceCardOption extends BaseOptionComponent {
    static template = "website_local_services.ServiceCardOption";
    static props = {};
}

export class ServiceCardTooltipOption extends BaseOptionComponent {
    static template = "website_local_services.ServiceCardTooltipOption";
    static props = {};

    setup() {
        super.setup();
        this.state = useDomState((cardEl)=> {
            if (cardEl) {
                cardEl.dispatchEvent(new CustomEvent("content_changed", { bubbles: true }));
            }
        });
    }

}

class ServicesPageOption extends Plugin {
    static id = "ServicesPageOption";
    resources = {
        builder_options: [
            {
                template: "website_local_services.ServicesPageOption",
                selector: "div.js_services:has(#o_services_index_content)",
                editableOnly: false,
                reloadTarget: true,
                title: _t("Service Page"),
                groups: ["website.group_website_designer"],
            },
            {
                OptionComponent: ServiceCardOption,
                selector: "div.o_service_card",
                name: "serviceCardOption",
                editableOnly: false,
                // title: _t("Service Page"),
            },
            {
                OptionComponent: ServiceCardTooltipOption,
                selector: "div.o_service_card",
                name: "serviceCardTooltipOption",
                editableOnly: false,
                // title: _t("Service Page"),
            },
        ],
        builder_actions: {
            ToggleTagsOptionsAction,
        },
    };
}

export class ToggleTagsOptionsAction extends BuilderAction {
    static id = "toggleTagsOptions";
    setup() {
        this.reload = {};
    }
    isApplied({ editingElement: el, value }) {
        return value === this.getTagsOptions(el);
    }
    getValue({ editingElement: el }) {
        return this.getTagsOptions(el);
    }
    async clean(context) {
        await rpc("/website_local_services/config_service_tags", { enable_service_tags: "hide" });
    }
    async apply({ editingElement: el, value }) {
        await rpc("/website_local_services/config_service_tags", { enable_service_tags: value });
    }
    getTagsOptions(el) {
        return el.querySelector("[data-tags-options]").dataset.tagsOptions;
    }
}

registry.category("website-plugins").add(ServicesPageOption.id, ServicesPageOption);
