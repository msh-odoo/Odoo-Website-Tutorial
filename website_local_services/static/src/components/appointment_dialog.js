import { Component } from "@odoo/owl";
// import { WebsiteDialog } from '@website/components/dialog/dialog';
import { Dialog } from "@web/core/dialog/dialog";


export class AppointmentDialog extends Component {
    static template = "website_local_services.AppointmentDialog";
    static components = { Dialog };
    static props = {
        onClickBook: Function,
        onClose: Function,
    };
}
