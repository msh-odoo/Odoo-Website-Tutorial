# Part of Odoo. See LICENSE file for full copyright and licensing details.

from odoo import _, api, fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = 'res.config.settings'

    enabled_service_tags = fields.Boolean(string="Enable Service Tags",
                                                 config_parameter='website_local_services.enable_service_tags')
