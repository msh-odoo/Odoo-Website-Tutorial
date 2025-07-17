import { Component } from "@odoo/owl";


export class AppointmentDialog extends Component {
    static template = "website_local_services.AppointmentDialog";
    static props = {
        onSave: Function,
        onClose: Function,
    };
}
