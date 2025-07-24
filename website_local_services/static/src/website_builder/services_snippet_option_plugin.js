import { Plugin } from "@html_editor/plugin";
import { _t } from "@web/core/l10n/translation";
import { registry } from "@web/core/registry";
import { ServiceCardOption, ServiceCardTooltipOption } from "./services_snippet_option";

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
