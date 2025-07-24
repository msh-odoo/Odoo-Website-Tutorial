import { Plugin } from "@html_editor/plugin";
import { _t } from "@web/core/l10n/translation";
import { registry } from "@web/core/registry";

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
        ],
    };
}

registry.category("website-plugins").add(ServicesPageOption.id, ServicesPageOption);
