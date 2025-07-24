import { BaseOptionComponent, useDomState } from "@html_builder/core/utils";
import { Plugin } from "@html_editor/plugin";
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

class ServicesSnippetOption extends Plugin {
    static id = "ServicesSnippetOption";
    resources = {
        builder_options: [
            {
                OptionComponent: ServiceCardOption,
                selector: ".s_services .o_carousel_service_card",
                name: "serviceCardOption",
                editableOnly: false,
                // title: _t("Service Page"),
            },
            {
                OptionComponent: ServiceCardTooltipOption,
                selector: ".s_services .o_carousel_service_card",
                name: "serviceCardTooltipOption",
                editableOnly: false,
                // title: _t("Service Page"),
            },
        ],
    };
}

registry.category("website-plugins").add(ServicesSnippetOption.id, ServicesSnippetOption);
