import { Plugin } from "@html_editor/plugin";
import { _t } from "@web/core/l10n/translation";
import { registry } from "@web/core/registry";

class ViewModeOption extends Plugin {
    static id = "ViewModeOption";
    resources = {
        builder_options: [
            {
                template: "website_local_services.ViewModeOption",
                selector: "div.js_services:has(#o_services_index_content)",
                editableOnly: false,
                title: _t("Service Page"),
                groups: ["website.group_website_designer"],
            },
        ],
    };
}

registry.category("website-plugins").add(ViewModeOption.id, ViewModeOption);
